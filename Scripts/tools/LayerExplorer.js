// author: C.A.D. BONDJE DOUE
// file: LayerExplorer.js
// @desc: explorer of the scene: documents > layers > elements. Select a document / layer / element and edit
// its visibility. Shown in the "Layers" tab of the property inspector (tools/PropertyInspectorTool.js).
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;
	const collapsed = {}; // row key => true when closed
	const CSS = '.le-root{font-size:12px;color:var(--ci-fg,#ddd)}' +
		'.le-bar{display:flex;gap:6px;padding:2px 0 8px;border-bottom:1px solid var(--ci-line,#4a4a4a);margin-bottom:6px}' +
		'.le-bar button{background:transparent;border:1px solid var(--ci-line,#4a4a4a);color:inherit;border-radius:5px;padding:3px 8px;cursor:pointer;font:inherit}' +
		'.le-bar button:hover{background:rgba(127,127,127,.2)}' +
		'.le-row{display:flex;align-items:center;gap:4px;padding:3px 4px;border-radius:4px;cursor:pointer;white-space:nowrap}' +
		'.le-row:hover{background:rgba(127,127,127,.18)}.le-row.active{background:rgba(161,79,208,.28)}.le-row.sel{outline:1px solid var(--ci-accent,#a14fd0)}' +
		'.le-row .le-label{flex:1;overflow:hidden;text-overflow:ellipsis}.le-row .le-sub{opacity:.55;font-size:10px}' +
		'.le-row.hidden .le-label{opacity:.45;text-decoration:line-through}' +
		'.le-ico{background:transparent;border:0;color:inherit;width:20px;height:20px;padding:2px;line-height:0;cursor:pointer;border-radius:3px;flex:none}' +
		'.le-ico:hover{background:rgba(127,127,127,.3)}.le-ico svg{width:100%;height:100%}.le-ico.off{opacity:.45}' +
		'.le-empty{opacity:.6;padding:4px 8px;font-style:italic}' +
		'.le-row.drop-above{box-shadow:inset 0 2px 0 var(--ci-accent,#a14fd0)}.le-row.drop-below{box-shadow:inset 0 -2px 0 var(--ci-accent,#a14fd0)}' +
		'.le-row.dragging{opacity:.4}' +
		'.le-menu{position:fixed;z-index:100000;min-width:150px;background:var(--ci-bg,#333);color:var(--ci-fg,#ddd);border:1px solid var(--ci-line,#4a4a4a);border-radius:6px;padding:4px;box-shadow:0 4px 14px rgba(0,0,0,.4);font-size:12px}' +
		'.le-menu div{padding:4px 10px;border-radius:4px;cursor:pointer}.le-menu div:hover{background:rgba(127,127,127,.25)}';
	const svg = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
	const ICON = {
		eye: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
		eyeOff: svg('<path d="M3 3l18 18"/><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6A17 17 0 0 0 2 12s4 7 10 7a9.6 9.6 0 0 0 4-.9"/>'),
		down: svg('<path d="m6 9 6 6 6-6"/>'),
		right: svg('<path d="m9 6 6 6-6 6"/>'),
		close: svg('<path d="M6 6l12 12M18 6 6 18"/>')
	};
	function _css() {
		if (!document.getElementById('cancas-explorer-css')) {
			const s = document.createElement('style');
			s.id = 'cancas-explorer-css';
			s.textContent = CSS;
			document.head.append(s);
		}
	}
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	const iconBtn = (svgText, title, onclick, off) => {
		const b = _el('button', { type: 'button', className: 'le-ico' + (off ? ' off' : ''), title: title || '' });
		b.innerHTML = svgText;
		b.onclick = (e) => { e.stopPropagation(); onclick(e); };
		return b;
	};
	const lastLayer = (doc) => { const l = doc.getLayers(); return l.length ? l[l.length - 1] : null; };
	/** make an element the selection of the selection tool */
	function selectElement(editor, el) {
		const doc = documentOf(el);
		if (doc && editor.document !== doc) { editor.document = doc; }
		if (el['@container'] && el['@container'].getType() == 'layer') { editor.layer = el['@container']; }
		if (!editor.tool || typeof editor.tool.selectElement != 'function') { AC.invoke('editor.selectool.selection'); }
		if (editor.tool && editor.tool.selectElement) { editor.tool.selectElement(el); }
	}
	function documentOf(el) {
		let c = el, n = 0;
		while (c && n++ < 10) { if (c.getType && c.getType() == 'document') { return c; } c = c['@container']; }
		return null;
	}
	// z-order operations: name => [container method, label key]
	const ORDER = [
		['bringToFront', 'bringFront'], ['bringForward', 'bringForward'],
		['sendBackward', 'sendBackward'], ['sendToBack', 'sendBack']
	];
	/** change the z-order of a layer / element inside its container */
	function reorder(editor, item, method) {
		const c = item && item['@container'];
		if (!c || typeof c[method] != 'function') { return false; }
		const r = c[method](item);
		if (r) { editor.refresh(); }
		return r;
	}
	/** the layer (menu Layer) or the element (menu Edit) the order actions work on */
	const orderTarget = { layer: (a) => a.layer, edit: (a) => a.element };
	let m_menu = null;
	function closeMenu() { if (m_menu) { m_menu.remove(); m_menu = null; } }
	function showMenu(e, item, editor, rerender) {
		e.preventDefault();
		e.stopPropagation();
		closeMenu();
		const m = _el('div', { className: 'le-menu' });
		ORDER.forEach(([method, key]) => {
			m.append(_el('div', { textContent: T('lay.' + key), onclick: () => { closeMenu(); if (reorder(editor, item, method)) { rerender(); } } }));
		});
		m.style.left = Math.min(e.clientX, window.innerWidth - 170) + 'px';
		m.style.top = Math.min(e.clientY, window.innerHeight - 130) + 'px';
		document.body.append(m);
		m_menu = m;
		setTimeout(() => document.addEventListener('click', closeMenu, { once: true }), 0);
	}
	let m_drag = null; // the row being dragged: the layer / element
	/** @returns {HTMLElement} the explorer of the scene */
	function build(editor) {
		_css();
		const root = _el('div', { className: 'le-root' });
		const bar = _el('div', { className: 'le-bar' });
		const addDoc = _el('button', { type: 'button', textContent: '+ ' + T('lay.adddoc'), title: T('lay.adddoc') });
		addDoc.onclick = () => editor.addDocument();
		const addLayer = _el('button', { type: 'button', textContent: '+ ' + T('lay.addlayer'), title: T('lay.addlayer') });
		addLayer.onclick = () => { const m = AC.getMenuActions()['layer.new']; (m.callback || m).call(null, editor); };
		bar.append(addDoc, addLayer);
		root.append(bar);
		const docs = editor.documents;
		if (docs.length == 0) {
			root.append(_el('div', { className: 'le-empty', textContent: T('lay.empty') }));
			return root;
		}
		const row = (o) => {
			const r = _el('div', { className: 'le-row' + (o.active ? ' active' : '') + (o.selected ? ' sel' : '') + (o.hidden ? ' hidden' : '') });
			r.style.paddingLeft = (4 + o.depth * 14) + 'px';
			r.append(o.toggle ? iconBtn(collapsed[o.key] ? ICON.right : ICON.down, '', () => { collapsed[o.key] = !collapsed[o.key]; rerender(); }) : _el('span', { style: 'width:20px;flex:none' }));
			if (o.eye) {
				r.append(iconBtn(o.hidden ? ICON.eyeOff : ICON.eye, T(o.hidden ? 'lay.show' : 'lay.hide'), () => { o.eye(o.hidden); editor.refresh(); rerender(); } /* hidden now => show */, o.hidden));
			}
			r.append(_el('span', { className: 'le-label', textContent: o.label }));
			if (o.sub) { r.append(_el('span', { className: 'le-sub', textContent: o.sub })); }
			(o.actions || []).forEach((a) => r.append(a));
			r.onclick = o.onclick;
			if (o.item) {
				const item = o.item;
				r.oncontextmenu = (e) => showMenu(e, item, editor, rerender);
				r.draggable = true;
				r.ondragstart = (e) => {
					m_drag = item;
					e.dataTransfer.effectAllowed = 'move';
					e.dataTransfer.setData('text/plain', item.id);
					r.classList.add('dragging');
				};
				r.ondragend = () => { m_drag = null; r.classList.remove('dragging'); };
				const clear = () => r.classList.remove('drop-above', 'drop-below');
				const upper = (e) => { const b = r.getBoundingClientRect(); return e.clientY < b.top + b.height / 2; };
				r.ondragover = (e) => {
					// only inside the same container (layers of a document, elements of a layer)
					if (!m_drag || m_drag === item || m_drag['@container'] !== item['@container']) { return; }
					e.preventDefault();
					clear();
					r.classList.add(upper(e) ? 'drop-above' : 'drop-below');
				};
				r.ondragleave = clear;
				r.ondrop = (e) => {
					e.preventDefault();
					clear();
					const c = item['@container'];
					if (!m_drag || m_drag === item || !c || m_drag['@container'] !== c) { return; }
					// rows are listed top most first: the upper half drops above the target in the z-order
					const rest = Array.prototype.slice.call(c.Elements).filter((q) => q !== m_drag);
					const idx = rest.indexOf(item) + (upper(e) ? 1 : 0);
					const dragged = m_drag;
					m_drag = null;
					if (c.setChildIndex(dragged, idx)) { editor.refresh(); }
					rerender();
				};
			}
			return r;
		};
		const rerender = () => { const p = root.parentNode; if (p) { p.replaceChild(build(editor), root); } };
		docs.forEach((doc) => {
			const dkey = 'd:' + doc.id;
			const isCur = editor.document === doc;
			root.append(row({
				depth: 0, key: dkey, toggle: true, label: doc.id, sub: doc.width + '×' + doc.height, active: isCur,
				actions: docs.length > 1 ? [iconBtn(ICON.close, T('lay.removedoc'), () => editor.removeDocument(doc))] : [],
				onclick: () => { editor.document = doc; editor.layer = lastLayer(doc); editor.refresh(); }
			}));
			if (collapsed[dkey]) { return; }
			const layers = doc.getLayers();
			if (layers.length == 0) { root.append(_el('div', { className: 'le-empty', textContent: T('lay.nolayers') })); }
			// the top most layer first
			layers.slice().reverse().forEach((ly) => {
				const lkey = 'l:' + doc.id + ':' + ly.id;
				const items = ly.Elements ? Array.prototype.slice.call(ly.Elements) : [];
				root.append(row({
					depth: 1, key: lkey, toggle: true, item: ly, label: ly.id, sub: String(items.length), hidden: !ly.visible,
					active: isCur && editor.layer === ly,
					eye: (v) => { ly.visible = v; },
					onclick: () => { editor.document = doc; editor.layer = ly; editor.refresh(); rerender(); }
				}));
				if (collapsed[lkey]) { return; }
				if (items.length == 0) { root.append(_el('div', { className: 'le-empty', style: 'padding-left:' + (4 + 2 * 14 + 20) + 'px', textContent: T('lay.noelements') })); }
				items.slice().reverse().forEach((el) => {
					root.append(row({
						depth: 2, key: 'e:' + el.id, item: el, label: el.getType() + ' #' + el.id, hidden: !el.visible,
						selected: editor.element === el,
						eye: (v) => { el.visible = v; },
						onclick: () => selectElement(editor, el)
					}));
				});
			});
		});
		return root;
	}
	_NS.layerExplorer = { build };
	// layer.* (current layer) and edit.* (selected element): bring to front / forward / backward / send to back
	ORDER.forEach(([method, key], i) => {
		['layer', 'edit'].forEach((grp) => {
			AC.regMenuAction(grp + '.' + key, {
				index: (grp == 'layer' ? 20 : 610) + i,
				callback: (a) => {
					const t = orderTarget[grp](a);
					if (t) { reorder(a, t, method); }
				}
			});
		});
	});
	AC.regMenuAction("view.zoom.all", { index: 30, callback: (a) => a.viewAllDocuments() });
	AC.regMenuAction("view.zoom.center", { index: 31, callback: (a) => a.centerOnDocument() });
	AC.regMenuAction("file.newDocument", { index: -95, callback: (a) => a.addDocument() });
})();
