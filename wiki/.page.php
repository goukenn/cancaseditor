<?php
// @file: wiki/.page.php
// @desc: html template of the wiki page (plain php include: the phtml reader of the view cannot parse short echo tags in attributes)
/** @var array $content @var string $home @var callable $h */
$langs = ["fr", "en", "nl"];
?>
<style>
.cew{--bg:#040816;--panel:#10172b;--fg:#e8eaf3;--dim:#9aa3bd;--line:#26304d;--accent:#8b7bff;--accent-bg:#4c448f;--code:#1a2340;margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 Roboto,system-ui,sans-serif;min-height:100vh}
html[data-theme="light"] .cew{--bg:#f5f6f5;--panel:#ffffff;--fg:#1d2128;--dim:#5b6472;--line:#cfd5d2;--accent:#4f2f8f;--accent-bg:#4c448f;--code:#e8ecea}
.cew *{box-sizing:border-box}
.cew a{color:var(--accent)}
.cew header.top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--panel);border-bottom:1px solid var(--line)}
.cew header.top .brand{font-weight:700;font-size:18px;flex:1;white-space:nowrap}
.cew header.top .brand small{font-weight:400;color:var(--dim);margin-left:8px}
.cew .btn,.cew select,.cew input[type=search]{font:inherit;font-size:14px;color:var(--fg);background:var(--code);border:1px solid var(--line);border-radius:6px;padding:6px 10px}
.cew .btn{text-decoration:none;cursor:pointer}
.cew .btn.primary{background:var(--accent-bg);border-color:var(--accent-bg);color:#fff}
.cew .wrap{display:flex;gap:32px;max-width:1160px;margin:0 auto;padding:24px 16px 64px}
.cew nav.toc{flex:0 0 230px;position:sticky;top:72px;align-self:flex-start;max-height:calc(100vh - 96px);overflow:auto}
.cew nav.toc input{width:100%;margin-bottom:12px}
.cew nav.toc a{display:block;padding:6px 12px;color:var(--dim);text-decoration:none;border-left:3px solid transparent;border-radius:0 6px 6px 0}
.cew nav.toc a:hover{color:var(--fg)}
.cew nav.toc a.on{color:var(--fg);border-left-color:var(--accent);background:var(--panel);font-weight:500}
.cew main{flex:1;min-width:0;max-width:820px}
.cew main h1{font-size:32px;line-height:1.2;margin:0 0 8px}
.cew main .intro{color:var(--dim);font-size:18px;margin:0 0 32px}
.cew section{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:8px 24px 16px;margin:0 0 20px;scroll-margin-top:76px}
.cew section h2{font-size:22px;margin:16px 0 8px}
.cew section h3{font-size:17px;margin:20px 0 4px;color:var(--accent)}
.cew section ul,.cew section ol{padding-left:22px;margin:8px 0}
.cew section ul>li{list-style:disc}.cew section ol>li{list-style:decimal}
.cew section li{margin:4px 0}
.cew table{border-collapse:collapse;width:100%;margin:12px 0;font-size:15px}
.cew th,.cew td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
.cew th{color:var(--dim);font-weight:500}
.cew kbd{display:inline-block;min-width:24px;padding:1px 7px;text-align:center;font:600 13px/1.5 ui-monospace,Menlo,monospace;color:var(--fg);background:var(--code);border:1px solid var(--line);border-bottom-width:2px;border-radius:5px}
.cew code{font:13px ui-monospace,Menlo,monospace;background:var(--code);padding:1px 6px;border-radius:4px}
.cew .hide{display:none!important}
.cew footer{text-align:center;color:var(--dim);font-size:14px;padding:16px}
.cew .none{color:var(--dim);display:none}
@media (max-width:800px){
.cew .wrap{flex-direction:column;gap:8px}
.cew nav.toc{position:static;flex:none;max-height:none;width:100%}
.cew nav.toc .links{display:none}.cew nav.toc.open .links{display:block}
.cew nav.toc .tg{display:inline-block;margin-bottom:8px}
.cew header.top .brand small{display:none}
.cew section{padding:4px 16px 12px}
}
@media (min-width:801px){.cew nav.toc .tg{display:none}}
</style>
<header class="top">
	<div class="brand">CancasEditor<small data-i="wiki">Wiki</small></div>
	<select id="cew-lang" aria-label="Language"><?php foreach ($langs as $l) { echo '<option value="' . $l . '">' . strtoupper($l) . '</option>'; } ?></select>
	<a class="btn primary" id="cew-open" href="<?= $h($home) ?>" data-i="open">Open the editor</a>
</header>
<div class="wrap">
	<nav class="toc" id="cew-toc">
		<button class="btn tg" type="button" id="cew-tg" data-i="menu">Contents</button>
		<div class="links">
			<input type="search" id="cew-q" placeholder="Search">
			<?php foreach ($content["sections"] as $s) {
				foreach ($langs as $l) {
					echo '<a href="#' . $s["id"] . '" data-lang="' . $l . '">' . $s[$l][0] . '</a>';
				}
			} ?>
			<div class="none" id="cew-none" data-i="none">No result</div>
		</div>
	</nav>
	<main>
		<?php foreach ($langs as $l) { ?>
			<div data-lang="<?= $l ?>">
				<h1><?= $h($content["title"][$l]) ?></h1>
				<p class="intro"><?= $h($content["intro"][$l]) ?></p>
			</div>
		<?php } ?>
		<?php foreach ($content["sections"] as $s) { ?>
			<section id="<?= $s["id"] ?>">
				<?php foreach ($langs as $l) { ?>
					<div data-lang="<?= $l ?>">
						<h2><?= $s[$l][0] ?></h2>
						<?= $s[$l][1] ?>
					</div>
				<?php } ?>
			</section>
		<?php } ?>
	</main>
</div>
<footer>CancasEditor &middot; IGKDEV &copy; <?= date('Y') ?></footer>
<script>
(function () {
	var R = document.documentElement, T = {
		fr: { wiki: 'Wiki', open: "Ouvrir l'éditeur", menu: 'Sommaire', search: 'Rechercher', none: 'Aucun résultat' },
		en: { wiki: 'Wiki', open: 'Open the editor', menu: 'Contents', search: 'Search', none: 'No result' },
		nl: { wiki: 'Wiki', open: 'Editor openen', menu: 'Inhoud', search: 'Zoeken', none: 'Geen resultaat' }
	};
	function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
	function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { } }
	// theme: same setting as the editor (cancas.settings.options.theme: dark | light | system)
	var mode = 'dark';
	try { mode = (JSON.parse(get('cancas.settings') || '{}').options || {}).theme || 'dark'; } catch (e) { }
	var mq = window.matchMedia('(prefers-color-scheme: light)');
	R.setAttribute('data-theme', mode == 'system' ? (mq.matches ? 'light' : 'dark') : (mode == 'light' ? 'light' : 'dark'));
	// language: same key as the editor (cancas.lang)
	var lg = (get('cancas.lang') || navigator.language || 'en').toLowerCase().substring(0, 2);
	if (lg != 'fr' && lg != 'nl') { lg = 'en'; }
	var sel = document.getElementById('cew-lang'), q = document.getElementById('cew-q');
	function apply() {
		sel.value = lg; R.setAttribute('lang', lg);
		document.querySelectorAll('.cew [data-lang]').forEach(function (e) { e.classList.toggle('hide', e.getAttribute('data-lang') != lg); });
		document.querySelectorAll('.cew [data-i]').forEach(function (e) { e.textContent = T[lg][e.getAttribute('data-i')]; });
		q.placeholder = T[lg].search;
		filter();
	}
	sel.onchange = function () { lg = sel.value; set('cancas.lang', lg); apply(); };
	// search: hide the sections (and their contents links) that do not contain the text
	function filter() {
		var v = q.value.trim().toLowerCase(), n = 0;
		document.querySelectorAll('.cew section').forEach(function (s) {
			var d = s.querySelector('[data-lang="' + lg + '"]');
			var ok = !v || d.textContent.toLowerCase().indexOf(v) != -1;
			s.classList.toggle('hide', !ok);
			var a = document.querySelector('.cew nav a[data-lang="' + lg + '"][href="#' + s.id + '"]');
			a.classList.toggle('hide', !ok);
			if (ok) { n++; }
		});
		document.getElementById('cew-none').style.display = n ? 'none' : 'block';
	}
	q.oninput = filter;
	// "Open the editor": an editor tab already open (named window cancaseditor) is shown as it is, without reloading;
	// only when there is none, the editor is opened in this tab
	var openEd = document.getElementById('cew-open');
	openEd.onclick = function (e) {
		var w = null;
		try { w = window.open('', 'cancaseditor'); } catch (x) { }
		if (!w) { return; } // popup blocked: the link opens the editor here
		var fresh = false;
		try { fresh = w.location.href == 'about:blank'; } catch (x) { } // cross origin: not our editor tab, leave it
		e.preventDefault();
		if (fresh) { w.location.href = openEd.href; }
		try { w.focus(); } catch (x) { }
	};
	document.getElementById('cew-tg').onclick = function () { document.getElementById('cew-toc').classList.toggle('open'); };
	document.querySelectorAll('.cew nav a').forEach(function (a) { a.addEventListener('click', function () { document.getElementById('cew-toc').classList.remove('open'); }); });
	// current section highlighted in the contents
	if (window.IntersectionObserver) {
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) {
				if (e.isIntersecting) {
					document.querySelectorAll('.cew nav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') == '#' + e.target.id); });
				}
			});
		}, { rootMargin: '-80px 0px -65% 0px' });
		document.querySelectorAll('.cew section').forEach(function (s) { io.observe(s); });
	}
	apply();
})();
</script>
