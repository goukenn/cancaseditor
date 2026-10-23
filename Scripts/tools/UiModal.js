// author: C.A.D. BONDJE DOUE
// file: UiModal.js
// @desc: small modal dialog helper shared by the editor tools (plugins, property inspector on small screens)
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	// colors come from variables: dark by default, light with [data-theme=light] on <html>
	const CSS = ':root{--cm-bg:#2b2b2b;--cm-head:#1e1e1e;--cm-side:#232323;--cm-panel:#333;--cm-fg:#eee;--cm-btn:#444;--cm-input:#111;--cm-line:#444;--cm-accent:#5b4bd6}' +
		'[data-theme="light"]{--cm-bg:#dbe3df;--cm-head:#cfd8d4;--cm-side:#d9d9d9;--cm-panel:#d9d9d9;--cm-fg:#111;--cm-btn:#c4c9c7;--cm-input:#fff;--cm-line:#9aa5a0;--cm-accent:#4f2f8f}' +
		'.cancas-modal{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);font:14px sans-serif}' +
		'.cancas-modal>div{background:var(--cm-bg);color:var(--cm-fg);width:min(560px,94vw);max-height:90vh;display:flex;flex-direction:column;border-radius:6px;overflow:hidden}' +
		'.cancas-modal .hd{display:flex;align-items:center;padding:8px 12px;background:var(--cm-head);font-weight:bold}.cancas-modal .hd .sp{flex:1}' +
		'.cancas-modal .bd{padding:12px;overflow:auto;flex:1}' +
		'.cancas-modal button{background:var(--cm-btn);color:var(--cm-fg);border:0;padding:6px 12px;border-radius:4px;cursor:pointer}' +
		'.cancas-modal button.primary{background:var(--cm-accent);color:#fff}' +
		'.cancas-modal input[type=text],.cancas-modal input[type=url],.cancas-modal input[type=number],.cancas-modal select{background:var(--cm-input);color:var(--cm-fg);border:1px solid var(--cm-line);padding:4px 6px;border-radius:3px;min-width:0}' +
		// settings dialog (see SettingsDialog.js)
		'.cancas-modal.ce-settings>div{width:min(860px,96vw);height:min(520px,92vh);max-height:none;flex-direction:row;border-radius:0;border:1px solid var(--cm-line)}' +
		'.ce-settings .ce-side{width:200px;flex:none;background:var(--cm-side);border-right:1px solid var(--cm-line);padding:8px 0;overflow:auto}' +
		'.ce-settings .ce-frame{display:flex;flex-direction:column;flex:1;min-width:0}' +
		'.ce-settings .ce-topbar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;flex:none;height:46px;padding:0 10px;background:var(--cm-head);border-bottom:1px solid var(--cm-line)}' +
		'.ce-settings .ce-topbar .ce-title{grid-column:2;font-size:17px;font-weight:bold;text-align:center;white-space:nowrap}' +
		'.ce-settings .ce-topbar .ce-close{grid-column:3;justify-self:end}' +
		'.ce-settings .ce-wrap{display:flex;flex:1;min-width:0;min-height:0}' +
		'.ce-settings .ce-side h2{font:400 18px sans-serif;margin:0;padding:4px 12px 12px}' +
		'.ce-settings .ce-close{background:transparent;color:inherit;border:0;padding:0;width:30px;height:30px;line-height:0;cursor:pointer;border-radius:50%;opacity:.8}' +
		'.ce-settings .ce-close:hover{opacity:1;color:var(--cm-accent)}.ce-settings .ce-close svg{width:100%;height:100%}' +
		'.ce-settings .ce-side a{color:inherit;display:block;padding:10px 12px 10px 28px;font-size:18px;cursor:pointer}' +
		'.ce-settings .ce-side a.on{font-weight:bold;box-shadow:inset 3px 0 var(--cm-accent)}' +
		'.ce-settings .ce-main{flex:1;display:flex;flex-direction:column;padding:10px;min-width:0}' +
		'.ce-settings .ce-page{flex:1;position:relative;background:var(--cm-panel);padding:16px;overflow:auto}' +
		'.ce-settings .ce-row{display:flex;align-items:center;gap:12px;margin:12px 0}.ce-settings .ce-row>label{width:170px;flex:none}' +
		'.ce-settings .ce-cam{position:absolute;top:8px;right:8px;width:50px;height:50px;border-radius:50%;padding:0;background:#9a9a9a;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
		'.ce-settings .ce-cam img{width:100%;height:100%;object-fit:cover}' +
		'.ce-settings .ce-foot{display:flex;justify-content:flex-end;padding-top:12px}' +
		'.ce-settings .ce-save{min-width:220px;padding:8px 24px;font-size:22px;border:3px solid var(--cm-accent);border-radius:22px;background:var(--cm-panel);color:var(--cm-fg);box-shadow:3px 3px 6px rgba(0,0,0,.35)}' +
		'@media (max-width:710px){.cancas-modal.ce-settings>div{flex-direction:column}.ce-settings .ce-wrap{flex-direction:column}.ce-settings .ce-side{width:auto;display:flex;align-items:center;border-right:0;border-bottom:1px solid var(--cm-line);padding:0}.ce-settings .ce-side a.on{box-shadow:inset 0 -3px var(--cm-accent)}.ce-settings .ce-side h2{display:none}.ce-settings .ce-side a{padding:10px 16px;font-size:16px}.ce-settings .ce-row{flex-wrap:wrap}.ce-settings .ce-save{min-width:0;flex:1}}';
	/**
	 * show a modal dialog
	 * @param {{title?:string, content:Node, buttons?:Array<{text:string, primary?:boolean, onclick:Function}>, onclose?:Function, className?:string, bare?:boolean}} o  bare: no header
	 * @returns {{el:HTMLElement, close:Function}}
	 */
	function modal(o) {
		if (!document.getElementById('cancas-modal-css')) {
			const st = document.createElement('style');
			st.id = 'cancas-modal-css';
			st.textContent = CSS;
			document.head.append(st);
		}
		const root = document.createElement('div');
		root.className = 'cancas-modal' + (o.className ? ' ' + o.className : '');
		const box = document.createElement('div');
		const hd = document.createElement('div');
		hd.className = 'hd';
		const title = document.createElement('span');
		title.textContent = o.title || '';
		const sp = document.createElement('span');
		sp.className = 'sp';
		hd.append(title, sp);
		// Escape closes the top most modal
		const onKey = (e) => {
			const all = document.querySelectorAll('.cancas-modal');
			if (e.key == 'Escape' && all[all.length - 1] === root) { close(); }
		};
		const close = () => {
			document.removeEventListener('keydown', onKey);
			root.remove();
			o.onclose && o.onclose();
			_NS.Actions.focusEditor(); // the shortcuts work again (no-op while another dialog is open)
		};
		document.addEventListener('keydown', onKey);
		(o.buttons || [{ text: (_NS.R && _NS.R['btn.close']) || 'Close', onclick: () => close() }]).forEach((b) => {
			const e = document.createElement('button');
			e.textContent = b.text;
			if (b.primary) { e.className = 'primary'; }
			e.onclick = () => b.onclick(close);
			hd.append(e);
		});
		const bd = document.createElement('div');
		bd.className = 'bd';
		if (o.bare) { bd.style.cssText = 'padding:0;display:flex;flex:1;min-width:0'; }
		bd.append(o.content);
		o.bare || box.append(hd);
		box.append(bd);
		root.append(box);
		root.addEventListener('mousedown', (e) => { if (e.target == root) { close(); } });
		document.body.append(root);
		return { el: root, close };
	}
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	/**
	 * settings style dialog: title + page list on the left, the page and a save button on the right
	 * @param {{title:string, pages:Array<{name:string,label:string,build:()=>Node}>, saveText:string, onSave:(close:Function)=>void, page?:string}} o
	 */
	const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 320L192 192M192 320l192-192"/></svg>';
	function sectionDialog(o) {
		const page = _el('div', { className: 'ce-page' });
		const nav = _el('div', { className: 'ce-side' }, [_el('h2', { textContent: o.title })]);
		const links = {};
		// ionicons "close-circle-outline" (inline: the icon font is not loaded by the editor)
		const closeBtn = _el('button', { className: 'ce-close', type: 'button', title: (_NS.R && _NS.R['btn.close']) || 'Close' });
		closeBtn.setAttribute('aria-label', closeBtn.title);
		closeBtn.innerHTML = CLOSE_ICON;
		// top bar of the whole dialog: the page being edited in the center, the close button at the right
		const topTitle = _el('span', { className: 'ce-title' });
		const topbar = _el('div', { className: 'ce-topbar' }, [topTitle, closeBtn]);
		const show = (name) => {
			page.textContent = '';
			const def = o.pages.find((p) => p.name == name);
			page.append(def.build());
			topTitle.textContent = def.label;
			Object.keys(links).forEach((k) => links[k].classList.toggle('on', k == name));
		};
		o.pages.forEach((p) => {
			links[p.name] = _el('a', { textContent: p.label, onclick: () => show(p.name) });
			nav.append(links[p.name]);
		});
		const save = _el('button', { className: 'ce-save', textContent: o.saveText });
		const layout = _el('div', { className: 'ce-main' }, [page, _el('div', { className: 'ce-foot' }, [save])]);
		const dlg = modal({ bare: true, className: 'ce-settings', content: _el('div', { className: 'ce-frame' }, [topbar, _el('div', { className: 'ce-wrap' }, [nav, layout])]) });
		save.onclick = () => o.onSave(dlg.close);
		closeBtn.onclick = () => dlg.close();
		show(o.page || o.pages[0].name);
		return dlg;
	}
	_NS.ui = Object.assign(_NS.ui || {}, { modal, sectionDialog });
})();
