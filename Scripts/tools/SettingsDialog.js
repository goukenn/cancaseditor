// author: C.A.D. BONDJE DOUE
// file: SettingsDialog.js
// @desc: settings dialog (general / account pages) and the dark/light theme.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const R = () => _NS.R || {};
	const THEMES = ['dark', 'light', 'system'];
	const AVATAR_SIZE = 96;
	const AVATAR_MAX = 3800; // server cap of an option value is 4096
	// ------------------------------------------------------------------ theme
	const mqLight = window.matchMedia('(prefers-color-scheme: light)');
	function applyTheme(mode) {
		const t = mode == 'system' ? (mqLight.matches ? 'light' : 'dark') : (mode == 'light' ? 'light' : 'dark');
		document.documentElement.setAttribute('data-theme', t);
		return t;
	}
	// apply the stored theme right now (before the editor and the server settings are known)
	(function () {
		let mode = 'dark';
		try { mode = (JSON.parse(window.localStorage.getItem('cancas.settings') || '{}').options || {}).theme || 'dark'; } catch (e) { }
		applyTheme(mode);
	})();
	const currentMode = () => (_NS.prefs && _NS.prefs.get('theme', 'dark')) || 'dark';
	(mqLight.addEventListener ? mqLight.addEventListener.bind(mqLight, 'change') : mqLight.addListener.bind(mqLight))(() => {
		if (currentMode() == 'system') { applyTheme('system'); }
	});
	_NS.whenEditor(() => setTimeout(() => {
		applyTheme(currentMode());
		_NS.prefs && _NS.prefs.onChange((what, name) => { if (what == 'server' || name == 'theme') { applyTheme(currentMode()); } });
	}, 0));
	_NS.theme = { apply: applyTheme, modes: THEMES };
	// ------------------------------------------------------------------ dialog
	const CAMERA = '<svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 5.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>';
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	/** read an image file and return a small square jpeg data url that fits the option size cap */
	function toAvatar(file) {
		return new Promise((res, rej) => {
			const img = new Image();
			img.onload = () => {
				const c = document.createElement('canvas');
				c.width = c.height = AVATAR_SIZE;
				const s = Math.min(img.width, img.height);
				c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
				for (let q = 0.8; q >= 0.3; q -= 0.1) {
					const d = c.toDataURL('image/jpeg', q);
					if (d.length <= AVATAR_MAX) { return res(d); }
				}
				rej(new Error('image too large'));
			};
			img.onerror = rej;
			img.src = URL.createObjectURL(file);
		});
	}
	function showSettings(editor) {
		const T = R();
		const prefs = _NS.prefs;
		const draft = { // values edited in the dialog, applied on save
			theme: prefs.get('theme', 'dark'),
			lang: (_NS.lang && _NS.lang.current) || 'en',
			panelOpen: prefs.get('panelOpen', true),
			autosave: prefs.get('autosave', true) !== false,
			undoLimit: Number(prefs.get('undoLimit', 100)) || 100,
			avatar: prefs.get('avatar', ''),
			rulers: prefs.get('rulers', false) === true,
			arrowAnimation: prefs.get('arrowAnimation', true) !== false,
			surfaceTexture: prefs.get('surfaceTexture', 'none'),
			surfaceGridSize: Number(prefs.get('surfaceGridSize', 20)) || 20,
			surfaceTextureColor: prefs.get('surfaceTextureColor', '#7f7f7f')
		};
		const shortcutDraft = _NS.shortcutSettings.createDraft(); // custom keys edited by the shortcuts page
		const select = (values, current, label, onchange) => {
			const s = _el('select');
			values.forEach((v) => s.append(_el('option', { value: v, textContent: label(v), selected: v == current })));
			s.onchange = () => onchange(s.value);
			return s;
		};
		const row = (label, control) => _el('div', { className: 'ce-row' }, [_el('label', { textContent: label }), control]);
		const checkbox = (checked, onchange) => {
			const c = _el('input', { type: 'checkbox', checked });
			c.onchange = () => onchange(c.checked);
			return c;
		};
		const pages = {
			general() {
				const p = _el('div');
				p.append(
					row(T['settings.theme'], select(THEMES, draft.theme, (v) => T['settings.theme.' + v], (v) => { draft.theme = v; })),
					row(T['settings.language'], select(_NS.lang.supported, draft.lang, (v) => T['settings.language.' + v], (v) => { draft.lang = v; })),
					row(T['settings.panelOpen'], checkbox(draft.panelOpen, (v) => { draft.panelOpen = v; })),
					row(T['settings.autosave'], checkbox(draft.autosave, (v) => { draft.autosave = v; })),
					row(T['settings.undoLimit'], (() => {
						const n = _el('input', { type: 'number', min: 1, max: 1000, value: draft.undoLimit });
						n.style.width = '6em';
						n.onchange = () => { draft.undoLimit = Math.max(1, Math.min(1000, Math.floor(Number(n.value)) || 100)); n.value = draft.undoLimit; };
						return n;
					})()));
				// background texture of the editor surface, rulers
				p.append(
					row(T['settings.rulers'], checkbox(draft.rulers, (v) => { draft.rulers = v; })),
					row(T['settings.arrowAnimation'], checkbox(draft.arrowAnimation, (v) => { draft.arrowAnimation = v; })),
					row(T['settings.surfaceTexture'], select(_NS.surfaceTexture.TEXTURES, draft.surfaceTexture, (v) => T['settings.surfaceTexture.' + v], (v) => { draft.surfaceTexture = v; })),
					row(T['settings.surfaceGridSize'], (() => {
						const n = _el('input', { type: 'number', min: 2, max: 1000, value: draft.surfaceGridSize });
						n.style.width = '6em';
						n.onchange = () => { draft.surfaceGridSize = Math.max(2, Math.min(1000, Math.floor(Number(n.value)) || 20)); n.value = draft.surfaceGridSize; };
						return n;
					})()),
					row(T['settings.surfaceTextureColor'], (() => {
						const c = _el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(draft.surfaceTextureColor) ? draft.surfaceTextureColor : '#7f7f7f' });
						c.onchange = () => { draft.surfaceTextureColor = c.value; };
						return c;
					})()));
				const b = _el('button', { textContent: T['settings.plugins.manage'] });
				b.onclick = () => _NS.storage.showPlugins(editor);
				p.append(row('', b));
				return p;
			},
			shortcuts() {
				return _NS.shortcutSettings.buildPage(editor, shortcutDraft);
			},
			account() {
				const p = _el('div');
				const cam = _el('button', { className: 'ce-cam', title: T['settings.account.picture'] });
				const showAvatar = () => { cam.innerHTML = draft.avatar ? '' : CAMERA; draft.avatar && cam.append(_el('img', { src: draft.avatar, alt: '' })); };
				showAvatar();
				const file = _el('input', { type: 'file', accept: 'image/*' });
				file.style.display = 'none';
				file.onchange = async () => {
					if (!file.files[0]) { return; }
					try { draft.avatar = await toAvatar(file.files[0]); showAvatar(); } catch (e) { console.error(e); }
				};
				cam.onclick = () => file.click();
				p.append(cam, file);
				if (prefs.signedIn) {
					p.append(row(T['settings.account.signedin'], _el('strong', { textContent: prefs.user || '' })));
				} else {
					p.append(_el('p', { textContent: T['settings.account.guest'] }));
					const uri = editor.settings && editor.settings.signinUri;
					if (uri) {
						p.append(_el('a', { href: uri, target: '_blank', rel: 'noopener', textContent: T['settings.account.signin'], style: 'color:inherit;font-weight:bold' }));
					}
				}
				return p;
			}
		};
		_NS.ui.sectionDialog({
			title: T['settings.title'],
			pages: Object.keys(pages).map((name) => ({ name, label: T['settings.' + name], build: pages[name] })),
			saveText: T['settings.save'],
			onSave(close) {
				prefs.set('theme', draft.theme);
				prefs.set('panelOpen', draft.panelOpen);
				prefs.set('autosave', draft.autosave);
				prefs.set('undoLimit', draft.undoLimit);
				prefs.set('avatar', draft.avatar);
				prefs.set('rulers', draft.rulers);
				prefs.set('arrowAnimation', draft.arrowAnimation);
				editor.refresh();
				prefs.set('surfaceTexture', draft.surfaceTexture);
				prefs.set('surfaceGridSize', draft.surfaceGridSize);
				prefs.set('surfaceTextureColor', draft.surfaceTextureColor);
				_NS.shortcutSettings.save(shortcutDraft);
				if (_NS.lang && draft.lang != _NS.lang.current) { _NS.lang.set(draft.lang, editor); }
				close();
				_NS.gui.notify.Show(editor, R()['settings.saved']);
			}
		});
	}
	// the menu is built when the editor initializes: register at load time
	AC.regMenuAction("settings.settings", { callback: function (a) { showSettings(a); } });
	_NS.showSettings = showSettings;
})();
