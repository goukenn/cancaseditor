// author: C.A.D. BONDJE DOUE
// file: brushes.js
// @desc: brush library. A fill (or stroke) that is not a plain color is the string "brush:<id>"; the definition
// of the brush (linear / radial gradient, texture) lives here, so several elements can share one brush.
//  - user brushes are stored in the user options (brush.<id> = json, brushes = [ids]) and follow the user
//  - document brushes are embedded in the document (<brushes>) and registered when it is loaded
"use strict";
(function () {
	const _NS = igk.winui.cancasEditor;
	const PREFIX = 'brush:';
	const OPT_INDEX = 'brushes';
	const OPT_PREFIX = 'brush.';
	const SERVER_LIMIT = 4096; // size of an option value accepted by the server
	const reg = new Map(); // id => {def, scope: 'user'|'doc'}
	const images = new Map(); // image source => {img, ready}
	const listeners = [];
	const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
	const num = (v, d) => { v = Number(v); return isNaN(v) ? d : v; };
	const emit = () => listeners.forEach((f) => f());
	function newId() {
		let id;
		do { id = 'b' + Math.random().toString(36).substr(2, 7); } while (reg.has(id) || /[^a-z0-9]/.test(id));
		return id;
	}
	/** complete a definition with the defaults of its type */
	function normalize(def) {
		def = def || {};
		const type = ['linear', 'radial', 'texture'].indexOf(def.type) == -1 ? 'linear' : def.type;
		const stops = (Array.isArray(def.stops) && def.stops.length > 1 ? def.stops : [{ o: 0, c: '#ffffff' }, { o: 1, c: '#000000' }])
			.map((s) => ({ o: clamp(num(s.o, 0), 0, 1), c: String(s.c || '#000000') }))
			.sort((a, b) => a.o - b.o);
		const pt = (p, d) => ({ x: num(p && p.x, d.x), y: num(p && p.y, d.y) });
		return {
			id: def.id, name: def.name || '', type, stops,
			p1: pt(def.p1, { x: 0, y: 0.5 }), p2: pt(def.p2, { x: 1, y: 0.5 }), // linear: fractions of the element bound
			center: pt(def.center, { x: 0.5, y: 0.5 }), r0: clamp(num(def.r0, 0), 0, 4), r1: clamp(num(def.r1, 0.5), 0, 4), // radial: fraction of the larger side
			image: type == 'texture' ? String(def.image || '') : '', // small version of the picture (thumbnail)
			source: type == 'texture' ? String(def.source || '') : '', // the picture at its real size (local / document only)
			mode: ['thumb', 'real', 'bound'].indexOf(def.mode) == -1 ? 'thumb' : def.mode, // thumb: the thumbnail, real: real size, bound: stretched to the element bound
			repeat: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'].indexOf(def.repeat) == -1 ? 'repeat' : def.repeat,
			scale: clamp(num(def.scale, 1), 0.05, 20)
		};
	}
	const prefs = () => _NS.prefs;
	function persist(id) {
		const p = prefs();
		const e = reg.get(id);
		if (!p || !e || e.scope != 'user') { return; }
		p.set(OPT_PREFIX + id, JSON.stringify(e.def));
		p.set(OPT_INDEX, JSON.stringify(Array.from(reg.entries()).filter(([, v]) => v.scope == 'user').map(([k]) => k)));
	}
	/** the picture used by a texture: the thumbnail, or the real size picture when the mode asks for it (and it is there) */
	const textureSource = (def) => (def.mode != 'thumb' && def.source) ? def.source : def.image;
	function textureImage(def) {
		const src = textureSource(def);
		if (!src) { return null; }
		let e = images.get(src);
		if (!e) {
			const img = new Image();
			e = { img, ready: false };
			img.onload = () => { e.ready = true; _NS.app && _NS.app.refresh(); };
			img.src = src;
			images.set(src, e);
		}
		return e.ready ? e.img : null;
	}
	const brushes = {
		PREFIX,
		isRef: (v) => typeof v == 'string' && v.indexOf(PREFIX) == 0,
		ref: (id) => PREFIX + id,
		idOf: (ref) => String(ref).substring(PREFIX.length),
		get: (id) => (reg.get(id) || {}).def || null,
		scopeOf: (id) => (reg.get(id) || {}).scope || null,
		list: () => Array.from(reg.values()).map((e) => e.def),
		onChange: (fn) => listeners.push(fn),
		normalize,
		/** create a brush (user scope by default: stored in the user options) */
		create(def, scope) {
			const id = newId();
			reg.set(id, { def: Object.assign(normalize(def), { id }), scope: scope || 'user' });
			persist(id);
			emit();
			return id;
		},
		/** change a brush: every element that references it follows */
		update(id, patch) {
			const e = reg.get(id);
			if (!e) { return null; }
			e.def = normalize(Object.assign({}, e.def, patch, { id }));
			if (e.scope == 'doc') { e.scope = 'user'; } // an edited brush of a document joins the library
			persist(id);
			emit();
			_NS.app && _NS.app.refresh();
			return e.def;
		},
		remove(id) {
			if (!reg.delete(id)) { return; }
			const p = prefs();
			if (p) {
				p.set(OPT_PREFIX + id, '');
				p.set(OPT_INDEX, JSON.stringify(Array.from(reg.entries()).filter(([, v]) => v.scope == 'user').map(([k]) => k)));
			}
			emit();
		},
		copy(id) {
			const d = brushes.get(id);
			return d ? brushes.create(Object.assign({}, d, { id: undefined, name: d.name ? d.name + ' (2)' : '' })) : null;
		},
		/** register a brush read from a document: it is not stored in the library */
		embed(def) {
			if (!def || !def.id || /[^a-zA-Z0-9_\-]/.test(def.id)) { return; }
			const cur = reg.get(def.id);
			const n = normalize(def);
			if (cur && JSON.stringify(cur.def) == JSON.stringify(n)) { return; }
			reg.set(def.id, { def: n, scope: (cur && cur.scope == 'user' && JSON.stringify(cur.def) == JSON.stringify(n)) ? 'user' : 'doc' });
			emit();
		},
		/** the ids of the brushes used by the fill/stroke of the elements of a list */
		usedIds(list) {
			const used = new Set();
			const q = [list];
			let c;
			while ((c = q.pop())) {
				for (let i = 0; i < c.length; i++) {
					const e = c[i];
					['fill', 'stroke'].forEach((k) => { if (brushes.isRef(e[k])) { used.add(brushes.idOf(e[k])); } });
					if (e.Elements && e.Elements.length > 0) { q.push(e.Elements); }
				}
			}
			return Array.from(used).filter((id) => reg.has(id)).sort();
		},
		/** the size of the image of a texture (for the svg export) */
		textureSize(def) {
			const e = images.get(textureSource(def));
			return e && e.ready ? { w: e.img.naturalWidth, h: e.img.naturalHeight } : { w: 64, h: 64 };
		},
		textureSource,
		/**
		 * size of one tile of a texture, in the space of the element: thumbnail and real size use the pixels of the
		 * picture times the scale, "bound" stretches the picture to the bound of the element
		 * @returns {{w:number,h:number}}
		 */
		textureTile(def, b) {
			const s = brushes.textureSize(def);
			if (def.mode == 'bound') { return { w: Math.max(1, b.width), h: Math.max(1, b.height) }; }
			return { w: s.w * def.scale, h: s.h * def.scale };
		},
		/**
		 * canvas style (gradient or pattern) of a brush for an element. The coordinates are fractions of the bound of
		 * the element, in its own space: the style is used with the element transform.
		 * @returns {string|CanvasGradient|CanvasPattern}
		 */
		resolve(ctx, ref, el) {
			const def = brushes.get(brushes.idOf(ref));
			if (!def) { return 'rgba(0, 0, 0, 0)'; }
			let b = el && el.bound;
			if (Array.isArray(b)) { b = b[0]; }
			if (!b || typeof b.x != 'number') { b = { x: 0, y: 0, width: 100, height: 100 }; }
			if (def.type == 'texture') {
				const img = textureImage(def);
				if (!img) { return 'rgba(128, 128, 128, 0.25)'; } // until the image is loaded
				const p = ctx.createPattern(img, def.repeat);
				if (p && typeof DOMMatrix == 'function') {
					const t = brushes.textureTile(def, b);
					p.setTransform(new DOMMatrix([t.w / img.naturalWidth, 0, 0, t.h / img.naturalHeight, b.x, b.y]));
				}
				return p || 'rgba(0, 0, 0, 0)';
			}
			let g;
			if (def.type == 'radial') {
				const R = Math.max(b.width, b.height);
				const cx = b.x + def.center.x * b.width, cy = b.y + def.center.y * b.height;
				g = ctx.createRadialGradient(cx, cy, def.r0 * R, cx, cy, Math.max(def.r1 * R, def.r0 * R + 0.001));
			} else {
				g = ctx.createLinearGradient(b.x + def.p1.x * b.width, b.y + def.p1.y * b.height, b.x + def.p2.x * b.width, b.y + def.p2.y * b.height);
			}
			def.stops.forEach((s) => { try { g.addColorStop(s.o, s.c); } catch (e) { /* invalid color */ } });
			return g;
		},
		/** is the definition small enough to be synchronized with the server */
		fitsServer(def) { return JSON.stringify(def).length <= SERVER_LIMIT; },
		/** load the library of the user (options) */
		loadUser() {
			const p = prefs();
			if (!p) { return; }
			let ids = [];
			try { ids = JSON.parse(p.get(OPT_INDEX, '[]')) || []; } catch (e) { }
			Array.from(reg.entries()).forEach(([k, v]) => { if (v.scope == 'user') { reg.delete(k); } });
			ids.forEach((id) => {
				try {
					const raw = p.get(OPT_PREFIX + id, '');
					if (raw) { reg.set(id, { def: Object.assign(normalize(JSON.parse(raw)), { id }), scope: 'user' }); }
				} catch (e) { }
			});
			emit();
		}
	};
	_NS.brushes = brushes;
	_NS.whenEditor(() => setTimeout(() => {
		brushes.loadUser();
		_NS.prefs && _NS.prefs.onChange((what) => { if (what == 'server') { brushes.loadUser(); _NS.app && _NS.app.refresh(); } });
	}, 0));
})();
