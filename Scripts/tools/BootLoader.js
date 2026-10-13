// author: C.A.D. BONDJE DOUE
// file: BootLoader.js
// @desc: startup page. The overlay #cancas-loader (rendered by default.phtml) stays visible until every
// startup task is done: scripts (plugins/tools) loaded, resources, user settings, document restored.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const FAILSAFE_DELAY = 20000;
	// order = order of the messages shown
	const pending = ['scripts', 'resources', 'settings', 'document'];
	const loader = () => document.getElementById('cancas-loader');
	function showMessage() {
		const l = loader();
		if (!l || pending.length == 0) { return; }
		const t = l.querySelector('.cancas-loader-text');
		const msg = l.dataset['t' + pending[0].charAt(0).toUpperCase() + pending[0].slice(1)];
		if (t && msg) { t.textContent = msg; }
	}
	function finish() {
		const l = loader();
		if (!l) { return; }
		l.style.opacity = '0';
		l.style.pointerEvents = 'none';
		setTimeout(() => l.remove(), 350);
	}
	const boot = _NS.boot = {
		get pending() { return pending.slice(); },
		/** mark a startup task as done */
		done(name) {
			const i = pending.indexOf(name);
			if (i == -1) { return; }
			pending.splice(i, 1);
			pending.length == 0 ? finish() : showMessage();
		}
	};
	showMessage();
	setTimeout(finish, FAILSAFE_DELAY); // never block the application
	// scripts: every tool loaded (deferred scripts) and the editor created
	let scripts = 2;
	const scriptDone = () => { if (--scripts == 0) { boot.done('scripts'); } };
	document.readyState == 'complete' ? scriptDone() : window.addEventListener('load', scriptDone);
	_NS.whenEditor(scriptDone);
	// resources: first language load
	const onLang = () => boot.done('resources');
	_NS.lang.current ? onLang() : _NS.lang.listeners.push(onLang);
})();
