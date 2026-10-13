// author: C.A.D. BONDJE DOUE
// file: svg.js
// @date: 20250101 11:23:04
// @desc: export as svg visitor
"use strict";
(function () {
	const _NS = igk.system.createNS('igk.winui.cancasEditor', {});
	function svgDefPoint(pts) {
		var s = "";
		for (var i = 0; i < pts.length; i++) {
			if (i > 0)
				s += " ";
			s += Math.ceil(pts[i].x, 2) + "," + Math.ceil(pts[i].y, 2);
		}
		return s;
	};
	var SVG_NS = "http://www.w3.org/2000/svg";
	/**
	 * split a css color in a plain color and its alpha: old svg viewers ignore rgba()
	 * @returns {{c:string, a:number}}
	 */
	function svgColor(css) {
		if (typeof (css) != 'string') {
			return { c: css, a: 1 };
		}
		var ctx = document.createElement('canvas').getContext('2d');
		ctx.fillStyle = '#000000';
		ctx.fillStyle = css;
		var v = ctx.fillStyle;
		var m = /^rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)(?:\D+([\d.]+))?/.exec(v);
		if (!m) {
			return { c: v, a: 1 }; // '#rrggbb'
		}
		var hex = '#' + [m[1], m[2], m[3]].map(function (n) { return (+n).toString(16).padStart(2, '0'); }).join('');
		return { c: hex, a: m[4] === undefined ? 1 : parseFloat(m[4]) };
	};
	/**
	 * the shadows of an element: one filter in the defs of the svg root. Each shadow is a blurred, offset and
	 * colored copy of the alpha of the element; they are merged under the source graphic.
	 */
	function svgShadow(p) {
		var shadows = (this.activeShadows && this.activeShadows()) || [];
		if (shadows.length == 0) {
			return;
		}
		var doc = p.o.ownerDocument;
		var root = doc.documentElement;
		var defs = null;
		for (var i = 0; i < root.childNodes.length; i++) {
			if (root.childNodes[i].localName == 'defs') {
				defs = root.childNodes[i];
				break;
			}
		}
		if (!defs) {
			defs = doc.createElementNS(SVG_NS, 'defs');
			root.insertBefore(defs, root.firstChild);
		}
		var f = doc.createElementNS(SVG_NS, 'filter');
		var id = 'sh_' + this.id;
		f.setAttribute('id', id);
		f.setAttribute('x', '-50%');
		f.setAttribute('y', '-50%');
		f.setAttribute('width', '200%');
		f.setAttribute('height', '200%');
		var merge = doc.createElementNS(SVG_NS, 'feMerge');
		var node = function (name, attrs) {
			var n = doc.createElementNS(SVG_NS, name);
			for (var k in attrs) {
				n.setAttribute(k, attrs[k]);
			}
			f.appendChild(n);
			return n;
		};
		shadows.forEach(function (sh, i) {
			var sc = svgColor(sh.color);
			node('feGaussianBlur', { 'in': 'SourceAlpha', stdDeviation: sh.blur / 2, result: 'b' + i }); // canvas blur ~ 2 x the deviation
			node('feOffset', { 'in': 'b' + i, dx: sh.x, dy: sh.y, result: 'o' + i });
			node('feFlood', { 'flood-color': sc.c, 'flood-opacity': sc.a, result: 'c' + i });
			node('feComposite', { 'in': 'c' + i, in2: 'o' + i, operator: 'in', result: 's' + i });
		});
		// the first shadow is the top most one: merged last (the merge draws in document order)
		for (var j = shadows.length - 1; j >= 0; j--) {
			var m = doc.createElementNS(SVG_NS, 'feMergeNode');
			m.setAttribute('in', 's' + j);
			merge.appendChild(m);
		}
		var src = doc.createElementNS(SVG_NS, 'feMergeNode');
		src.setAttribute('in', 'SourceGraphic');
		merge.appendChild(src);
		f.appendChild(merge);
		defs.appendChild(f);
		p.setAttribute('filter', 'url(#' + id + ')');
	};
	/** the defs element of the svg root (created when missing) */
	function svgDefs(p) {
		var doc = p.o.ownerDocument;
		var root = doc.documentElement;
		for (var i = 0; i < root.childNodes.length; i++) {
			if (root.childNodes[i].localName == 'defs') {
				return root.childNodes[i];
			}
		}
		var defs = doc.createElementNS(SVG_NS, 'defs');
		root.insertBefore(defs, root.firstChild);
		return defs;
	};
	/**
	 * a brush of the library as a svg paint server in the defs: the coordinates are in the space of the element
	 * (userSpaceOnUse, like the canvas) so the transform of the element applies to it.
	 * @returns {string} the paint: url(#id)
	 */
	function svgBrush(p, el, ref) {
		var B = _NS.brushes;
		var def = B && B.get(B.idOf(ref));
		if (!def) {
			return 'none';
		}
		var doc = p.o.ownerDocument;
		var defs = svgDefs(p);
		var id = 'br_' + def.id + '_' + el.id;
		var b = el.bound;
		if (Array.isArray(b)) { b = b[0]; }
		if (!b || typeof b.x != 'number') { b = { x: 0, y: 0, width: 100, height: 100 }; }
		var mk = function (name, attrs, parent) {
			var n = doc.createElementNS(SVG_NS, name);
			for (var k in attrs) {
				n.setAttribute(k, attrs[k]);
			}
			(parent || defs).appendChild(n);
			return n;
		};
		var stops = function (g) {
			def.stops.forEach(function (st) {
				var c = svgColor(st.c);
				mk('stop', { offset: st.o, 'stop-color': c.c, 'stop-opacity': c.a }, g);
			});
		};
		if (def.type == 'texture') {
			var tile = B.textureTile(def, b);
			var src = B.textureSource(def);
			var pt = mk('pattern', { id: id, patternUnits: 'userSpaceOnUse', x: b.x, y: b.y, width: tile.w, height: tile.h });
			var im = mk('image', { x: 0, y: 0, width: tile.w, height: tile.h, preserveAspectRatio: 'none' }, pt);
			im.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', src);
			im.setAttribute('href', src);
		} else if (def.type == 'radial') {
			var R = Math.max(b.width, b.height);
			var g = mk('radialGradient', {
				id: id, gradientUnits: 'userSpaceOnUse', cx: b.x + def.center.x * b.width, cy: b.y + def.center.y * b.height,
				r: def.r1 * R, fx: b.x + def.center.x * b.width, fy: b.y + def.center.y * b.height
			});
			stops(g);
		} else {
			var lg = mk('linearGradient', {
				id: id, gradientUnits: 'userSpaceOnUse', x1: b.x + def.p1.x * b.width, y1: b.y + def.p1.y * b.height,
				x2: b.x + def.p2.x * b.width, y2: b.y + def.p2.y * b.height
			});
			stops(lg);
		}
		return 'url(#' + id + ')';
	};
	function svgbindSetting(p) {
		p.setAttribute("id", this.id);
		if ('stroke' in this && _NS.brushes && _NS.brushes.isRef(this.stroke)) {
			p.setAttribute("stroke", svgBrush(p, this, this.stroke));
		} else if ('stroke' in this) {
			var sc = svgColor(this.stroke);
			p.setAttribute("stroke", sc.c);
			var so = sc.a * ((typeof (this.strokeOpacity) == 'number') ? this.strokeOpacity : 1);
			if (so < 1) {
				p.setAttribute("stroke-opacity", Math.round(so * 1000) / 1000);
			}
		}
		if ('fill' in this && _NS.brushes && _NS.brushes.isRef(this.fill)) {
			p.setAttribute("fill", svgBrush(p, this, this.fill));
		} else if ('fill' in this) {
			var fc = svgColor(this.fill);
			p.setAttribute("fill", fc.c);
			var fo = fc.a * ((typeof (this.fillOpacity) == 'number') ? this.fillOpacity : 1);
			if (fo < 1) {
				p.setAttribute("fill-opacity", Math.round(fo * 1000) / 1000);
			}
		}
		svgShadow.apply(this, [p]);
		if ('strokeWidth' in this) {
			p.setAttribute("stroke-width", this.strokeWidth);
		}
		if ('matrix' in this) {
			var mat = this.matrix;
			if (!mat.isIdentity()) {
				p.setAttribute("transform", getMatrixDefinition(mat));
			}
		}
		// console.debug(this);
	};
	/**
	 * save matrix definition 		
	 * @param {{element: Array}} m 
	 * @returns 
	 */
	function getMatrixDefinition(m) {
		return "matrix(" + m.element.join(" ") + ")";
	};
	function segmentToSvgString(segments) {
		var s = "";
		segments.each_all(function () {
			s += this.getDef(ms == 0);
			ms = 1;
		});
		return s;
	};
	function SegmentRenderingVisitor() {
		//console debug new segment rendering
		var m_def = '';
		var m_dx = null;
		var m_fillrule='evenodd';
		function __d() {
			//recuperation du context de visit
			if (!m_dx)
				m_dx = new _NS.drawing2d.segments.drawingContext();
			return m_dx;
		};
		Object.defineProperty(this, 'fillRule', {get(){
			return m_fillrule;
		}, set(v){
			if (!v || /\b(evenodd|nonzero)\b/.test(v))
				m_fillrule = v;
		}});
		igk.appendProperties(this, {
			getDef: function () {
				var s = m_def || '';
				if (m_dx) {
					s += m_dx.getDef();
				}
				return s;
			},
			clearDef: function () {
				m_def = '';
				m_dx = null;
			},
			save: function () {
			},
			restore: function () {
			},
			setTransform: function (m) {
				if (_NS.Utils.IsArray(m)) {
				}
			},
			drawRect: function (x, y, w, h) {
				var dx = new _NS.drawing2d.segments.drawingContext();
				dx.moveTo(x, y);
				dx.lineTo(x + w, y);
				dx.lineTo(x + w, y + h);
				dx.lineTo(x, y + h);
				dx.close();
			},
			fillPath: function (path) {
			},
			drawPath: function (path) {
				console.debug('draw path');
			},
			fillRect: function (x, y, w, h) {
				//console.debug("fill rect");
			},
			moveTo: function (x, y) {
				__d().moveTo(x, y);
			},
			arcTo: function (x1, y2, x2, y3, radius) {
				__d().arcTo(x1, y2, x2, y3, radius);
			},
			bezierCurveTo: function (cx1, cy1, cx2, cy2, x, y) {
				__d().bezierCurveTo(cx1, cy1, cx2, cy2, x, y);
			},
			lineTo: function (x, y) {
				__d().lineTo(x, y);
			},
			ellipse(x,y,rx,ry, rotation,startAngle,endAngle,counterclockwize){
				__d().ellipse(x,y,rx,ry, rotation,startAngle,endAngle,counterclockwize);
			},
			closePath: function () {
				if (m_dx) {
					m_dx.close = 1;
					m_def += m_dx.getDef();
					m_def = null;
				}
			}
		});
	};
	// igk.system.createNS("demo", {
	function _generateSvgPath(name, n) {
		var p = n.add("path");
		svgbindSetting.apply(this, [p]);
		sgRendering = sgRendering || new SegmentRenderingVisitor();
		sgRendering.clearDef();
		this.buildPath(sgRendering);
		const fillRule = this.fillRule || sgRendering.fillRule || 'evenodd';
		p.setAttributes({
			d: sgRendering.getDef(),
			'fill-rule': fillRule
		});
	};
	var sgRendering = 0;
	var visitor = {
		'bezier': function (name, n) {
			var p = n.add("path");
			svgbindSetting.apply(this, [p]);
			var s = "";
			var ms = 0;
			this.bezierSegment.each_all(function () {
				s += this.getDef(ms == 0);
				ms = 1;
			});
			if (this.close) {
				s += "Z";
			}
			p.setAttribute("d", s);
			return p;
		},
		/**
		 * create a cangle visit
		 * @param {*} name 
		 * @param {*} n 
		 */
		'rectangle': function (name, n) {
			var b = this.bound, p = n.add("rect");
			svgbindSetting.apply(this, [p]);
			p.setAttribute("x", b.x);
			p.setAttribute("y", b.y);
			p.setAttribute("width", b.width);
			p.setAttribute("height", b.height);
		},
		'roundrect': function (name, n) {
			_generateSvgPath.apply(this, [name, n]); 
		},
		'plume': function (name, n) {
			var p = n.add("path");
			svgbindSetting.apply(this, [p]);
			var s = "";
			var start = !0;
			var cur = 0;
			var inC = 0;
			var outC = 0;
			var prevX = 0;
			var prevY = 0;
			this.segments.each_all(function () {
				var i = this.item;
				if (start) {
					s += "M" + svgDefPoint([i.point]);
					start = !1;
				} else {
					inC = {
						x: i.point.x + (i.point.x - i.handleIn.x),
						y: i.point.y + (i.point.y - i.handleIn.y)
					};
					if ((inC.x == i.point.x) &&
						(inC.y == i.point.y) &&
						(outC.x == prevX) &&
						(outC.y == prevY))
						s += "L" + svgDefPoint([i.point]);
					else {
						cur = i.point;
						s += "C";
						s += svgDefPoint([
							outC,
							inC,
							cur]);
					}
				}
				prevX = i.point.x;
				prevY = i.point.y;
				outC = {
					x: i.point.x + (i.point.x - i.handleOut.x),
					y: i.point.y + (i.point.y - i.handleOut.y)
				};
			});
			if (this.close) {
				s += "Z";
			}
			p.setAttribute("d", s);
			return p;
		},
		'htmlnode': function (name, e) {
			// html content is embedded as xhtml in a foreignObject
			var b = this.bound, p = e.add("foreignObject");
			p.setAttribute("id", this.id);
			p.setAttribute("x", b.x);
			p.setAttribute("y", b.y);
			p.setAttribute("width", b.width);
			p.setAttribute("height", b.height);
			var mat = this.matrix;
			if (mat && !mat.isIdentity()) {
				p.setAttribute("transform", getMatrixDefinition(mat));
			}
			p.setHtml(this.getXhtml());
			return p;
		},
		'document': function (name, e) {
			var W = this.width;
			var H = this.height;
			e.setAttribute("viewBox", "0 0 " + W + " " + H);
			e.setAttribute("width", W);
			e.setAttribute("height", H);
			e.setAttribute("id", this.id);
			// when background defined just append rectangle in background
			let fill = this.fill;
			if (fill && (fill!='none') && (fill!='transparent')){
				const rc = e.add('rect');
				rc.setAttribute("width", W);
				rc.setAttribute("height", H);
				rc.setAttribute("fill",  fill);
				let s = this.stroke;
				if (s){
					rc.setAttribute("stroke", s);
				}
			}
			// load ddefinition 
			{
				const pDefs = this.defs; 
				let defs =  e.add("defs");
			}
		},
		'layer': function (name, e) {
			var p = e.add("g");
			svgbindSetting.apply(this, [p]);
			return p;
		},
		'text': function(name,e){  
			let t = e.add('text');
			svgbindSetting.apply(this, [t]);
			const bound = this.bound;
			t.setAttribute('x', bound.x);
			t.setAttribute('y', bound.y);
			t.setHtml(this.text);
			return t;
		},
		'circle': function (name, n) {
			var r = this.radius;
			var c = this.center;
			if (!_NS.Utils.IsArray(r)) {
				if ((typeof (r) == 'object') && ('x' in r) && ('y' in r)) {
					if (r.x == r.y) {
						r = parseFloat(r.x);
					}
				}
			}
			var p = 0;
			if (typeof (r) == 'number') {
				p = n.add("circle");
				svgbindSetting.apply(this, [p]);
				p.setAttribute("cx", c.x);
				p.setAttribute("cy", c.y);
				p.setAttribute("r", r);
				return;
			}
			if (_NS.Utils.IsArray(r)) {
				var PATH = _NS.Utils.Path;
				var pg = n.add('path');
				svgbindSetting.apply(this, [pg]);
				var d = "";
				var x, y, crx, cry;
				//joint path
				for (var i = 0; i < r.length; i++) {
					var cr = r[i];
					// p = g.add("circle");
					// p.setAttribute("cx", c.x);
					// p.setAttribute("cy", c.y);
					// p.setAttribute("r", cr);
					//create circle with bezier curve sergement and get the definition
					if (typeof (cr) == 'number') {
						x = c.x - cr;
						y = c.y - cr;
						crx = cr * 2;
						cry = cr * 2;
					} else {
						x = c.x - cr.x;
						y = c.y - cr.y;
						crx = cr.x * 2;
						cry = cr.y * 2;
					}
					var g = new _NS.drawing2d.segments.drawingContext();
					PATH.renderEllipse(g, x, y, crx, cry);
					g.close();
					d += g.getDef();
				}
				//joint path
				//segment = new Segment ;
				pg.setAttribute("d", d);
			}
		},
		'ellipse': function (name, n) {
			var r = this.radius;
			var c = this.center;
			if (!_NS.Utils.IsArray(r)) {
				if ((typeof (r) == 'object') && ('x' in r) && ('y' in r)) {
					if (r.x == r.y) {
						r = parseFloat(r.x);
					}
				}
			}
			var p = 0;
			if (!Array.isArray (r)) {
				p = n.add("ellipse");
				svgbindSetting.apply(this, [p]);
				p.setAttribute("cx", c.x);
				p.setAttribute("cy", c.y);
				p.setAttribute("rx", r.x);
				p.setAttribute("ry", r.y);
				return;
			} 
			if (_NS.Utils.IsArray(r)) {
				var PATH = _NS.Utils.Path;
				var pg = n.add('path');
				svgbindSetting.apply(this, [pg]);
				var d = "";
				var x, y, crx, cry;
				//joint path
				for (var i = 0; i < r.length; i++) {
					var cr = r[i];
					// p = g.add("circle");
					// p.setAttribute("cx", c.x);
					// p.setAttribute("cy", c.y);
					// p.setAttribute("r", cr);
					//create circle with bezier curve sergement and get the definition
					if (typeof (cr) == 'number') {
						x = c.x - cr.x;
						y = c.y - cr.y;
						crx = cr.x * 2;
						cry = cr.y * 2;
					} else {
						x = c.x - cr.x;
						y = c.y - cr.y;
						crx = cr.x * 2;
						cry = cr.y * 2;
					}
					var g = new _NS.drawing2d.segments.drawingContext();
					PATH.renderEllipse(g, x, y, crx, cry);
					g.close();
					d += g.getDef();
				}
				//joint path
				//segment = new Segment ;
				pg.setAttribute("d", d);
			}
		}
	};
	function __getValue(d) {
		if (!d)
			return null;
		switch (typeof (d)) {
			case 'Array':
			case 'object':
				return JSON.stringify(d);
		}
		return d;
	};
	igk.system.createNS("igk.winui.cancasEditor.visitors", {
		svg: function (list, inf) {
			var EXPORTS = igk.winui.cancasEditor.Exports;
			var ELEM = igk.winui.cancasEditor.DrawingElements;
			var e = $igk(igk.dom.createXMLDocument("svg").documentElement);
			e.addComment("svg file:  generate with cancasEditor App");
			e.addComment("Author: C.A.D. BONDJE DOUE");
			e.addComment("App: CancasEditor");
			e.addComment("Version: 1.0");
			e.addComment("Date: " + igk.system.Date.format(Date.now(), "d/m/Y"));
			e.setAttribute("version", "1.1");
			e.setAttribute("xmlns", "http://www.w3.org/2000/svg");
			e.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
			e.setAttribute("xmlns:igk", "https://schema.igkdev.com/cancaseditor/2018");
			//document
			var W = inf.width || 100;
			var H = inf.height || 100;
			//size definition
			e.setAttribute("viewBox", "0 0 " + W + " " + H);
			e.setAttribute("width", W);
			e.setAttribute("height", H);
			// brush style property 
			// e.setAttribute("fill", "black");
			// e.setAttribute("stroke", "transparent");
			var glist = [{ list: list, host: e }];
			var q = 0;
			while (q = glist.pop()) {
				for (var i = 0; i < q.list.length; i++) {
					var c = q.list[i];
					var n = c.getType();
					var host = q.host;
					var g = null;
					if (n in visitor) {
						g = visitor[n].apply(c, [n, host]) || host;
					} else {
						_generateSvgPath.apply(c, [n, host]); 
					} 
					if (igk.system.isInherit(c, ELEM.drawing2DContainer)) { 
						var childs = c.Elements;
						if (childs && childs.length > 0) {
							glist.push({ host: g, list: childs });
						}
					}
				}
			}
			inf.mimetype = "application/xml+svg";
			inf.name = "project.svg";
			var d = igk.createNode("div");
			d.add(e);
			return "<?xml version=\"1.0\" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
				d.o.innerHTML;
		}
	});
})();