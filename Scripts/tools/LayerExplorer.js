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
		'.le-row.drop-above{box-shadow:inset 0 2px 0 var(--ci-accent,#a14fd0)}.le-row.drop-below{box-shadow:inset 0 -2px 0 var(--ci-accent,#a14fd0)}.le-row.drop-into{outline:2px solid var(--ci-accent,#a14fd0);outline-offset:-2px}' +
		'.le-row.dragging{opacity:.4}' +
		'.le-row input.le-edit{flex:1;min-width:0;font:inherit;color:inherit;background:rgba(127,127,127,.2);border:1px solid var(--ci-accent,#a14fd0);border-radius:3px;padding:1px 4px;outline:none}' +
		'.le-menu{position:fixed;z-index:100000;min-width:150px;background:var(--ci-bg,#333);color:var(--ci-fg,#ddd);border:1px solid var(--ci-line,#4a4a4a);border-radius:6px;padding:4px;box-shadow:0 4px 14px rgba(0,0,0,.4);font-size:12px}' +
		'.le-menu div{padding:4px 10px;border-radius:4px;cursor:pointer}.le-menu div:hover{background:rgba(127,127,127,.25)}.le-menu .le-sep{height:1px;padding:0;margin:4px 0;background:var(--ci-line,#4a4a4a);cursor:default}';
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
		const isDoc = typeOf(item) == 'document';
		ORDER.filter(() => !isDoc).forEach(([method, key]) => {
			m.append(_el('div', { textContent: T('lay.' + key), onclick: () => { closeMenu(); if (reorder(editor, item, method)) { rerender(); } } }));
		});
		if (canDelete(item)) {
			if (!isDoc) { m.append(_el('div', { className: 'le-sep' })); }
			m.append(_el('div', { textContent: T('lay.delete'), onclick: () => { closeMenu(); requestDelete(editor, item, rerender); } }));
		}
		if (typeOf(item) != 'layer' && typeOf(item) != 'document') {
			// move the element to another layer of the current document
			const targets = layersOf(editor).filter((l) => l !== item['@container']);
			if (targets.length > 0) { m.append(_el('div', { className: 'le-sep' })); }
			targets.forEach((l) => m.append(_el('div', {
				textContent: T('lay.moveto') + ' ' + l.id,
				onclick: () => { closeMenu(); relocate(editor, item, l); editor.refresh(); rerender(); }
			})));
		}
		m.style.left = Math.min(e.clientX, window.innerWidth - 170) + 'px';
		m.style.top = Math.min(e.clientY, window.innerHeight - 130 - 22 * layersOf(editor).length) + 'px';
		document.body.append(m);
		m_menu = m;
		setTimeout(() => document.addEventListener('click', closeMenu, { once: true }), 0);
	}
	/** an element / group can always be deleted, a layer only when it is not the last one of its document */
	function canDelete(el) {
		const c = el && el['@container'];
		if (typeOf(el) == 'document') { return !!el['@container']; }
		if (!c) { return false; }
		return typeOf(el) != 'layer' || c.getLayers().length > 1;
	}
	/**
	 * delete from the explorer (menu, key, button). The last document of the scene asks for a confirmation first.
	 * @returns {boolean} false when the item cannot be deleted
	 */
	function requestDelete(editor, item, rerender) {
		if (!canDelete(item)) { return false; }
		if (typeOf(item) != 'document') {
			if (deleteItem(editor, item)) { rerender(); }
			return true;
		}
		const remove = () => { editor.removeDocument(item); rerender(); };
		if (editor.documents.length > 1) { remove(); return true; }
		_NS.ui.modal({
			title: T('lay.removedoc'), content: _el('div', { textContent: T('lay.confirm.lastdoc') }),
			buttons: [
				{ text: T('lay.cancel'), onclick: (close) => close() },
				{ text: T('lay.delete'), primary: true, onclick: (close) => { close(); remove(); } }
			]
		});
		return true;
	}
	/** remove a layer, an element or a group from its container (the selection tool is told when it is the selected one) */
	function deleteItem(editor, el) {
		if (!canDelete(el)) { return false; }
		const c = el['@container'];
		const t = editor.tool;
		if (typeOf(el) == 'layer') {
			editor.Edit(null, t); // drop the selection (it may be inside the layer)
			c.remove(el);
			if (editor.layer === el) { editor.layer = lastLayer(c); }
			editor.refresh();
			return true;
		}
		if (editor.element === el && t && typeof t.deleteSelected == 'function') {
			t.deleteSelected();
		} else {
			c.remove(el);
			if (editor.element === el) { editor.Edit(null, t); }
			editor.refresh();
		}
		return true;
	}
	// backspace (macOS) / delete (windows) remove the element selected in the explorer, while the last pointer
	// interaction was on the explorer (the surface handles the keys itself when it has the focus)
	let m_ctx = null; // {editor, rerender} of the explorer on screen
	let m_active = false;
	let m_sel = null; // the layer / element whose row was clicked last
	document.addEventListener('pointerdown', (e) => { m_active = !!(e.target.closest && e.target.closest('.le-root')); }, true);
	document.addEventListener('keydown', (e) => {
		if (!m_active || !m_ctx || !m_sel || (e.key != 'Backspace' && e.key != 'Delete')) { return; }
		if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) { return; }
		if (requestDelete(m_ctx.editor, m_sel, m_ctx.rerender)) {
			e.preventDefault();
			m_sel = null;
		}
	});
	const typeOf = (x) => (x.getType ? x.getType() : '');
	const isBox = (x) => { const t = typeOf(x); return t == 'layer' || t == 'group'; }; // can hold elements
	const insideOf = (x, c) => { for (let n = 0; x && n < 20; n++, x = x['@container']) { if (x === c) { return true; } } return false; };
	const mulM = (m2, m1) => [
		m2[0] * m1[0] + m2[2] * m1[1], m2[1] * m1[0] + m2[3] * m1[1],
		m2[0] * m1[2] + m2[2] * m1[3], m2[1] * m1[2] + m2[3] * m1[3],
		m2[0] * m1[4] + m2[2] * m1[5] + m2[4], m2[1] * m1[4] + m2[3] * m1[5] + m2[5]];
	/** the matrix of the space of a layer / group inside its document */
	function spaceOf(c) {
		let m = [1, 0, 0, 1, 0, 0];
		for (let n = 0; c && typeOf(c) != 'document' && n < 20; n++, c = c['@container']) {
			if (c.matrix) { m = mulM(c.matrix.element.slice(0, 6), m); }
		}
		return m;
	}
	/**
	 * what dropping `drag` on the row of `item` does, or null when not allowed.
	 * A layer is only reordered inside its document. An element can go above / below another element (of any
	 * layer or group), or into a layer or a group (the middle of its row).
	 */
	function dropTarget(drag, item, e, row) {
		if (!drag || drag === item) { return null; }
		const b = row.getBoundingClientRect(), f = (e.clientY - b.top) / (b.height || 1);
		const dt = typeOf(drag), it = typeOf(item);
		if (dt == 'layer') {
			if (it != 'layer' || drag['@container'] !== item['@container']) { return null; }
			return { mode: f < .5 ? 'above' : 'below', container: item['@container'] };
		}
		if (dt == 'document' || insideOf(item, drag)) { return null; } // not into itself
		if (it == 'layer') { return { mode: 'into', container: item }; }
		if (it == 'group' && f >= .25 && f <= .75) { return { mode: 'into', container: item }; }
		const c = item['@container'];
		if (!c || !isBox(c) || insideOf(c, drag)) { return null; }
		return { mode: f < .5 ? 'above' : 'below', container: c };
	}
	/** move an element to another layer / group, keeping its look when their matrices differ */
	function relocate(editor, el, target) {
		const old = el['@container'];
		if (old === target) { return true; }
		const wOld = spaceOf(old), wNew = spaceOf(target);
		old.remove(el);
		el['@container'] = null;
		target.add(el);
		const id = (m) => m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 1 && m[4] == 0 && m[5] == 0;
		if (!(id(wOld) && id(wNew)) && el.matrix) {
			const det = wNew[0] * wNew[3] - wNew[1] * wNew[2];
			if (det != 0) {
				const inv = [wNew[3] / det, -wNew[1] / det, -wNew[2] / det, wNew[0] / det, 0, 0];
				inv[4] = -(inv[0] * wNew[4] + inv[2] * wNew[5]);
				inv[5] = -(inv[1] * wNew[4] + inv[3] * wNew[5]);
				el.matrix.copytransform(mulM(inv, mulM(wOld, el.matrix.element.slice(0, 6))));
				el.initialize && el.initialize();
			}
		}
		return true;
	}
	function layersOf(editor) { // the layers of the current document
		return editor.document ? editor.document.getLayers() : [];
	}
	let m_drag = null; // the row being dragged: the layer / element
	// inline rename of an id (double click / long touch): the entity and the text being typed
	let m_edit = null;
	let m_lastClick = { target: null, t: 0 };
	const DBL_MS = 400;
	const LONG_MS = 600;
	/** an id is a valid name, used by no other entity (document, layer, element) of the scene */
	function validId(editor, target, id) {
		if (!/^[A-Za-z_][\w.\-]*$/.test(id)) { return false; }
		let used = false;
		const walk = (l) => Array.prototype.forEach.call(l || [], (e) => {
			if (e !== target && e.id == id) { used = true; }
			if (e.Elements) { walk(e.Elements); }
		});
		walk(editor.list);
		return !used;
	}
	function startEdit(target, rerender) {
		m_edit = { target, value: target.id };
		rerender();
	}
	function commitEdit(editor, rerender) {
		const e = m_edit;
		m_edit = null;
		if (!e) { return; }
		const v = (e.value || '').trim();
		if (v != e.target.id) {
			if (!validId(editor, e.target, v)) {
				_NS.gui.notify.Show(editor, T('doc.id.invalid'));
			} else {
				e.target.id = v;
				editor.refresh();
				if (e.target.getType && e.target.getType() == 'document') {
					editor.raiseEvent('currentDocumentChanged', { old: e.target, current: e.target }); // status bar, inspector
				}
			}
		}
		rerender();
	}
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
			if (m_edit && m_edit.target === o.target) {
				const inp = _el('input', { type: 'text', className: 'le-edit', value: m_edit.value });
				inp.oninput = () => { m_edit.value = inp.value; };
				inp.onclick = (e) => e.stopPropagation();
				inp.ondblclick = (e) => e.stopPropagation();
				inp.onkeydown = (e) => {
					e.stopPropagation();
					if (e.key == 'Enter') { e.preventDefault(); commitEdit(editor, rerender); }
					else if (e.key == 'Escape') { m_edit = null; rerender(); }
				};
				inp.onblur = () => { if (m_edit && m_edit.target === o.target) { commitEdit(editor, rerender); } };
				r.append(inp);
				setTimeout(() => { inp.focus(); inp.select(); }, 0);
			} else {
				r.append(_el('span', { className: 'le-label', textContent: o.label }));
			}
			if (o.sub) { r.append(_el('span', { className: 'le-sub', textContent: o.sub })); }
			(o.actions || []).forEach((a) => r.append(a));
			// a second click on the same row = double click: rename (the first click already redraws the rows)
			r.onclick = (e) => {
				const now = Date.now();
				if (o.target && m_lastClick.target === o.target && now - m_lastClick.t < DBL_MS) {
					m_lastClick = { target: null, t: 0 };
					startEdit(o.target, rerender);
					return;
				}
				m_lastClick = { target: o.target, t: now };
				m_sel = o.item || null;
				o.onclick(e);
			};
			if (o.target) {
				// long touch
				let timer = null;
				const cancel = () => { clearTimeout(timer); timer = null; };
				r.addEventListener('pointerdown', (e) => {
					if (e.pointerType != 'touch') { return; }
					cancel();
					timer = setTimeout(() => { timer = null; r._longTouch = Date.now(); startEdit(o.target, rerender); }, LONG_MS);
				});
				['pointerup', 'pointercancel', 'pointermove', 'dragstart'].forEach((n) => r.addEventListener(n, cancel));
			}
			if (o.item) {
				const item = o.item;
				r.oncontextmenu = (e) => {
					if (r._longTouch && Date.now() - r._longTouch < 1500) { e.preventDefault(); return; } // long touch = rename
					showMenu(e, item, editor, rerender);
				};
				r.draggable = typeOf(item) != 'document';
				r.ondragstart = (e) => {
					m_drag = item;
					e.dataTransfer.effectAllowed = 'move';
					e.dataTransfer.setData('text/plain', item.id);
					r.classList.add('dragging');
				};
				r.ondragend = () => { m_drag = null; r.classList.remove('dragging'); };
				const clear = () => r.classList.remove('drop-above', 'drop-below', 'drop-into');
				r.ondragover = (e) => {
					const d = dropTarget(m_drag, item, e, r);
					if (!d) { return; }
					e.preventDefault();
					clear();
					r.classList.add('drop-' + d.mode);
				};
				r.ondragleave = clear;
				r.ondrop = (e) => {
					e.preventDefault();
					clear();
					const dragged = m_drag;
					const d = dropTarget(dragged, item, e, r);
					m_drag = null;
					if (!d) { return; }
					const c = d.container;
					if (d.mode == 'into') {
						relocate(editor, dragged, c);
						c.setChildIndex(dragged, c.Elements.length - 1); // on top of the target
					} else {
						// rows are listed top most first: the upper half drops above the target in the z-order
						const rest = Array.prototype.slice.call(c.Elements).filter((q) => q !== dragged);
						const idx = rest.indexOf(item) + (d.mode == 'above' ? 1 : 0);
						relocate(editor, dragged, c);
						c.setChildIndex(dragged, idx);
					}
					editor.refresh();
					rerender();
				};
			}
			return r;
		};
		const rerender = () => { const p = root.parentNode; if (p) { p.replaceChild(build(editor), root); } };
		m_ctx = { editor, rerender };
		docs.forEach((doc) => {
			const dkey = 'd:' + doc.id;
			const isCur = editor.document === doc;
			root.append(row({
				depth: 0, key: dkey, toggle: true, target: doc, label: doc.id, sub: doc.width + '×' + doc.height, active: isCur,
				item: doc,
				actions: [iconBtn(ICON.close, T('lay.removedoc'), () => requestDelete(editor, doc, rerender))],
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
					depth: 1, key: lkey, toggle: true, item: ly, target: ly, label: ly.id, sub: String(items.length), hidden: !ly.visible,
					active: isCur && editor.layer === ly,
					eye: (v) => { ly.visible = v; },
					onclick: () => { editor.document = doc; editor.layer = ly; editor.refresh(); rerender(); }
				}));
				if (collapsed[lkey]) { return; }
				if (items.length == 0) { root.append(_el('div', { className: 'le-empty', style: 'padding-left:' + (4 + 2 * 14 + 20) + 'px', textContent: T('lay.noelements') })); }
				// the elements, top most first; a group lists its own members below it
				const list = (arr, depth) => Array.prototype.slice.call(arr).reverse().forEach((el) => {
					const isGroup = el.getType() == 'group';
					const ekey = 'e:' + el.id;
					root.append(row({
						depth, key: ekey, toggle: isGroup, item: el, target: el, label: el.getType() + ' #' + el.id, hidden: !el.visible,
						sub: isGroup ? String(el.Elements.length) : '',
						selected: editor.element === el,
						eye: (v) => { el.visible = v; },
						onclick: () => selectElement(editor, el)
					}));
					if (isGroup && !collapsed[ekey]) { list(el.Elements, depth + 1); }
				});
				list(items, 2);
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
