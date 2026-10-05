# link

NomaDamas의 GitHub와 SNS 채널을 한 장에 모은 페이지입니다.

https://link.nomadamas.org

## 구성

- `index.html` 한 파일이 전부입니다. 빌드 단계 없이 GitHub Pages가 `main` 브랜치 루트를 그대로 배포합니다.
- `CNAME`은 커스텀 도메인 설정이고, `.nojekyll`은 Jekyll 처리를 끄는 빈 파일입니다.
- DNS는 Cloudflare에서 `link` CNAME을 `nomadamas.github.io`로 두고 프록시는 끕니다. blog.nomadamas.org와 같은 방식입니다.

## 링크 고치기

- `index.html`의 `<ul class="links">` 안에서 `<a>` 하나가 채널 하나입니다.
- 같은 주소가 `<head>`의 JSON-LD `sameAs`에도 있으니 함께 고치면 됩니다.
- `<a>`의 `id`는 GA에서 링크를 가르는 값이라, 기존 링크의 `id`는 바꾸지 않는 편이 좋습니다.

## 측정 (GA4)

- 속성은 blog.nomadamas.org와 같은 `G-ZTXBV8QP9G`입니다. 보고서에서 호스트 이름 `link.nomadamas.org`로 거르면 됩니다.
- 태그는 `link.nomadamas.org`에서 열렸을 때만 불러옵니다. 로컬에서 파일을 열어 보는 것은 집계되지 않습니다.
- 링크 클릭은 향상된 측정의 이탈 클릭이 `click` 이벤트(`outbound` = true)로 남깁니다. 어느 링크인지는 `link_id`(github, threads, x, instagram, youtube, tiktok, facebook)와 `link_url`로 볼 수 있습니다.

## 프로필에 거는 주소

인앱 브라우저는 리퍼러를 비우는 경우가 많습니다. 프로필마다 UTM을 붙인 주소를 걸어 두면 GA4의 세션 소스가 채널별로 갈립니다.

| 프로필 | 거는 주소 |
|---|---|
| Threads | `https://link.nomadamas.org/?utm_source=threads&utm_medium=social&utm_campaign=profile` |
| X | `https://link.nomadamas.org/?utm_source=x&utm_medium=social&utm_campaign=profile` |
| Instagram | `https://link.nomadamas.org/?utm_source=instagram&utm_medium=social&utm_campaign=profile` |
| YouTube | `https://link.nomadamas.org/?utm_source=youtube&utm_medium=social&utm_campaign=profile` |
| TikTok | `https://link.nomadamas.org/?utm_source=tiktok&utm_medium=social&utm_campaign=profile` |
| Facebook | `https://link.nomadamas.org/?utm_source=facebook&utm_medium=social&utm_campaign=profile` |
| LinkedIn | `https://link.nomadamas.org/?utm_source=linkedin&utm_medium=social&utm_campaign=profile` |
