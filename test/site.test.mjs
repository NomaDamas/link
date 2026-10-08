// 커밋된 페이지가 지켜야 할 약속을 브라우저 없이 확인한다. node --test test/site.test.mjs로 돌린다.
// 레이아웃, 테마, 클릭 같은 브라우저 동작은 여기서 보지 않는다
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const cfg = JSON.parse(read("src/strings.json"));
const langs = Object.keys(cfg.pages);
const channels = cfg.profiles.sources;

const langPages = langs.map((l) => `${l}/index.html`);
const privacyPages = langs.map((l) => `${l}/privacy/index.html`);
const channelPages = channels.map((c) => `${c}/index.html`);
const redirectPages = ["index.html", "privacy/index.html", ...channelPages];
const all = [...langPages, ...privacyPages, ...redirectPages];

// 분석 도구를 부르는 코드. 안내 본문에 나오는 도메인 이름과 헷갈리지 않게 스크립트 주소와 호출만 본다
const LOADER = /googletagmanager\.com\/gtag\/js|clarity\.ms\/tag\/|gtag\(|window\.clarity/;
const GUARD = 'if (location.hostname !== "link.nomadamas.org") return;';
const NOINDEX = '<meta name="robots" content="noindex">';

test("채워지지 않은 {{자리}}가 없다", () => {
	for (const rel of all) assert.doesNotMatch(read(rel), /\{\{\w+\}\}/, rel);
});

test("분석 도구는 언어 페이지에서만, 실제 주소일 때만 부른다", () => {
	for (const rel of langPages) {
		const scripts = [...read(rel).matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
		const withLoader = scripts.filter((s) => LOADER.test(s));
		assert.ok(withLoader.length > 0, `${rel}: 분석 코드가 없음`);
		for (const s of withLoader) {
			const guard = s.indexOf(GUARD);
			assert.ok(guard > -1, `${rel}: 실제 주소 확인 없이 분석 코드를 부름`);
			assert.ok(guard < s.search(LOADER), `${rel}: 주소 확인보다 분석 코드가 먼저 나옴`);
		}
	}
	for (const rel of [...privacyPages, ...redirectPages]) assert.doesNotMatch(read(rel), LOADER, rel);
});

test("안내 페이지와 채널 주소는 검색에서 빼고, 언어 페이지와 첫 화면은 남긴다", () => {
	for (const rel of [...privacyPages, "privacy/index.html", ...channelPages]) assert.ok(read(rel).includes(NOINDEX), rel);
	for (const rel of [...langPages, "index.html"]) assert.ok(!read(rel).includes(NOINDEX), rel);
});

test("언어 페이지는 서로를 hreflang으로 가리키고, 하단에서 안내로 이어진다", () => {
	for (const rel of langPages) {
		const html = read(rel);
		for (const l of langs) {
			assert.ok(html.includes(`hreflang="${cfg.pages[l].lang}" href="https://link.nomadamas.org/${l}/"`), `${rel}: ${l}`);
		}
		assert.ok(html.includes('hreflang="x-default" href="https://link.nomadamas.org/"'), `${rel}: x-default`);
		assert.ok(html.includes('href="privacy/"'), `${rel}: 하단 안내 링크`);
	}
});

test("안내 페이지는 갱신일을 적고, 바깥 링크는 모두 https다", () => {
	for (const l of langs) {
		const html = read(`${l}/privacy/index.html`);
		assert.ok(html.includes(`<time datetime="${cfg.privacyDate}">${cfg.pages[l].privacyUpdated}</time>`), l);
		for (const [, href] of html.matchAll(/<a href="(https?:[^"]+)"/g)) assert.ok(href.startsWith("https://"), `${l}: ${href}`);
	}
});

test("상대 링크가 모두 실제 파일을 가리킨다", () => {
	for (const rel of all) {
		for (const [, href] of read(rel).matchAll(/href="([^"]+)"/g)) {
			if (/^(https?:|data:|#|mailto:)/.test(href)) continue;
			let target = normalize(join(dirname(rel), href.split(/[?#]/)[0]));
			if (target.endsWith("/") || target === ".") target = join(target, "index.html");
			assert.ok(existsSync(join(ROOT, target)), `${rel}: ${href} -> ${target}`);
		}
	}
});

test("채널 주소는 폴더 이름을 utm_source로 붙인다", () => {
	for (const c of channels) assert.ok(read(`${c}/index.html`).includes(`"utm_source":"${c}"`), c);
});
