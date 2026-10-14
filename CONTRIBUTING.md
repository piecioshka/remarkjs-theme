# Contributing 🤝

## Setup 🛠️

```bash
nvm use
npm install
npx playwright install chromium
```

## Scripts 📜

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm start`            | serves the repo, demo at `/demo/` (port 4401) |
| `npm test`             | Playwright tests against the demo             |
| `npm run lint`         | ESLint                                        |
| `npm run format`       | Prettier, writes changes                      |
| `npm run format:check` | Prettier, check only (also in CI)             |

## Layout 🗂️

| Path                        | What it is                                                         |
| --------------------------- | ------------------------------------------------------------------ |
| `remark-theme.js`           | the plugin, the only file users need                               |
| `demo/`                     | demo deck used by the tests and published on GitHub Pages          |
| `demo/vendor/remark.min.js` | remark.js 0.14.1, vendored so the demo works without a CDN         |
| `tests/`                    | Playwright tests, `tests/fixtures/` has a deck with custom options |
| `scripts/serve.mjs`         | tiny static server for `npm start` and the Playwright web server   |
| `assets/screenshot.png`     | README image, captured from the demo                               |

## How it works 🔧

- `remarkTheme()` reads the user's choice from `localStorage` and falls back to `matchMedia("(prefers-color-scheme: dark)")`. It sets the result as `data-theme` on `<html>` synchronously, so when it runs before `remark.create()` the first paint already has the right colors.
- The key listener runs in the capture phase on `document`, before remark's listeners on `window`, and stops propagation so remark never sees the key.
- Pressing the key stores the theme. From then on the system setting is ignored until `reset()` removes the stored value; a `change` listener on the media query keeps following the system while nothing is stored.
- Every change dispatches `remark-theme-change` on `<html>` with `detail.theme`.
- The help row is inserted into the first table of `.remark-help-content`, right before "Toggle this help". With `sourceUrl` remark builds that table asynchronously, so a `MutationObserver` waits for it.

## Releasing 🏷️

1. Bump the version in `package.json`, in the header of `remark-theme.js` and in the URLs in `README.md`.
2. Commit, then tag: `git tag v<version> && git push && git push origin v<version>`.
3. `gh release create v<version> --generate-notes`.

jsDelivr serves the file from the tag, so the URLs in the README work as soon as the tag is pushed.

> [!IMPORTANT]
> The package is `private` and is not published to npm. Users install it by copying the file or from jsDelivr.
