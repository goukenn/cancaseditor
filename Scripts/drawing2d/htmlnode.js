// author: C.A.D. BONDJE DOUE
// file: htmlnode.js
// @desc: html content element. The html is rasterized (svg foreignObject) for the canvas and exported as markup.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
	const XHTML_NS = "http://www.w3.org/1999/xhtml";
	const DEFAULT_BOUND = { x: 0, y: 0, width: 800, height: 600 };
	const DANGEROUS_TAGS = 'script,iframe,object,embed,applet,base,meta[http-equiv],link[rel~="import"]';
	/**
	 * sanitize an html string: scripts, event handlers and javascript: urls are removed.
	 * Only the body content and the style elements of the head are kept.
	 * @param {string} src html source
	 * @returns {{html:string, removed:number}}
	 */
	function sanitize(src) {
		const doc = new DOMParser().parseFromString(src || '', 'text/html');
		let removed = 0;
		doc.querySelectorAll(DANGEROUS_TAGS).forEach((e) => { e.remove(); removed++; });
		doc.querySelectorAll('*').forEach((e) => {
			for (const a of Array.from(e.attributes)) {
				if (/^on/i.test(a.name) || (/^(href|src|xlink:href|action|formaction)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) {
					e.removeAttribute(a.name);
					removed++;
				}
			}
		});
		const styles = Array.from(doc.head.querySelectorAll('style')).map((s) => s.outerHTML).join('');
		return { html: styles + doc.body.innerHTML, removed };
	}
	/**
	 * serialize an html string as well-formed xhtml
	 */
	function toXhtml(html) {
		const doc = new DOMParser().parseFromString('<body>' + (html || '') + '</body>', 'text/html');
		const div = doc.createElement('div');
		div.setAttribute('xmlns', XHTML_NS);
		while (doc.body.firstChild) {
			div.appendChild(doc.body.firstChild);
		}
		return new XMLSerializer().serializeToString(div);
	}
	igk.system.createClass(ELEM, { name: "htmlnode", parent: ELEM.rectangle }, function () {
		let m_html = '';
		let m_img = null; // rasterized content
		let m_key = null; // key of the content raster
		this.bound = Object.assign({}, DEFAULT_BOUND);
		igk.defineProperty(this, "html", {
			get() { return m_html; },
			set(v) { m_html = v || ''; m_key = null; }
		});
		igk.defineProperty(this, "width", { get() { return this.bound.width; } });
		igk.defineProperty(this, "height", { get() { return this.bound.height; } });
		this.getXhtml = function () { return toXhtml(m_html); };
		this.render = function (a) {
			const b = this.bound;
			const key = m_html + '|' + b.width + 'x' + b.height;
			if (m_key != key) {
				m_key = key;
				m_img = new Image();
				const img = m_img;
				img.onload = function () {
					if (img == m_img && ELEM.htmlnode.editor) {
						ELEM.htmlnode.editor.refresh();
					}
				};
				img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
					'<svg xmlns="http://www.w3.org/2000/svg" width="' + b.width + '" height="' + b.height + '">' +
					'<foreignObject x="0" y="0" width="100%" height="100%">' + toXhtml(m_html) + '</foreignObject></svg>');
			}
			a.save();
			a.setTransform(this.matrix);
			if (m_img && m_img.complete && m_img.naturalWidth > 0) {
				a.drawImage(m_img, b.x, b.y, b.width, b.height);
			} else {
				// placeholder until the raster is ready
				a.setFillStyle && a.setFillStyle('#fff');
			}
			a.restore();
		};
	});
	ELEM.htmlnode.sanitize = sanitize;
	ELEM.htmlnode.toXhtml = toXhtml;
	ELEM.htmlnode.DEFAULT_BOUND = DEFAULT_BOUND;
	// editor used to refresh the canvas when the raster is ready
	ELEM.htmlnode.editor = null;
	const EXPORTS = _NS.Exports;
	const SERI = _NS.Serializer;
	EXPORTS.register("htmlnode", function () {
		return EXPORTS.initExport().concat([
			{ name: "html", 'default': '' },
			{ name: "bound", serializer: SERI.boundSerializer, unserialize: SERI.boundUnserializer }
		]).concat(EXPORTS.matrixExport());
	});
})();
