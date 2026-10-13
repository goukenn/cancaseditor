// author: C.A.D. BONDJE DOUE
// file: html.js
// @desc: open a html file as an editable document (htmlnode element)
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const _P = igk.system.promiseCall;
	const G = igk.system.createNS("igk.winui.cancasEditor.encoder", {
		"html": function () { }
	});
	/**
	 * create a new document that contains the html source
	 * @param {*} editor
	 * @param {string} source html source
	 * @returns {{removed:number}}
	 */
	function openSource(editor, source) {
		const ELEM = _NS.DrawingElements;
		const { html, removed } = ELEM.htmlnode.sanitize(source);
		const node = editor.createElement("htmlnode");
		node.html = html;
		const b = ELEM.htmlnode.DEFAULT_BOUND;
		node.bound = { x: 0, y: 0, width: b.width, height: b.height };
		ELEM.htmlnode.editor = editor;
		editor.clear();
		editor.addImageDocument(node); // document + layer + element, document sized from the element
		editor.resetFitAreaZoom();
		editor.refresh();
		return { removed };
	}
	G.html.openSource = openSource;
	G.html.decode = function (file, editor) {
		const P = new _P();
		const fr = new FileReader();
		fr.onload = function (e) {
			const r = openSource(editor, e.target.result);
			if (r.removed > 0) {
				_NS.gui.notify.Show(editor, _NS.R['msg.html.scriptsremoved']);
			}
			P.resolve();
		};
		fr.onerror = function () {
			P.reject && P.reject();
		};
		fr.readAsText(file);
		return P;
	};
	G.htm = G.html;
})();
