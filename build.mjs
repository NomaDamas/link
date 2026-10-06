// src/의 템플릿과 문구로 언어별 정적 페이지를 만든다. 의존성 없이 Node만 있으면 된다.
//   node build.mjs          index.html, 언어 폴더(ko/ en/ cn/ jp/)와 그 아래 방문 분석 안내(privacy/),
//                           채널 폴더(threads/ x/ ...), 안내 주소(privacy/)를 다시 쓴다
//   node build.mjs --check  다시 쓰지 않고, 커밋된 파일이 src/와 어긋나면 실패한다
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = "https://link.nomadamas.org";
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

// 색과 글꼴 토큰은 src/tokens.css 한 곳에 두고, 링크 페이지와 안내 페이지 틀의 {{tokens}} 자리에 넣는다
const tokens = read("src/tokens.css").trimEnd();
const withTokens = (rel) => {
	const tpl = read(rel);
	if (!tpl.includes("{{tokens}}")) throw new Error(`${rel}: {{tokens}} 자리가 없습니다`);
	return tpl.replace("{{tokens}}", () => tokens);
};

const cfg = JSON.parse(read("src/strings.json"));
const page = withTokens("src/page.html");
const privacy = withTokens("src/privacy.html");
const root = read("src/root.html");
const langs = Object.keys(cfg.pages);
const favicon = page.match(/<link rel="icon"[^>]*>/)[0];

// 빠진 값이 있으면 빈칸으로 두지 않고 멈춘다
function fill(tpl, vars, name) {
	return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
		if (!(key in vars)) throw new Error(`${name}: {{${key}}}에 넣을 값이 없습니다`);
		return vars[key];
	});
}

const hreflang = [
	...langs.map((l) => `<link rel="alternate" hreflang="${cfg.pages[l].lang}" href="${SITE}/${l}/">`),
	`<link rel="alternate" hreflang="x-default" href="${SITE}/">`,
].join("\n");

// 언어 링크는 상대 경로라 임시 주소와 로컬 서버에서도 그대로 동작한다. tail은 언어 폴더 뒤에 붙는 경로와 쿼리다
const langLink = (l, from, current, tail = "") =>
	`<a href="${from}${l}/${tail}" hreflang="${cfg.pages[l].lang}" lang="${cfg.pages[l].lang}" data-lang="${l}"${current ? ' aria-current="page"' : ""}>${cfg.pages[l].name}</a>`;
const queryOf = (utm) =>
	Object.keys(utm).length ? `?${new URLSearchParams(utm).toString().replace(/&/g, "&amp;")}` : "";

const outputs = {};
for (const l of langs) {
	const p = cfg.pages[l];
	outputs[`${l}/index.html`] = fill(
		page,
		{
			...p,
			dir: l,
			gaId: cfg.gaId,
			hreflang,
			ogLocaleAlternates: langs
				.filter((x) => x !== l)
				.map((x) => `<meta property="og:locale:alternate" content="${cfg.pages[x].ogLocale}">`)
				.join("\n"),
			langCode: l.toUpperCase(),
			langNav: langs.map((x) => langLink(x, "../", x === l)).join("\n      "),
		},
		`${l}/index.html`,
	);
	// 방문 분석 안내는 언어 폴더 아래 privacy/에 둔다. 본문은 src/privacy/<언어>.html에 있다
	outputs[`${l}/privacy/index.html`] = fill(
		privacy,
		{
			...p,
			favicon,
			privacyDate: cfg.privacyDate,
			privacyBody: read(`src/privacy/${l}.html`).trimEnd(),
		},
		`${l}/privacy/index.html`,
	);
}
// 첫 화면, 채널 주소, 안내 주소는 같은 틀을 쓴다. 한 단계 아래 폴더는 ../로 나가고,
// 채널 주소는 그 채널의 UTM을 덧씌우며, 안내 주소는 고른 언어 폴더 뒤에 privacy/를 붙인다
const rootPage = (rel, { base = "", utm = {}, path = "" } = {}) =>
	fill(
		root,
		{
			...cfg.root,
			hreflang,
			favicon,
			langs: JSON.stringify(langs),
			match: JSON.stringify(cfg.match),
			fallback: cfg.fallback,
			base,
			path,
			utm: JSON.stringify(utm),
			robots: base ? '\n<meta name="robots" content="noindex">' : "",
			fallbackLinks: langs.map((x) => langLink(x, base, false, path + queryOf(utm))).join("\n    "),
		},
		rel,
	);
outputs["index.html"] = rootPage("index.html");
outputs["privacy/index.html"] = rootPage("privacy/index.html", { base: "../", path: "privacy/" });

// 프로필에 거는 채널 주소. 폴더 이름이 곧 utm_source 값이다
const taken = new Set([...langs, "src", "privacy"]);
for (const source of cfg.profiles.sources) {
	if (taken.has(source)) throw new Error(`채널 이름 ${source}이 다른 폴더와 겹칩니다`);
	taken.add(source);
	outputs[`${source}/index.html`] = rootPage(`${source}/index.html`, {
		base: "../",
		utm: { utm_source: source, ...cfg.profiles.utm },
	});
}

if (process.argv.includes("--check")) {
	const stale = Object.entries(outputs)
		.filter(([rel, html]) => !existsSync(join(ROOT, rel)) || read(rel) !== html)
		.map(([rel]) => rel);
	if (stale.length) {
		console.error(`src/와 어긋난 파일: ${stale.join(", ")}. node build.mjs로 다시 만드세요.`);
		process.exit(1);
	}
	console.log("모든 페이지가 src/와 일치합니다.");
} else {
	for (const [rel, html] of Object.entries(outputs)) {
		mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
		writeFileSync(join(ROOT, rel), html);
		console.log(`wrote ${rel}`);
	}
}
