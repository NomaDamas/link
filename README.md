# link

NomaDamas의 GitHub와 SNS 채널을 한 장에 모은 페이지입니다. 한국어, 영어, 중국어(간체), 일본어로 냅니다.

https://link.nomadamas.org

## 구성

- `src/page.html`이 언어별 페이지의 틀이고, 언어마다 달라지는 문구는 `src/strings.json`에 있습니다.
- 색과 글꼴 토큰은 `src/tokens.css` 한 곳에 있고, 빌드가 링크 페이지와 안내 페이지 틀의 `{{tokens}}` 자리에 넣습니다. 색을 바꿀 때는 이 파일만 고치면 됩니다.
- `node build.mjs`가 이것들을 합쳐 언어 폴더 `ko/`, `en/`, `cn/`, `jp/`와 그 아래 방문 분석 안내(`privacy/`), 채널 폴더(`threads/`, `x/` 등, 아래 "프로필에 거는 주소"), 첫 화면 `index.html`, 안내 주소 `privacy/index.html`을 만듭니다. Node만 있으면 되고 설치할 패키지는 없습니다.
- 만든 파일도 커밋합니다. GitHub Pages가 빌드 단계 없이 `main` 브랜치 루트를 그대로 배포하기 때문입니다.
- 만든 파일을 직접 고치면 다음 빌드에서 덮어써집니다. `src/`를 고치고 `node build.mjs`를 돌린 뒤, `node build.mjs --check`가 통과하는지 보면 됩니다.
- 커스텀 도메인은 Pages 설정에서 걸며, 걸면 GitHub이 `CNAME` 파일을 main에 커밋합니다. `.nojekyll`은 Jekyll 처리를 끄는 빈 파일입니다.
- DNS는 Cloudflare에서 `link` CNAME을 `nomadamas.github.io`로 두고 프록시는 끕니다. blog.nomadamas.org와 같은 방식입니다.
- 커스텀 도메인을 빼면 GitHub Pages가 조직 사이트 도메인 아래 `blog.nomadamas.org/link/`로 보여 줍니다.

## 언어

- 첫 화면 `/`는 내용 없이 언어만 골라 해당 페이지로 옮깁니다. 고르는 순서는 다음과 같습니다.
    1. 방문자가 페이지 오른쪽 위 언어 토글에서 직접 고른 언어 (`localStorage`의 `nd-lang`)
    2. 브라우저 언어 (`ko`는 `ko/`, `en`은 `en/`, `zh`는 `cn/`, `ja`는 `jp/`)
    3. 둘 다 없으면 `en/`
- 옮길 때 쿼리와 해시를 그대로 붙이므로 프로필 주소의 UTM이 남습니다. 주소는 상대 경로라 임시 주소에서도 맞게 갑니다.
- 언어 페이지는 `hreflang`으로 서로를 가리키고, `x-default`는 첫 화면입니다.
- 슬로건 `build fun things`는 모든 언어에서 영어 그대로 둡니다. 그 아래 한 줄 소개만 언어별로 씁니다.
- 언어를 더하려면 `src/strings.json`의 `pages`에 항목을 하나 넣고, `match`에 브라우저 언어 코드를 이은 뒤 다시 빌드하면 됩니다. 그 언어의 안내 본문 `src/privacy/<언어>.html`이 없으면 빌드가 멈춥니다.

## 링크 고치기

- `src/page.html`의 `<ul class="links">` 안에서 `<a>` 하나가 채널 하나입니다. 고친 뒤 다시 빌드합니다.
- 같은 주소가 `<head>`의 JSON-LD `sameAs`에도 있으니 함께 고치면 됩니다.
- `<a>`의 `id`는 GA에서 링크를 가르는 값이라, 기존 링크의 `id`는 바꾸지 않는 편이 좋습니다.

## 측정 (GA4)

- 링크 페이지 전용 속성 `NomaDamas 링크`를 씁니다. 측정 ID는 `G-QG2DERJBRQ`(`src/strings.json`의 `gaId`)이고, 블로그 속성(`G-ZTXBV8QP9G`)과 데이터가 섞이지 않습니다.
- 태그는 `link.nomadamas.org`에서 열렸을 때만 불러옵니다. 임시 주소 `blog.nomadamas.org/link/`와 로컬 미리보기는 집계하지 않습니다.
- 첫 화면 `/`에는 태그가 없습니다. 첫 화면이 원래 리퍼러를 `sessionStorage`의 `nd-ref`에 남기고, 옮겨 간 언어 페이지가 그 값을 `page_referrer`로 보냅니다. 그래서 유입 경로가 `link.nomadamas.org` 자신으로 덮이지 않습니다.
- 데이터 보관 기간은 14개월입니다(기본값 2개월에서 바꿈).
- 링크 클릭은 향상된 측정의 이탈 클릭이 `click` 이벤트(`outbound` = true)로 남깁니다. 어느 링크인지는 `link_id`(github, blog, threads, x, linkedin, instagram, youtube, tiktok, facebook)와 `link_url`로 볼 수 있습니다.
- GitHub로 나간 클릭은 맞춤 이벤트 `github_click`(`event_name` 같음 `click`, `link_domain` 같음 `github.com`)으로 따로 세고 주요 이벤트로 표시해 두었습니다. 블로그 속성과 같은 정의입니다.
- 언어별로 보려면 페이지 경로 `/ko/`, `/en/`, `/cn/`, `/jp/`로 거르면 됩니다.

