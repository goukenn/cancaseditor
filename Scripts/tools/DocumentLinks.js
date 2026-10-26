// author: C.A.D. BONDJE DOUE
// file: DocumentLinks.js
// @desc: prototype links: colored arrows between documents (editor.links = [{from, to, color, label}]).
// - drawn on the surface in screen space (width and arrowheads ignore the zoom)
// - created by dragging the round handle at the right of a document label onto another document (mouse, touch, pen)
//   or with Document > Link...
// - click an arrow to change its color / label or delete it
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const AC = _NS.Actions;
	const T = (k, d) => (_NS.R && _NS.R[k]) || d || k;
	const PALETTE = ['#e8590c', '#1c7ed6', '#2f9e44', '#ae3ec9', '#f08c00', '#d6336c', '#0c8599'];
	const HANDLE_R = 8;
	const HIT = 8; // px around an arrow that selects it
	let m_sel = null; // selected link
	let m_drag = null; // {doc, x, y} link being created
	let m_chip = null; // edit chip of the selected link
	let m_shapes = []; // {link, pts} polylines (canvas pixels)

	const rectOf = (editor, doc) => (editor.documentAreas || []).find((a) => a.doc === doc);
	const handleOf = (editor, doc) => {
		const l = (editor.documentLabels || []).find((x) => x.doc === doc);
		return l ? { x: l.x + l.w + HANDLE_R + 4, y: l.y + l.h / 2 } : null;
	};
	/** bezier from the facing sides of two rectangles */
	function curve(a, b) {
		const ca = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, cb = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
		const dx = cb.x - ca.x, dy = cb.y - ca.y;
		let p0, p3, c1, c2;
		if (Math.abs(dx) * a.h >= Math.abs(dy) * a.w) { // side by side: right/left edges
			const s = dx >= 0 ? 1 : -1;
			p0 = { x: s > 0 ? a.x + a.w : a.x, y: ca.y };
			p3 = { x: s > 0 ? b.x : b.x + b.w, y: cb.y };
			const k = Math.max(40, Math.abs(p3.x - p0.x) / 2);
			c1 = { x: p0.x + s * k, y: p0.y }; c2 = { x: p3.x - s * k, y: p3.y };
		} else { // stacked: bottom/top edges
			const s = dy >= 0 ? 1 : -1;
			p0 = { x: ca.x, y: s > 0 ? a.y + a.h : a.y };
			p3 = { x: cb.x, y: s > 0 ? b.y : b.y + b.h };
			const k = Math.max(40, Math.abs(p3.y - p0.y) / 2);
			c1 = { x: p0.x, y: p0.y + s * k }; c2 = { x: p3.x, y: p3.y - s * k };
		}
		return { p0, c1, c2, p3 };
	}
	const at = (c, t) => {
		const u = 1 - t;
		const f = (a, b, d, e) => u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * d + t * t * t * e;
		return { x: f(c.p0.x, c.c1.x, c.c2.x, c.p3.x), y: f(c.p0.y, c.c1.y, c.c2.y, c.p3.y) };
	};
	function arrow(ctx, c, color, width, dashed) {
		ctx.save();
		ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
		ctx.setLineDash(dashed ? [6, 5] : []);
		ctx.beginPath(); ctx.moveTo(c.p0.x, c.p0.y);
		ctx.bezierCurveTo(c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.p3.x, c.p3.y);
		ctx.stroke();
		// head along the end tangent
		const e = c.p3, q = at(c, 0.97);
		const an = Math.atan2(e.y - q.y, e.x - q.x), L = 12 + width;
		ctx.setLineDash([]);
		ctx.beginPath(); ctx.moveTo(e.x, e.y);
		ctx.lineTo(e.x - L * Math.cos(an - 0.45), e.y - L * Math.sin(an - 0.45));
		ctx.lineTo(e.x - L * Math.cos(an + 0.45), e.y - L * Math.sin(an + 0.45));
		ctx.closePath(); ctx.fill();
		ctx.restore();
	}
	// ---- travelling circle: loops along a visible arrow; the rAF loop only lives while an arrow keeps being drawn
	const PULSE_MS = 2000;
	const m_still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
	let m_raf = 0, m_last = 0;
	/** draw the circle on bezier c ({p0,c1,c2,p3}) and keep the animation going */
	function pulse(ctx, c, color, editor) {
		if (m_still || (_NS.prefs && _NS.prefs.get('arrowAnimation', true) === false)) { return; }
		m_last = performance.now();
		const t = (m_last % PULSE_MS) / PULSE_MS, p = at(c, t);
		ctx.save();
		ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
		ctx.fillStyle = color; ctx.fill();
		ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
		ctx.restore();
		if (!m_raf) {
			m_raf = requestAnimationFrame(function () {
				m_raf = 0;
				if (document.hidden || performance.now() - m_last > 100) { return; } // no arrow drawn lately: stop
				editor.refresh(); // redraws the arrows, which re-arms the loop through pulse()
			});
		}
	}
	function draw(ctx, editor) {
		m_shapes = [];
		if (editor.documents.length < 2) { positionChip(editor); return; }
		(editor.links || []).forEach((l) => {
			const a = rectOf(editor, l.from), b = rectOf(editor, l.to);
			if (!a || !b) { return; }
			const c = curve(a, b), sel = l === m_sel;
			arrow(ctx, c, l.color, sel ? 4 : 2.5, false);
			pulse(ctx, c, l.color, editor);
			const pts = [];
			for (let i = 0; i <= 24; i++) { pts.push(at(c, i / 24)); }
			m_shapes.push({ link: l, pts, mid: at(c, 0.5) });
			if (l.label) {
				const m = at(c, 0.5);
				ctx.save();
				ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
				const w = ctx.measureText(l.label).width + 10;
				ctx.fillStyle = l.color;
				ctx.fillRect(m.x - w / 2, m.y - 10, w, 20);
				ctx.fillStyle = '#fff';
				ctx.fillText(l.label, m.x, m.y);
				ctx.restore();
			}
		});
		// handles at the right of the labels
		(editor.documentLabels || []).forEach((lb) => {
			const h = handleOf(editor, lb.doc);
			ctx.save();
			ctx.beginPath(); ctx.arc(h.x, h.y, HANDLE_R, 0, Math.PI * 2);
			ctx.fillStyle = lb.doc === editor.document ? '#c58bf0' : '#9a9a9a';
			ctx.fill();
			ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
			ctx.beginPath(); ctx.moveTo(h.x - 3, h.y); ctx.lineTo(h.x + 3, h.y); ctx.moveTo(h.x + 1, h.y - 3); ctx.lineTo(h.x + 4, h.y); ctx.lineTo(h.x + 1, h.y + 3);
			ctx.stroke();
			ctx.restore();
		});
		if (m_drag) {
			const h = handleOf(editor, m_drag.doc);
			if (h) {
				arrow(ctx, { p0: h, c1: h, c2: { x: m_drag.x, y: m_drag.y }, p3: { x: m_drag.x, y: m_drag.y } }, PALETTE[editor.links.length % PALETTE.length], 2.5, true);
			}
		}
		positionChip(editor);
	}

	// ---- edit chip of the selected link
	function closeChip() { if (m_chip) { m_chip.remove(); m_chip = null; } }
	/** select a link; the edit chip is shown only when editing (click / tap on the arrow), not after a creation */
	function select(editor, l, edit) {
		if (m_sel === l && (!edit || m_chip)) { return; }
		closeChip();
		m_sel = l;
		if (l && edit) { openChip(editor, l); }
		editor.refresh();
	}
	function openChip(editor, l) {
		const host = editor.canvas.o.parentNode;
		const chip = document.createElement('div');
		chip.className = 'ce-chip';
		const col = document.createElement('input');
		col.type = 'color'; col.value = l.color; col.title = T('link.color', 'Color');
		col.oninput = () => { l.color = col.value; editor.refresh(); };
		const lab = document.createElement('input');
		lab.type = 'text'; lab.value = l.label; lab.placeholder = T('link.label', 'Label'); lab.className = 'ce-chip-label';
		lab.oninput = () => { l.label = lab.value; editor.refresh(); };
		const del = document.createElement('button');
		del.textContent = T('link.delete', 'Delete'); del.type = 'button';
		del.onclick = () => { closeChip(); m_sel = null; editor.removeLink(l); };
		lab.onkeydown = (e) => { if (e.key == 'Enter') { select(editor, null); } };
		chip.append(col, lab, del);
		['keydown', 'keyup'].forEach((n) => chip.addEventListener(n, (e) => e.stopPropagation())); // shortcuts stay off while typing
		host.append(chip);
		m_chip = chip;
	}
	function positionChip(editor) {
		if (!m_chip) { return; }
		const s = m_shapes.find((x) => x.link === m_sel);
		if (!s) { closeChip(); m_sel = null; return; }
		const c = editor.canvas.o, r = c.getBoundingClientRect(), pr = c.parentNode.getBoundingClientRect();
		m_chip.style.left = Math.max(0, Math.round(r.left - pr.left + s.mid.x - 90)) + 'px';
		m_chip.style.top = Math.max(0, Math.round(r.top - pr.top + s.mid.y + 14)) + 'px';
	}

	// ---- pointer interaction (mouse, touch, pen)
	function dist(p, a, b) {
		const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
		const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
		return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
	}
	function init(editor) {
		const c = editor.canvas && editor.canvas.o;
		if (!c) { return; }
		const local = (e) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
		const handleAt = (p) => {
			const lb = (editor.documentLabels || []).find((l) => { const h = handleOf(editor, l.doc); return h && Math.hypot(p.x - h.x, p.y - h.y) <= HANDLE_R + 6; });
			return lb ? lb.doc : null;
		};
		const linkAt = (p) => {
			let best = null, bd = HIT + (m_shapes.length ? 0 : 0);
			m_shapes.forEach((s) => {
				for (let i = 1; i < s.pts.length; i++) {
					const d = dist(p, s.pts[i - 1], s.pts[i]);
					if (d <= bd) { bd = d; best = s.link; }
				}
			});
			return best;
		};
		c.addEventListener('pointerdown', (e) => {
			if (e.button !== 0) { return; }
			const p = local(e);
			const doc = handleAt(p);
			if (doc) {
				m_drag = { doc, x: p.x, y: p.y };
				try { c.setPointerCapture(e.pointerId); } catch (x) { }
				e.preventDefault();
				e.stopImmediatePropagation();
				return;
			}
			const l = linkAt(p);
			if (l) {
				select(editor, l, true);
				e.preventDefault();
				e.stopImmediatePropagation();
				return;
			}
			if (m_sel) { select(editor, null); }
		}, true);
		c.addEventListener('pointermove', (e) => {
			if (m_drag) {
				const p = local(e);
				m_drag.x = p.x; m_drag.y = p.y;
				editor.refresh();
				e.stopImmediatePropagation();
				return;
			}
			const p = local(e);
			c.style.cursor = handleAt(p) ? 'crosshair' : (linkAt(p) ? 'pointer' : c.style.cursor);
		}, true);
		const end = (e) => {
			if (!m_drag) { return; }
			const d = m_drag;
			m_drag = null;
			try { c.releasePointerCapture(e.pointerId); } catch (x) { }
			if (e.type == 'pointerup') {
				const p = local(e);
				const t = (editor.documentAreas || []).find((a) => a.doc !== d.doc && p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h);
				if (t) {
					const l = editor.addLink(d.doc, t.doc, PALETTE[editor.links.length % PALETTE.length], '');
					select(editor, l, false);
				}
			}
			editor.refresh();
			e.stopImmediatePropagation();
		};
		c.addEventListener('pointerup', end, true);
		c.addEventListener('pointercancel', end, true);
		document.addEventListener('keydown', (e) => { if (e.key == 'Escape' && m_sel) { select(editor, null); } });
	}

	// ---- Document > Link... : target, color, label
	function linkDialog(editor) {
		const cur = editor.document, others = editor.documents.filter((d) => d !== cur);
		if (!cur || others.length == 0) { return; }
		const row = (t, el) => { const r = document.createElement('label'); r.className = 'ce-form-row'; const s = document.createElement('span'); s.textContent = t; s.className = 'ce-form-lbl'; r.append(s, el); return r; };
		const sel = document.createElement('select');
		others.forEach((d, i) => { const o = document.createElement('option'); o.value = i; o.textContent = d.id; sel.append(o); });
		const col = document.createElement('input'); col.type = 'color'; col.value = PALETTE[editor.links.length % PALETTE.length];
		const lab = document.createElement('input'); lab.type = 'text';
		const body = document.createElement('div');
		body.append(row(T('link.target', 'Target'), sel), row(T('link.color', 'Color'), col), row(T('link.label', 'Label'), lab));
		_NS.ui.modal({
			title: T('document.link', 'Link the document to...'), content: body,
			buttons: [
				{ text: T('lay.cancel', 'Cancel'), onclick: (close) => close() },
				{ text: 'OK', primary: true, onclick: (close) => { close(); select(editor, null); const l = editor.addLink(cur, others[+sel.value], col.value, lab.value); select(editor, l, false); } }
			]
		});
	}
	AC.regMenuAction('document.link', { index: 3, callback: (a) => linkDialog(a) });
	AC.regMenuAction('document.unlink', {
		index: 4,
		callback: (a) => {
			const d = a.document;
			if (!d) { return; }
			select(a, null);
			a.links = a.links.filter((l) => l.from !== d && l.to !== d);
			a.refresh();
		}
	});
	_NS.documentLinks = { draw, pulse };
	_NS.whenEditor((editor) => setTimeout(() => init(editor), 0));
})();
