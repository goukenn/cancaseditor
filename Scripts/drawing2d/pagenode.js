// author: C.A.D. BONDJE DOUE
// file: pagenode.js
// @desc: model of a web page document (document.kind == 'page'): a tree of plain nodes {u, tag, text, attrs, style,
// children} stored in document.page (saved as json with the document). Helpers to build, search, move and render the
// tree to html. The tree is edited by tools/PageDesigner.js.
"use strict";
(function () {
	const ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
	const TAG_RE = /^[a-z][a-z0-9-]*$/i;
	const VOID_RE = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
	let m_uid = 0;
	/** a new node */
	function node(tag, text, attrs) {
		return { u: ++m_uid, tag: TAG_RE.test(tag || '') ? String(tag).toLowerCase() : 'div', text: text || '', attrs: attrs || {}, style: '', children: [] };
	}
	/** a clean copy of a tree loaded from json (unknown fields dropped, new runtime ids) */
	function normalize(list, depth) {
		depth = depth || 0;
		if (!Array.isArray(list) || depth > 40) { return []; }
		return list.filter((n) => n && typeof n == 'object').map((n) => {
			const r = node(n.tag, typeof n.text == 'string' ? n.text : '');
			if (n.attrs && typeof n.attrs == 'object') {
				for (const k in n.attrs) { if (/^[a-z_:][\w:.-]*$/i.test(k) && !/^on/i.test(k)) { r.attrs[k] = String(n.attrs[k]); } }
			}
			r.style = typeof n.style == 'string' ? n.style : '';
			r.children = normalize(n.children, depth + 1);
			return r;
		});
	}
	/** html of a tree (the result is still sanitized by the renderer) */
	function toHtml(list) {
		const holder = document.createElement('div');
		const build = (parent, n) => {
			const e = document.createElement(n.tag);
			for (const k in n.attrs) { e.setAttribute(k, n.attrs[k]); }
			if (n.style) { e.setAttribute('style', n.style); }
			if (n.text) { e.appendChild(document.createTextNode(n.text)); }
			if (!VOID_RE.test(n.tag)) { n.children.forEach((c) => build(e, c)); }
			parent.appendChild(e);
		};
		(list || []).forEach((n) => build(holder, n));
		return holder.innerHTML;
	}
	/** @returns {{node:Object, list:Array, index:number}|null} the node with the runtime id u */
	function find(list, u) {
		for (let i = 0; i < (list || []).length; i++) {
			if (list[i].u === u) { return { node: list[i], list, index: i }; }
			const r = find(list[i].children, u);
			if (r) { return r; }
		}
		return null;
	}
	/** the page of a new web page document; an email (newsletter) is a table layout, the only layout the mail clients agree on */
	function defaultPage(target) {
		if (target == 'email') {
			const t = node('table', '', { width: '100%', cellpadding: '0', cellspacing: '0', border: '0', role: 'presentation' });
			const tr = node('tr'), td = node('td');
			td.style = 'padding:24px;font-family:Arial,sans-serif';
			td.children.push(node('h1', 'Title'), node('p', 'Text'));
			tr.children.push(td);
			t.children.push(tr);
			return [t];
		}
		const main = node('main');
		main.style = 'padding:24px';
		main.children.push(node('h1', 'Title'), node('p', 'Text'));
		return [main];
	}
	ELEM.page = { node, normalize, toHtml, find, defaultPage, isVoid: (t) => VOID_RE.test(t) };
})();
