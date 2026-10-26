// author: C.A.D. BONDJE DOUE
// file: hotspot.js
// @desc: prototype hotspot: a rectangle (drawn, moved, resized like any rectangle) that, in Present mode,
// navigates to another document when clicked or tapped. Invisible outside the live editor: present mode,
// SVG/PNG/JS exports and printing never draw it, so it never ends up as real artwork.
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const ELEM = igk.system.createNS(_NS.fullname + ".DrawingElements", {});
	const Tools = _NS.Tools;
	const ACTIONS = _NS.Actions;
	const SERI = _NS.Serializer;
	const EXPORTS = _NS.Exports;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;
	const _TN_ = 'hotspot';

	igk.system.createClass(ELEM, { name: _TN_, parent: ELEM.rectangle }, function () {
		this.fill = 'rgba(28,126,214,0.12)';
		this.stroke = '#1c7ed6';
		this.strokeWidth = 2;
		this.target = ''; // id of the document to navigate to (Present mode); empty = not linked yet
		this.render = function (o) {
			if (o !== _NS.app) { return; } // only the live editor shows the hotspot; everything else ignores it
			const b = this.bound;
			if (!b || !b.width || !b.height) { return; }
			o.save();
			o.setTransform(this.matrix);
			o.fill = this.fill;
			o.fillRect(b.x, b.y, b.width, b.height);
			o.stroke = this.target ? this.stroke : '#e03131'; // red outline: no target picked yet
			o.strokeWidth = this.strokeWidth;
			if (o.setDashPattern) { o.setDashPattern([6, 4]); }
			o.drawRect(b.x, b.y, b.width, b.height);
			if (o.setDashPattern) { o.setDashPattern([]); }
			// link glyph at the center
			if (o.setFont && o.fillText) {
				const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
				const size = Math.max(10, Math.min(22, Math.min(b.width, b.height) / 2));
				o.setFont(size + 'px sans-serif');
				if (o.setTextAlign) { o.setTextAlign('center'); }
				o.fill = this.target ? this.stroke : '#e03131';
				o.fillText('→', cx - size / 3, cy + size / 3); // right arrow
			}
			o.restore();
		};
	});
	igk.system.createClass(Tools, { name: 'HotspotMecanism', parent: Tools.RectangleMecanism }, function () {
		this.createElement = function () {
			return this.host.add(_TN_);
		};
	});
	Tools.registerEditorAttribute(_TN_, Tools.HotspotMecanism);
	EXPORTS.register(_TN_, function () {
		return EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
			{ name: 'bound', serializer: SERI.boundSerializer, unserialize: SERI.boundUnserializer },
			{ name: 'target', 'default': '' }
		]).concat(EXPORTS.matrixExport());
	});
	ACTIONS.regActions(null, "editor.selectool.hotspot", function (a) { a.tool = new Tools.HotspotMecanism(); });
	ACTIONS.regMenuAction("tools.hotspot", { index: 9, callback: function () { ACTIONS.invoke("editor.selectool.hotspot"); } });

	// ---- target picker: a small chip shown over the hotspot while it is being edited (selected)
	let m_chip = null;
	let m_active = null; // the hotspot currently selected: drawn as a dashed arrow to its target document
	function closeChip() { if (m_chip) { m_chip.remove(); m_chip = null; } m_active = null; }
	/** dashed arrow from the selected hotspot (current document) to its target document, in screen space */
	function drawLink(ctx, editor) {
		if (!m_active || !m_active.target) { return; }
		const src = (editor.documentAreas || []).find((a) => a.doc === editor.document);
		const dst = (editor.documentLabels || []).find((l) => l.doc.id == m_active.target); // the arrow points at the label of the target document
		if (!src || !dst || dst.doc === editor.document) { return; }
		const view = editor.matrix.element; // [zoom,0,0,zoom,tx,ty] of the current document
		const mat = (m_active.matrix && m_active.matrix.element) ? m_active.matrix.element : [1, 0, 0, 1, 0, 0];
		const b = m_active.bound;
		const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
		const wx = mat[0] * cx + mat[2] * cy + mat[4], wy = mat[1] * cx + mat[3] * cy + mat[5];
		const p0 = { x: wx * view[0] + view[4], y: wy * view[3] + view[5] };
		const p1 = { x: Math.max(dst.x, Math.min(p0.x, dst.x + dst.w)), y: Math.max(dst.y, Math.min(p0.y, dst.y + dst.h)) }; // nearest point of the label box
		ctx.save();
		ctx.strokeStyle = '#1c7ed6'; ctx.fillStyle = '#1c7ed6'; ctx.lineWidth = 2; ctx.lineCap = 'round';
		ctx.setLineDash([7, 5]);
		// bezier: leaves the hotspot and enters the label along the dominant axis (horizontal or vertical tangents)
		const dx = p1.x - p0.x, dy = p1.y - p0.y, horiz = Math.abs(dx) >= Math.abs(dy);
		const k = Math.max(40, (horiz ? Math.abs(dx) : Math.abs(dy)) / 2), sx = dx >= 0 ? 1 : -1, sy = dy >= 0 ? 1 : -1;
		const c1 = horiz ? { x: p0.x + sx * k, y: p0.y } : { x: p0.x, y: p0.y + sy * k };
		const c2 = horiz ? { x: p1.x - sx * k, y: p1.y } : { x: p1.x, y: p1.y - sy * k };
		ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p1.x, p1.y); ctx.stroke();
		ctx.setLineDash([]);
		const an = Math.atan2(p1.y - c2.y, p1.x - c2.x), L = 14; // head along the end tangent
		ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p1.x - L * Math.cos(an - 0.4), p1.y - L * Math.sin(an - 0.4));
		ctx.lineTo(p1.x - L * Math.cos(an + 0.4), p1.y - L * Math.sin(an + 0.4));
		ctx.closePath(); ctx.fill();
		ctx.restore();
		if (_NS.documentLinks) { _NS.documentLinks.pulse(ctx, { p0, c1, c2, p3: p1 }, '#1c7ed6', editor); } // circle travelling along the arrow
	}
	function openChip(editor, el) {
		closeChip();
		m_active = el;
		const view = () => editor.matrix.element; // [zoom,0,0,zoom,tx,ty] of the current document
		const mat = () => (el.matrix && el.matrix.element) ? el.matrix.element : [1, 0, 0, 1, 0, 0];
		const world = (p) => { const m = mat(); return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }; };
		const toScreen = (p) => { const v = view(); return { x: p.x * v[0] + v[4], y: p.y * v[3] + v[5] }; };
		const b = el.bound;
		const top = toScreen(world({ x: b.x, y: b.y }));
		const chip = document.createElement('div');
		chip.className = 'ce-chip';
		const lab = document.createElement('span');
		lab.textContent = T('hotspot.goto', 'Go to');
		lab.className = 'ce-chip-hint';
		const sel = document.createElement('select');
		const none = document.createElement('option');
		none.value = ''; none.textContent = T('hotspot.none', '(none)');
		sel.append(none);
		(editor.documents || []).forEach((d) => {
			if (d === editor.document) { return; } // no link to the document being edited
			const o = document.createElement('option');
			o.value = d.id; o.textContent = d.id;
			if (d.id == el.target) { o.selected = true; }
			sel.append(o);
		});
		sel.onchange = () => { el.target = sel.value; editor.refresh(); };
		chip.append(lab, sel);
		['keydown', 'keyup', 'pointerdown'].forEach((n) => chip.addEventListener(n, (e) => e.stopPropagation()));
		editor.canvas.o.parentNode.append(chip);
		chip.style.left = Math.max(0, Math.round(top.x)) + 'px';
		chip.style.top = Math.max(0, Math.round(top.y - 40)) + 'px';
		m_chip = chip;
	}
	_NS.whenEditor((editor) => {
		editor.regEvent('itemStartEdition', (e) => { if (e.element && e.element.getType && e.element.getType() == _TN_) { openChip(editor, e.element); } else { closeChip(); } });
		editor.regEvent('itemEndEdition', closeChip);
		['currentDocumentChanged', 'zoomChanged', 'elementRemoved'].forEach((n) => editor.regEvent(n, closeChip));
	});
	_NS.hotspotLinks = { draw: drawLink };
})();