## 측정 (Clarity)

- 히트맵과 방문 재생은 Microsoft Clarity 프로젝트 `NomaDamas 링크`가 맡습니다. 프로젝트 ID는 `ytxqbp0xlk`(`src/strings.json`의 `clarityId`)이고, 블로그 프로젝트(`ymsihkybmh`)와 따로 둡니다.
- 불러오는 조건은 GA와 같습니다. `link.nomadamas.org`의 언어 페이지에서만 불러오고, 첫 화면과 채널 주소, 안내 페이지에는 없습니다.
- 언어 페이지는 첫 화면에서 넘어오므로 Clarity가 보는 리퍼러는 첫 화면 주소입니다. 그래서 `nd-ref`의 원래 리퍼러에서 사이트 이름만 뽑아 맞춤 태그 `entry_referrer`로 남깁니다(리퍼러가 비었으면 `(direct)`). 대시보드 필터의 맞춤 태그에서 고를 수 있습니다. 채널 주소로 들어온 방문은 UTM이 주소에 남아 있어 따로 손댈 것이 없습니다.
- 설정은 블로그 프로젝트와 같습니다. 쿠키 켜짐, 봇 감지 켜짐, 마스킹 "균형 잡힘"(기본)이고, 업계는 "기타"입니다.
- 유럽경제지역, 영국, 스위스 방문자에게는 Clarity가 동의 신호를 기다리는 동의 모드가 기본으로 켜져 있습니다. 이 사이트는 동의 신호를 보내지 않으므로 그 지역 방문은 쿠키 없이 페이지마다 따로 기록됩니다.
- 보관 기간은 Clarity가 정합니다. 방문 재생 30일, 히트맵과 클릭 9개월입니다.

## 방문 분석 안내

GA4 약관은 사이트에 Google 애널리틱스를 쓴다는 사실과 쿠키 사용을 알리도록 요구합니다. Clarity 약관은 Microsoft 같은 제3자가 방문자의 개인정보를 모을 수 있다는 것, Microsoft가 Microsoft Advertising 제공을 위해 그 정보를 모으거나 받는다는 것, 거부 방법, Microsoft 개인정보처리방침 링크를 안내하도록 요구합니다. 그래서 언어마다 안내 페이지를 둡니다.

- 주소는 `/ko/privacy/`, `/en/privacy/`, `/cn/privacy/`, `/jp/privacy/`이고, 각 언어 페이지 하단 링크에서 들어갑니다. `/privacy/`는 첫 화면처럼 언어를 골라 해당 안내로 옮깁니다.
- 틀은 `src/privacy.html`, 본문은 `src/privacy/<언어>.html`입니다. 제목, 하단 링크 문구, 갱신일 표기는 `src/strings.json`의 `privacyLabel`, `privacyTitle`, `privacyDescription`, `privacyUpdated`에, 기계가 읽는 갱신일은 `privacyDate`에 있습니다.
- 안내 페이지에는 GA와 Clarity를 싣지 않고 `noindex`를 겁니다.
- 측정 ID, 프로젝트 ID, 이벤트, 쿠키, 보관 기간, 브라우저 저장 값(`nd-lang`, `nd-theme`, `nd-ref`) 가운데 하나라도 바뀌면 네 언어 본문과 갱신일을 함께 고칩니다. 실제로 켜진 도구만 적습니다.
- 본문의 쿠키 만료 기간은 2026-10-07에 실제 브라우저로 잰 값입니다(`_clck` 365일, `_clsk` 1일, Microsoft 쪽 `MUID` 390일, `CLID` 365일). Clarity 쿠키 문서에는 만료 기간이 없습니다.

## 프로필에 거는 주소

인앱 브라우저는 리퍼러를 비우는 경우가 많습니다. 프로필마다 채널 주소를 걸어 두면 GA4의 세션 소스가 채널별로 갈립니다. 언어는 채널 주소가 골라 주므로 채널마다 주소 하나씩만 걸면 됩니다.

| 프로필 | 거는 주소 |
|---|---|
| Threads | `https://link.nomadamas.org/threads` |
| X | `https://link.nomadamas.org/x` |
| LinkedIn | `https://link.nomadamas.org/linkedin` |
| Instagram | `https://link.nomadamas.org/instagram` |
| YouTube | `https://link.nomadamas.org/youtube` |
| TikTok | `https://link.nomadamas.org/tiktok` |
| Facebook | `https://link.nomadamas.org/facebook` |

- 채널 주소는 첫 화면과 똑같이 언어를 골라 옮기면서 `utm_source=<폴더 이름>&utm_medium=social&utm_campaign=profile`을 붙입니다. 들어올 때 붙어 있던 다른 쿼리(Meta가 덧붙이는 `utm_content`, `fbclid` 등)는 그대로 넘깁니다.
- 채널 주소는 검색에 잡히지 않게 `noindex`를 겁니다.
- 채널을 더하려면 `src/strings.json`의 `profiles.sources`에 이름을 넣고 다시 빌드합니다. 언어 폴더와 같은 이름이면 빌드가 멈춥니다.
- 예전 형식인 `https://link.nomadamas.org/?utm_source=<채널>&utm_medium=social&utm_campaign=profile`도 그대로 동작합니다.
