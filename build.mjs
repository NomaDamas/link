// src/의 템플릿과 문구로 언어별 정적 페이지를 만든다. 의존성 없이 Node만 있으면 된다.
//   node build.mjs          index.html, ko/, en/, cn/, jp/ 를 다시 쓴다
//   node build.mjs --check  다시 쓰지 않고, 커밋된 파일이 src/와 어긋나면 실패한다
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SITE = "https://link.nomadamas.org";
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

const cfg = JSON.parse(read("src/strings.json"));
const page = read("src/page.html");
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

// 언어 링크는 상대 경로라 임시 주소와 로컬 서버에서도 그대로 동작한다
const langLink = (l, from, current) =>
	`<a href="${from}${l}/" hreflang="${cfg.pages[l].lang}" lang="${cfg.pages[l].lang}" data-lang="${l}"${current ? ' aria-current="page"' : ""}>${cfg.pages[l].name}</a>`;

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
			langNav: langs.map((x) => langLink(x, "../", x === l)).join("\n    "),
		},
		`${l}/index.html`,
	);
}
outputs["index.html"] = fill(
	root,
	{
		...cfg.root,
		hreflang,
		favicon,
		langs: JSON.stringify(langs),
		match: JSON.stringify(cfg.match),
		fallback: cfg.fallback,
		fallbackLinks: langs.map((x) => langLink(x, "", false)).join("\n    "),
	},
	"index.html",
);

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
