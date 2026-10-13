// author: C.A.D. BONDJE DOUE
// file: exports.extra.js
// @desc: save/load definitions of the elements that did not have one (ellipse, path): without them
// nothing but the element itself was stored (no fill, stroke, shadow, matrix).
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const EXPORTS = _NS.Exports;
	const SERI = _NS.Serializer;
	const common = () => EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport());
	EXPORTS.register("ellipse", function () {
		return common().concat([
			{ name: 'center', serializer: SERI.vector2Serializer, unserialize: SERI.vector2Unserializer },
			{ name: 'radius', serializer: SERI.vector2Serializer, unserialize: SERI.vector2Unserializer }
		]).concat(EXPORTS.matrixExport());
	});
	EXPORTS.register("path", function () {
		return common().concat([
			{ name: 'd', "default": null, serializer: (v) => (typeof (v) == 'string' ? v : null) }
		]).concat(EXPORTS.matrixExport());
	});
})();
