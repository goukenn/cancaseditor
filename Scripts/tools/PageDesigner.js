// author: C.A.D. BONDJE DOUE
// file: PageDesigner.js
// @desc: web page design mode. File > New web page creates a document of kind 'page' (see drawing2d/pagenode.js);
// the property inspector of such a document shows the designer: a palette of html5 elements, the structure tree
// (select, move, indent, delete with Backspace / Delete) and the editor of the selected node. The page is
// rasterized on the surface by the document itself.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const ELEM = _NS.DrawingElements;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;
	const EMAIL_PALETTE = ['table', 'tr', 'td', 'th', 'h1', 'h2', 'h3', 'p', 'a', 'img', 'span', 'div', 'ul', 'li', 'hr', 'br']; // what the mail clients render
	const PALETTE = ['section', 'header', 'nav', 'main', 'article', 'aside', 'footer', 'div', 'h1', 'h2', 'h3', 'p', 'a', 'img', 'ul', 'ol', 'li', 'button', 'form', 'label', 'input', 'table'];
	const DEFAULTS = { // text and attributes of a new node
		h1: ['Title'], h2: ['Title'], h3: ['Title'], p: ['Text'], a: ['Link', { href: '#' }], button: ['Button'], li: ['Item'],
		label: ['Label'], img: ['', { src: '', alt: '' }], input: ['', { type: 'text' }],
		table: ['', { width: '100%', cellpadding: '0', cellspacing: '0', border: '0', role: 'presentation' }]
	};
	const CSS = '.pd-root{margin-top:10px;font-size:12px}.pd-h{font-weight:bold;margin:10px 0 4px;opacity:.85}' +
		'.pd-pal{display:flex;flex-wrap:wrap;gap:4px}.pd-pal button{padding:2px 7px;border:1px solid var(--ci-line,#4a4a4a);border-radius:10px;background:transparent;color:inherit;cursor:pointer;font:11px monospace}' +
		'.pd-pal button:hover{background:rgba(127,127,127,.25)}' +
		'.pd-tree{border:1px solid var(--ci-line,#4a4a4a);border-radius:4px;padding:2px;max-height:240px;overflow:auto;outline:none}.pd-tree:focus{border-color:var(--ci-accent,#a14fd0)}' +
		'.pd-row{display:flex;align-items:center;gap:2px;padding:1px 2px;border-radius:3px;cursor:pointer;white-space:nowrap}.pd-row:hover{background:rgba(127,127,127,.18)}' +
		'.pd-row.sel{background:rgba(161,79,208,.35)}.pd-row .lb{flex:1;min-width:44px;overflow:hidden;text-overflow:ellipsis}.pd-row .tx{opacity:.6;max-width:44px;overflow:hidden;text-overflow:ellipsis}' +
		'.pd-row button{border:0;background:transparent;color:inherit;cursor:pointer;padding:0 2px;opacity:.7;font-size:11px}.pd-row button:hover{opacity:1}' +
		'.pd-ed label{display:block;margin:6px 0 2px;opacity:.7}.pd-ed input,.pd-ed textarea{width:100%;box-sizing:border-box;background:var(--ci-input,#111);color:inherit;border:1px solid var(--ci-line,#4a4a4a);border-radius:3px;padding:3px 5px;font:12px monospace}' +
		'.pd-root select{width:100%;background:var(--ci-input,#111);color:inherit;border:1px solid var(--ci-line,#4a4a4a);border-radius:3px;padding:3px}.pd-empty{opacity:.6;padding:6px}';
	function _el(tag, props, children) {
		const e = document.createElement(tag);
		Object.assign(e, props || {});
		(children || []).forEach((c) => e.append(c));
		return e;
	}
	function _css() {
		if (!document.getElementById('cancas-pagedesigner-css')) { document.head.append(_el('style', { id: 'cancas-pagedesigner-css', textContent: CSS })); }
	}
	let m_sel = null; // runtime id (u) of the selected node
	let m_refocus = false; // the tree takes the focus back after a redraw made from it (Backspace / Delete)
	/**
	 * the designer of a web page document
	 * @param {*} editor
	 * @param {*} doc a document of kind 'page'
	 * @returns {HTMLElement}
	 */
	function build(editor, doc) {
		_css();
		const P = ELEM.page;
		const root = _el('div', { className: 'pd-root' });
		const redraw = () => { const p = root.parentNode; if (p) { p.replaceChild(build(editor, doc), root); } };
		const changed = () => editor.refresh(); // redraws the page, the storage notices the change
		const pick = () => (m_sel != null ? P.find(doc.page, m_sel) : null);
		const select = (n) => { m_sel = n ? n.u : null; m_refocus = true; redraw(); };
		function add(tag) {
			const at = pick();
			const d = DEFAULTS[tag] || [''];
			const n = P.node(tag, d[0], Object.assign({}, d[1] || {}));
			if (n.tag == 'div' || n.tag == 'section') { n.style = 'padding:8px'; }
			const sibling = at && (P.isVoid(at.node.tag) || (at.node.tag == tag && /^(li|p|option|tr|td|th)$/.test(tag))); // never inside itself
			if (at && !sibling) { at.node.children.push(n); } // inside the selected node
			else if (at) { at.list.splice(at.index + 1, 0, n); } // after the selected node
			else { doc.page.push(n); }
			m_sel = n.u;
			changed();
			redraw();
		}
		function remove(at) {
			at.list.splice(at.index, 1);
			m_sel = null;
			m_refocus = true;
			changed();
			redraw();
		}
		const move = (at, delta) => {
			const j = at.index + delta;
			if (j < 0 || j >= at.list.length) { return; }
			at.list.splice(j, 0, at.list.splice(at.index, 1)[0]);
			changed();
			redraw();
		};
		const indent = (at) => { // into the previous sibling
			if (at.index == 0 || P.isVoid(at.list[at.index - 1].tag)) { return; }
			at.list[at.index - 1].children.push(at.list.splice(at.index, 1)[0]);
			changed();
			redraw();
		};
		const outdent = (at) => { // after its parent
			const parent = (function f(list, par) {
				for (const n of list) {
					if (n === at.node) { return par; }
					const r = f(n.children, n);
					if (r) { return r; }
				}
				return null;
			})(doc.page, null);
			if (!parent) { return; }
			const g = P.find(doc.page, parent.u);
			at.list.splice(at.index, 1);
			g.list.splice(g.index + 1, 0, at.node);
			changed();
			redraw();
		};
		// palette
		const target = _el('select', { title: T('page.target', 'Type') }, [
			_el('option', { value: 'web', textContent: T('page.target.web', 'Web page'), selected: doc.target == 'web' }),
			_el('option', { value: 'email', textContent: T('page.target.email', 'Email (newsletter)'), selected: doc.target == 'email' })]);
		target.onchange = () => { doc.target = target.value; changed(); redraw(); };
		root.append(_el('div', { className: 'pd-h', textContent: T('page.target', 'Type') }), target,
			_el('div', { className: 'pd-h', textContent: T('page.palette', 'HTML5') }));
		const pal = _el('div', { className: 'pd-pal' });
		(doc.target == 'email' ? EMAIL_PALETTE : PALETTE).forEach((t) => pal.append(_el('button', { type: 'button', textContent: t, title: '<' + t + '>', onclick: () => add(t) })));
		root.append(pal);
		// structure
		root.append(_el('div', { className: 'pd-h', textContent: T('page.structure', 'Structure') }));
		const tree = _el('div', { className: 'pd-tree', tabIndex: 0 });
		const row = (n, list, index, depth) => {
			const act = (txt, title, fn) => _el('button', { type: 'button', textContent: txt, title, onclick: (e) => { e.stopPropagation(); fn(); } });
			const at = { node: n, list, index };
			const r = _el('div', { className: 'pd-row' + (n.u === m_sel ? ' sel' : '') }, [
				_el('span', { className: 'lb', textContent: '<' + n.tag + '>' + (n.attrs.id ? ' #' + n.attrs.id : '') }),
				_el('span', { className: 'tx', textContent: n.text.slice(0, 14) }),
				act('▲', T('page.up', 'Up'), () => move(at, -1)), act('▼', T('page.down', 'Down'), () => move(at, 1)),
				act('◀', T('page.outdent', 'Outdent'), () => outdent(at)), act('▶', T('page.indent', 'Indent'), () => indent(at)),
				act('✕', T('page.delete', 'Delete'), () => remove(at))]);
			r.style.paddingLeft = (2 + depth * 8) + 'px';
			r.onclick = () => select(n);
			return r;
		};
		const walk = (list, depth) => list.forEach((n, i) => { tree.append(row(n, list, i, depth)); walk(n.children, depth + 1); });
		walk(doc.page, 0);
		if (doc.page.length == 0) { tree.append(_el('div', { className: 'pd-empty', textContent: T('page.empty', 'Empty page: add an element from the palette') })); }
		tree.onkeydown = (e) => {
			if ((e.key == 'Backspace' || e.key == 'Delete') && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) {
				const at = pick();
				if (at) { e.preventDefault(); e.stopPropagation(); remove(at); }
			}
		};
		root.append(tree);
		if (m_refocus) { m_refocus = false; setTimeout(() => tree.focus(), 0); }
		// selected node
		const at = pick();
		if (at) {
			const n = at.node;
			const live = (apply) => (e) => { apply(e.target.value); changed(); };
			const field = (label, input) => { root.lastChild.append(_el('label', { textContent: label }), input); };
			root.append(_el('div', { className: 'pd-h', textContent: T('page.node', 'Element') }), _el('div', { className: 'pd-ed' }));
			const tag = _el('input', { value: n.tag });
			tag.oninput = live((v) => { if (/^[a-z][a-z0-9-]*$/i.test(v)) { n.tag = v.toLowerCase(); } });
			tag.onchange = redraw;
			const text = _el('textarea', { rows: 2, value: n.text });
			text.oninput = live((v) => { n.text = v; });
			text.onchange = redraw;
			const id = _el('input', { value: n.attrs.id || '' });
			id.oninput = live((v) => { if (v) { n.attrs.id = v; } else { delete n.attrs.id; } });
			id.onchange = redraw;
			const cls = _el('input', { value: n.attrs.class || '', placeholder: 'igk-col-12-6' });
			cls.oninput = live((v) => { if (v) { n.attrs.class = v; } else { delete n.attrs.class; } });
			const style = _el('input', { value: n.style });
			style.oninput = live((v) => { n.style = v; });
			const other = Object.keys(n.attrs).filter((k) => k != 'id' && k != 'class');
			const attrs = _el('textarea', { rows: 2, value: other.map((k) => k + '=' + n.attrs[k]).join('\n'), placeholder: 'href=#' });
			attrs.oninput = live((v) => { // name=value per line; id and class have their own fields
				other.forEach((k) => { delete n.attrs[k]; });
				v.split('\n').forEach((l) => {
					const i = l.indexOf('=');
					const k = (i > 0 ? l.slice(0, i) : '').trim();
					if (/^[a-z_:][\w:.-]*$/i.test(k) && !/^on/i.test(k) && k != 'id' && k != 'class') { n.attrs[k] = l.slice(i + 1); }
				});
			});
			field(T('page.tag', 'Tag'), tag); field(T('page.text', 'Text'), text); field(T('page.id', 'Id'), id);
			field(T('page.class', 'Class'), cls); field(T('page.style', 'Style'), style); field(T('page.attrs', 'Attributes'), attrs);
		}
		return root;
	}
	/** File > New web page */
	function newPage(editor, target) {
		const d = editor.addDocument();
		d.setSize(target == 'email' ? 600 : 1024, 768); // 600px: the usual width of a newsletter
		d.fill = 'white';
		d.target = target == 'email' ? 'email' : 'web';
		d.kind = 'page';
		d.page = _NS.DrawingElements.page.defaultPage(d.target);
		// unique id (the counter of the editor restarts when a stored scene is restored)
		const ids = editor.documents.filter((x) => x !== d).map((x) => x.id);
		let n = 1;
		const base = d.target == 'email' ? 'email_' : 'page_';
		while (ids.indexOf(base + n) != -1) { n++; }
		d.id = base + n;
		m_sel = null;
		editor.refresh();
		editor.raiseEvent('currentDocumentChanged', { old: d, current: d }); // the inspector shows the designer
		return d;
	}
	/** File > Design Only: a free drawing document (no page tree, no code export), with its own id series */
	function newDesign(editor) {
		const d = editor.addDocument();
		d.kind = 'canvas';
		const ids = editor.documents.filter((x) => x !== d).map((x) => x.id);
		let n = 1;
		while (ids.indexOf('design_' + n) != -1) { n++; }
		d.id = 'design_' + n;
		editor.refresh();
		editor.raiseEvent('currentDocumentChanged', { old: d, current: d });
		return d;
	}
	_NS.pageDesigner = { build, newPage, newDesign };
	AC.regMenuAction('file.newPage', { index: 2, callback: (a) => newPage(a, 'web') });
	AC.regMenuAction('file.newDesign', { index: 4, callback: (a) => newDesign(a) });
	AC.regMenuAction('file.newEmail', { index: 3, callback: (a) => newPage(a, 'email') });
})();
