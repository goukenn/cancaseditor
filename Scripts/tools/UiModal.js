// author: C.A.D. BONDJE DOUE
// file: UiModal.js
// @desc: small modal dialog helper shared by the editor tools (plugins, property inspector on small screens)
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	/**
	 * show a modal dialog
	 * @param {{title?:string, content:Node, buttons?:Array<{text:string, primary?:boolean, onclick:Function}>, onclose?:Function, className?:string, bare?:boolean}} o  bare: no header
	 * @returns {{el:HTMLElement, close:Function}}
	 */
	function modal(o) {
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
		if (o.bare) { bd.classList.add('bare'); }
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
