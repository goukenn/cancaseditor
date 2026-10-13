// author: C.A.D. BONDJE DOUE
// file: markup.js
// @desc: export the document as markup: html, phtml (balafon view) and bview (igk/bviewParser).
// The svg visitor produces the document, it is parsed to a neutral tree that feeds each emitter.
"use strict";
(function () {
	const _NS = igk.system.createNS('igk.winui.cancasEditor', {});
	const SVG_NS = "http://www.w3.org/2000/svg";
	const VOID_TAGS = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
	/**
	 * @typedef {{tag:string, attrs:Object<string,string>, children:Array<MarkupNode>, text?:string}} MarkupNode
	 */
	/**
	 * convert a DOM element (svg or html) to a neutral tree
	 * @param {Element} el
	 * @returns {MarkupNode}
	 */
	function fromDom(el) {
		const n = { tag: el.localName || el.tagName.toLowerCase(), attrs: {}, children: [] };
		if (el.namespaceURI == SVG_NS && el.parentNode && el.parentNode.nodeType == 9) {
			n.attrs.xmlns = SVG_NS;
		}
		for (const a of Array.from(el.attributes)) {
			n.attrs[a.name] = a.value;
		}
		for (const c of Array.from(el.childNodes)) {
			if (c.nodeType == 1) {
				n.children.push(fromDom(c));
			} else if (c.nodeType == 3 || c.nodeType == 4) {
				const t = c.nodeValue.trim();
				if (t) {
					n.children.push({ tag: '#text', attrs: {}, children: [], text: t });
				}
			}
		}
		return n;
	}
	/**
	 * parse an svg document string to a tree
	 * @param {string} svg
	 */
	function fromSvgString(svg) {
		const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
		if (doc.getElementsByTagName('parsererror').length > 0) {
			throw new Error(_NS.R && _NS.R['msg.html.invalid'] || 'Invalid document');
		}
		return fromDom(doc.documentElement);
	}
	const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const escAttr = (s) => escHtml(s).replace(/"/g, '&quot;');
	function toHtml(n, indent) {
		const pad = '\t'.repeat(indent);
		if (n.tag == '#fragment') {
			return n.children.map((c) => toHtml(c, indent)).join('');
		}
		if (n.tag == '#text') {
			return pad + escHtml(n.text) + '\n';
		}
		let s = pad + '<' + n.tag;
		for (const k in n.attrs) {
			s += ' ' + k + '="' + escAttr(n.attrs[k]) + '"';
		}
		if (n.children.length == 0) {
			return s + (VOID_TAGS.test(n.tag) ? '/>' : '></' + n.tag + '>') + '\n';
		}
		s += '>\n';
		for (const c of n.children) {
			s += toHtml(c, indent + 1);
		}
		return s + pad + '</' + n.tag + '>\n';
	}
	// php single quoted string
	const phpStr = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
	function toPhtml(n, depth, parentVar) {
		if (n.tag == '#fragment') {
			return n.children.map((c) => toPhtml(c, depth, parentVar)).join('');
		}
		if (n.tag == '#text') {
			return parentVar + '->text(' + phpStr(n.text) + ');\n';
		}
		const v = '$n' + depth;
		let s = v + ' = ' + parentVar + '->add(' + phpStr(n.tag) + ')';
		const keys = Object.keys(n.attrs);
		if (keys.length > 0) {
			s += '->setAttributes([' + keys.map((k) => phpStr(k) + ' => ' + phpStr(n.attrs[k])).join(', ') + '])';
		}
		s += ';\n';
		for (const c of n.children) {
			s += toPhtml(c, depth + 1, v);
		}
		return s;
	}
	const bviewStr = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
	function toBview(n, indent) {
		const pad = '\t'.repeat(indent);
		if (n.tag == '#fragment') {
			return n.children.map((c) => toBview(c, indent)).join('');
		}
		if (n.tag == '#text') {
			return pad + '- ' + n.text.replace(/[{}]/g, (m) => '\\' + m) + '\n';
		}
		// xmlns:* declarations are not representable as bview attributes
		const keys = Object.keys(n.attrs).filter((k) => !/^xmlns:/.test(k));
		let s = pad + n.tag;
		if (keys.length > 0) {
			s += '(' + keys.map((k) => k + '=' + bviewStr(n.attrs[k])).join(' ') + ')';
		}
		if (n.children.length == 0) {
			return s + ' {}\n';
		}
		s += ' {\n';
		for (const c of n.children) {
			s += toBview(c, indent + 1);
		}
		return s + pad + '}\n';
	}
	const header = (file, kind) => [
		'author: C.A.D. BONDJE DOUE',
		'file: ' + file,
		'generator: CancasEditor ' + kind,
		'date: ' + igk.system.Date.format(Date.now(), "d/m/Y")
	];
	/**
	 * build the tree of the current document.
	 * @param {*} list editor list
	 * @param {*} inf export info (width, height)
	 */
	// all the drawing elements of a list, containers excluded
	function leaves(list, out) {
		for (let i = 0; i < list.length; i++) {
			const e = list[i];
			if (e.Elements && e.Elements.length > 0) {
				leaves(e.Elements, out);
			} else if (e.getType && !/^(document|layer)$/.test(e.getType())) {
				out.push(e);
			}
		}
		return out;
	}
	function documentTree(list, inf) {
		// a document made only of html content is exported as an html fragment
		const items = leaves(list, []);
		if (items.length > 0 && items.every((i) => i.getType() == 'htmlnode')) {
			const root = { tag: '#fragment', attrs: {}, children: [] };
			for (const i of items) {
				const doc = new DOMParser().parseFromString('<body>' + i.html + '</body>', 'text/html');
				Array.from(doc.head.children).concat(Array.from(doc.body.children)).forEach((c) => root.children.push(fromDom(c)));
			}
			return root;
		}
		const svg = _NS.visitors.svg(list, Object.assign({}, inf));
		return fromSvgString(svg);
	}
	const emitters = {
		html(tree, inf) {
			inf.mimetype = 'text/html';
			inf.name = 'project.html';
			const lang = document.documentElement.getAttribute('lang') || 'en';
			const title = escHtml(inf.title || 'project');
			return '<!DOCTYPE html>\n<html lang="' + escAttr(lang) + '">\n<head>\n\t<meta charset="utf-8"/>\n' +
				'\t<meta name="viewport" content="width=device-width, initial-scale=1"/>\n' +
				'\t<meta name="generator" content="CancasEditor"/>\n' +
				'\t<title>' + title + '</title>\n</head>\n<body>\n' + toHtml(tree, 1) + '</body>\n</html>\n';
		},
		phtml(tree, inf) {
			inf.mimetype = 'text/x-php';
			inf.name = 'project.phtml';
			return '<?php\n' + header(inf.name, 'phtml').map((l) => '// @' + l + '\n').join('') +
				'$t->clearChilds();\n' + toPhtml(tree, 0, '$t');
		},
		bview(tree, inf) {
			inf.mimetype = 'text/plain';
			inf.name = 'project.bview';
			return '/* bview file */\n' + header(inf.name, 'bview').map((l) => '# @' + l + '\n').join('') +
				toBview(tree, 0);
		}
	};
	const visitors = {};
	for (const k in emitters) {
		visitors[k] = function (list, inf) {
			return emitters[k](documentTree(list, inf), inf);
		};
	}
	igk.system.createNS("igk.winui.cancasEditor.visitors", visitors);
	// markup helpers shared with the html encoder
	igk.system.createNS("igk.winui.cancasEditor.markup", { fromDom, fromSvgString, toHtml, toPhtml, toBview, emitters, VOID_TAGS });
})();
