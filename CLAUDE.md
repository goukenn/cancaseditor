# CLAUDE.md

Guidance for Claude Code when working in `Views/cancaseditor`.

## What this is

CancasEditor: a 2D canvas/SVG graphic editor in JavaScript, written as a **Balafon view environment**. It is not a standalone app: it is a sub-folder of the `igk_default` Project (`../../`, i.e. `Projects/igk_default/Views/cancaseditor`) and has its **own git repository** (branch `develop`, commit style `editor: <what changed>`). The parent project's `.gitignore`/status does not cover it.

- Test URL: `https://local.com:8085/cancaseditor/` (served by the full BALAFON core, which mounts `igk_default`). There is no build step, bundler, test suite or lint command here; verify by loading the URL in a browser.
- Mirror checkout also exists at `/Volumes/Data/Dev/PHP/balafon_site_dev/src/application/Projects/igk_default/Views/cancaseditor`; edit the primary working directory.
- Do not touch the Balafon core lib. Everything the app needs lives in this folder, except the DB schema, models and translations, which belong to the parent `igk_default` Project (`Data/data.schema.xml`, `Lib/Classes/Models/Cancas*`, `Configs/Lang/lang.{fr,en,nl}.presx`, keys prefixed `cancas.`).
- Parent-project conventions (Balafon CLI, `data.schema.xml` rules, no `cl` column prefix, etc.) are in `../../CLAUDE.md` and `~/.claude/CLAUDE.md`.

## Layout

- `default.phtml` — entry view. Defines the `CE_*` constants, then `igk_view_handle_actions` serves sub-routes: `assets`, `lang/<fr|en|nl>.json` (the `cancas.*` entries of the lang `.presx`), `manifest.json`, `favicon.ico`, `cancas-app.sw.js`, `settings`, `plugins`, `about`, `share`, and the `(@error)` 404 handler.
- `.common.pinc` — shared helpers: `igk_html_node_CancasEditorApp()` (the `div.igk-cancas-editor-app` host node) and `load_cancas_scripts()`, which adds every `Scripts/**/*.js` as a `defer` script (alphabetical; skips `node_modules`, `git` and `*.autoload.js`). `load.phtml` calls it.
- `.header.pinc` / `.footer.pinc` — document head setup (PWA, BMC, `igk/bge` modules, fonts, favicon) and footer.
- `Scripts/` — the client app. `.cancaseditor.js` (~6k lines) is the core (namespace `igk.winui.cancasEditor`, built on the `igk` JS lib from the core); one file per concern around it:
  - `tools/` editor tools and dialogs (inspector, layers, color, filter, rulers, CSS export, storage...)
  - `actions/` (`drawing2D/`, `mecanismActions/`) menu/shortcut actions
  - `drawing2d/`, `drawing3d/` (`gle*` objects, module `igk/bge`), `drawing/`, `sketch/`
  - `visitors/` (canvas, png, svg, xml renderers) and `encoder/` (gkds, svg, xml, mp4, obj) — export/serialization
  - `history/`, `services/`, `gui/`, `views/`, `math/`, `enums/`, `exceptions/`, `caches/`, `assets/` (icons, `Lang/res.*.json`)
  - `.cancaseditor.d.js` — type declarations; `jsconfig.json` (`allowJs`, no `checkJs`); `package.json` is metadata only.
  - `.autoload.js` — ES-module import manifest (`@/lib/cancalib/...`) for an external bundler; it is **not** loaded by the PHP view. When adding/removing a script, keep it in sync, but `load_cancas_scripts` is what actually serves the app.
- `Lib/Classes/` — `Surfaces.php` (`Com\IGKDEV\App\CancasEditor\Surfaces`) and `Actions/CancasActions.php`; server side of user surfaces/options/plugins sync for logged-in users.
- `Styles/default.pcss`, `Styles/themes/` — PCSS styles (all the static styles of the tools and dialogs).
- `Data/` — `R/Img/favicon.ico`, `packages/`. `wiki/`, `modelapp/`, `svg.phtml`, `ipad.phtml`, `wiki.phtml` — secondary views.
- `Docs/` — documentation (`documentation.md`/`.docx`). Functional specs are in the parent project: `../../Docs/spec-cancaseditor.md` (French, with `.en.md` and `.json` metadata). **Read it before changing a feature**, and update it when a feature changes.

## Working conventions

- Script load order is alphabetical, so a file may only rely at load time on files that sort before it (core first via the dotted name `.cancaseditor.js`); defer other cross-file use to runtime.
- Static styles live in `Styles/default.pcss` (class names in the scripts, no `<style>` injection or `cssText`); only values computed at runtime (positions, sizes, colors from data) stay inline.
- User-visible strings use `cancas.*` translation keys (fr/en/nl), not hard-coded text.
- After changing a view or the UI, load `https://local.com:8085/cancaseditor/` and check rendering and the browser console before calling it done (the browser tools are available for this).
- Browser caching: the app registers a service worker (`cancas-app.sw.js`, cache `cancaseditor-<CE_CACHE_VERSION>`); if changes do not show up, bump the cache version or unregister the worker.
- Do not commit `.vscode/` (git-ignored, contains FTP sync settings and credentials) and never copy its contents anywhere.
- Prefer concise answers; ask when Balafon framework behaviour is unclear rather than guessing.
