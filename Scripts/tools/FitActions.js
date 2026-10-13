// author: C.A.D. BONDJE DOUE
// file: FitActions.js
// @desc: "fit width" / "fit height": scale the selected element (keeping its proportions) so that its width
// (or height) equals the one of the document it belongs to, and stick it to the left (or top) edge.
// Only available for an element placed on a layer that is attached to a document.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const R = () => _NS.R || {};
	/** the document an element belongs to (element => layer => document), null otherwise */
	function documentOf(el) {
		let c = el && el['@container'];
		let guard = 0;
		while (c && guard++ < 10) {
			if (c.getType && c.getType() == 'document') { return c; }
			c = c['@container'];
		}
		return null;
	}
	const hasBound = (el) => { try { const b = el.bound; return !!b && typeof b.x == 'number' && typeof b.width == 'number'; } catch (e) { return false; } };
	const mat = (el) => (el.matrix && el.matrix.element) ? el.matrix.element.slice(0, 6) : [1, 0, 0, 1, 0, 0];
	const isIdentity = (m) => m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 1 && m[4] == 0 && m[5] == 0;
	const apply2 = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
	function worldBound(el) {
		const b = el.bound, m = mat(el);
		const p = [apply2(m, b.x, b.y), apply2(m, b.x + b.width, b.y), apply2(m, b.x, b.y + b.height), apply2(m, b.x + b.width, b.y + b.height)];
		const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
		const x = Math.min(...xs), y = Math.min(...ys);
		return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
	}
	/** m2 applied after m1 */
	const mul = (m2, m1) => [
		m2[0] * m1[0] + m2[2] * m1[1], m2[1] * m1[0] + m2[3] * m1[1],
		m2[0] * m1[2] + m2[2] * m1[3], m2[1] * m1[2] + m2[3] * m1[3],
		m2[0] * m1[4] + m2[2] * m1[5] + m2[4], m2[1] * m1[4] + m2[3] * m1[5] + m2[5]];
	/** can the element be fitted: it has a bound and sits on a layer attached to a document */
	const canFit = (el) => !!el && !!el['@container'] && hasBound(el) && !!documentOf(el) && el.getType() != 'layer' && el.getType() != 'document';
	/**
	 * @param {*} editor
	 * @param {*} el element
	 * @param {'width'|'height'|'both'} dir
	 * @returns {boolean} true when the element was changed
	 */
	/**
	 * stretch the element to the size of the document: the matrix is reset to identity first.
	 * Geometry that is not driven by the bound (circle, star...) is stretched with a scale matrix.
	 */
	function fitBoth(editor, el, doc) {
		const W = doc.width, H = doc.height;
		el.matrix.copytransform([1, 0, 0, 1, 0, 0]);
		const type = el.getType();
		if (type == 'ellipse' && el.center) {
			// a radius pair {x, y} stretches the ellipse
			el.center = { x: W / 2, y: H / 2 };
			el.radius = { x: W / 2, y: H / 2 };
			el.initialize && el.initialize();
		} else if ((type == 'star' || type == 'circle') && el.center) {
			// driven by one radius: they cannot be stretched, they fill the smallest side of the document
			el.center = { x: W / 2, y: H / 2 };
			el.radius = Math.min(W, H) / 2;
			el.initialize && el.initialize();
		} else {
			try { el.bound = { x: 0, y: 0, width: W, height: H }; } catch (e) { /* computed bound */ }
			el.initialize && el.initialize();
			const w = worldBound(el); // identity matrix: the bound of the geometry
			if (Math.abs(w.x) > 0.5 || Math.abs(w.y) > 0.5 || Math.abs(w.width - W) > 0.5 || Math.abs(w.height - H) > 0.5) {
				if (w.width > 0 && w.height > 0) {
					const sx = W / w.width, sy = H / w.height;
					el.matrix.copytransform([sx, 0, 0, sy, -w.x * sx, -w.y * sy]);
				}
			}
		}
		editor.refresh();
		editor.raiseEvent('selectChanged', { items: [el] });
		return true;
	}
	function fit(editor, el, dir) {
		if (!canFit(el)) {
			_NS.gui.notify.Show(editor, R()['msg.fit.nodoc']);
			return false;
		}
		const doc = documentOf(el);
		if (dir == 'both') {
			return fitBoth(editor, el, doc);
		}
		const w = worldBound(el);
		const size = dir == 'width' ? w.width : w.height;
		if (!(size > 0)) { return false; }
		const s = (dir == 'width' ? doc.width : doc.height) / size; // uniform scale: the proportions are kept
		const m = mat(el);
		if (isIdentity(m)) {
			// the geometry stays in the bound: strokes and radius keep their own scale
			const b = el.bound;
			el.bound = {
				x: dir == 'width' ? 0 : b.x,
				y: dir == 'height' ? 0 : b.y,
				width: b.width * s, height: b.height * s
			};
		} else {
			// scale around the top left corner of the element, then stick it to the edge
			const S = [s, 0, 0, s, w.x - s * w.x, w.y - s * w.y];
			let n = mul(S, m);
			el.matrix.copytransform(n);
			const nw = worldBound(el);
			n = mul([1, 0, 0, 1, dir == 'width' ? -nw.x : 0, dir == 'height' ? -nw.y : 0], n);
			el.matrix.copytransform(n);
		}
		el.initialize && el.initialize();
		editor.refresh();
		editor.raiseEvent('selectChanged', { items: [el] }); // the inspector shows the new geometry
		return true;
	}
	const target = (a) => a.element || (a.tool && a.tool.elem) || null;
	AC.regMenuAction("edit.fitWidth", { index: 600, callback: (a) => fit(a, target(a), 'width') });
	AC.regMenuAction("edit.fitHeight", { index: 601, callback: (a) => fit(a, target(a), 'height') });
	AC.regMenuAction("edit.fitBoth", { index: 602, callback: (a) => fit(a, target(a), 'both') });
	_NS.fit = { fit, canFit, documentOf };
})();
