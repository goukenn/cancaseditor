"use strict";
//section mecanism
/**
 * @typedef ISelectionBound
 * @property {number} x
 * @property {number} y
 * @property {number} [width]
 * @property {number} [height]
 */
(function () {
	var _NS = igk.winui.cancasEditor;
	var Matrix = _NS.Matrix; //igk.winui.cancasEditor;
	var AC = _NS.Actions;
	var Key = AC.Key;
	var Tools = _NS.Tools;
	var MS_BTN = igk.winui.mouseButton;
	var POINTS = {
		TopLeft: 1,
		TopMiddle: 2,
		TopRight: 3,
		BottomLeft: 4,
		BottomMiddle: 5,
		BottomRight: 6,
		CenterLeft: 7,
		Center: 8,
		CenterRight: 9
	};
	var SELECTION_DASH = [10, 2, 10];
	var SELECTION_M_DASH = [4, 2];
	const { CancasSelectorAction } = _NS;
	function SelectorAction(selector) {
		CancasSelectorAction.apply(this, []);
		igk.appendProperties(this, {
			selectAll() {
				return selector.selectAll(); 
			}
		})
	}
	SelectorAction.prototype = CancasSelectorAction.prototype;
	//selection mecanism : used for selections
	igk.system.createClass(Tools, { name: 'Selection', parent: Tools.RectangleMecanism }, function () {
		var CoreMathOperation = _NS.CoreMathOperation;
		var self = this;
		var m_toedit = null;  // store element to edit
		var m_tp = 0;
		var sx = 0;
		var sy = 0;
		var dx = 0;
		var dy = 0;
		var mode = null; //selection mode t|ms| (translate|multiselect view)
		var obound = null;
		var _tempMatrix = null;
		var __applyMatrix = null;
		var _renderBound; // bound to render
		var overlay = -1; // 
		var ms_bound = 0;
		var selectionMask = 0;
		var multiselectionListener = 0;
		/**
		 * computed create selection mask 
		 * @returns 
		 */
		function createSelectionMaskLayer() {
			if (selectionMask) {
				return selectionMask;
			}
			var o = igk.createNode("canvas");
			var p = o.o.getContext("2d");
			var _ri = 0;
			var _masklayer = 'xor';
			var _self = (new function () {
				var _w = 0;
				var _h = 0;
				var m_transform = 0;
				var _mitems = [];
				_NS.primitive.apply(this, [p]); 
				igk.appendProperties(this, {
					bindBrushStyle() {
						console.log('on selection match layer');
					}, 
					/**
					 * 
					 * @param {ISelectionBound} bound 
					 * @param {*} host 
					 * @param {*} items 
					 * @returns 
					 */
					select: function (bound, host, items) {
						items = items || (host.layer ? host.layer.Elements : host.list);
						var m = host.getTransform();
						var dx = m.element[4];
						var dy = m.element[5];
						var ex = m.element[0];
						var ey = m.element[3];
						var b = bound;
						var tmp = m.element.concat();
						if (m.isIdentity()) {
							m.translate(-b.x, -b.y);
						} else {
							m.translate(-((b.x * ex) + dx), -((b.y * ex) + dy));
						}
						this.bindTransform(m.element.concat());
						m.transform(tmp);
						_mitems = [];
						this.setSize(bound.width, bound.height);
						if (items)
							this.render(items, host);
						return _mitems;
					},
					setSize: function (w, h) {
						_w = w;
						_h = h;
						o.setAttributes({
							width: _w,
							height: _h
						}).setCss({
							width: _w + 'px',
							height: _h + 'px'
						});
					},
					setGlobalCompositeOperation: function (v) {
						//ignore compositing mode
					},
					getDocumentSize: function () {
						return { w: _w, h: _h };
					},
					bindTransform: function (f) {
						m_transform = f;
					},
					render: function (items, host) {
						this.fill = "#000";
						this.fillRect(0, 0, _w, _h);
						var s = o.o.toDataURL(); //backup canvas data
						var g = 0;
						if (items) {
							var q = items.root;
							p.globalCompositeOperation = _masklayer || 'xor';
							while (q) {
								if (q.visible) { 
									p.globalCompositeOperation = "source-over";
									this.fill = "#000";
									this.fillRect(0, 0, _w, _h); 
									this.save();
									this.fill = '#FFF';
									this.stroke = '#000';
									_ri = 1;
									if (m_transform)
										this.setTransform(m_transform);
									q.render(this);
									g = o.o.toDataURL();
									if (s != g) {
										_mitems.push(q);
									}
									_ri = 0;
									this.restore();
								}
								q = q.next;
							}
						}
					},
					toString: function () {
						return 'selectionMaskLayer'
					}
				});
				var _q = this;
				igk.extendProperty(this, 'fill', {
					get: function (b) {
						return b.apply(this);
					},
					set: function (v, b) {
						if (!_ri)
							b.apply(this, [v]);
					}
				});
				igk.extendProperty(this, 'stroke', {
					get: function (b) {
						return b.apply(this);
					},
					set: function (v, b) {
						if (!_ri)
							b.apply(this, [v]);
					}
				});
				igk.defineProperty(this, 'o', { get: function () { return o.o; } });
			});
			selectionMask = _self;
			return _self;
		};
		this.selectAll = function(){ 
				// override select all 
			let v_host = this.host;
			let g = createSelectionMaskLayer();
			let items = (v_host.layer ? v_host.layer.Elements : v_host.list);  
			if (items){
				// a single edited element is replaced by the selection of all elements
				v_host.Edit(null, this);
				m_toedit = multiSelection(items, v_host);
			}
			v_host.refresh();
		};
		//override the wait to edit element
		igk.defineProperty(this, "elem", {
			get: function () {
				return m_toedit;
			}
		});
		this.createElement = function () {
			return m_toedit;
		};
		this.selectPoint = function (point) {
			//select element from point location
			var items = this.host.select(point);
			// console.debug(items);
			if (items.length > 0) {
				this.host.Edit(items[items.length - 1], this);
				m_toedit = items[items.length - 1];
				//this.elem = items[0];
			} else {
				this.host.Edit(null, this);
				m_toedit = null;
			}
			this.host.refresh();
		};
		/**
		 * selection according to bound
		 * @param {ISelectionBound} bound 
		 */
		/** select an element (layer explorer) */
		this.selectElement = function (el) {
			this.host.Edit(null, this);
			if (el) {
				this.host.Edit(el, this);
				m_toedit = el;
			} else {
				m_toedit = null;
			}
			this.host.refresh();
		};
		this.selectBound = function (bound) {
			//select element from bound
			var items = [];
			ms_bound = bound;
			var g = createSelectionMaskLayer();
			items = g.select(bound, this.host);
			this.host.Edit(null, this);
			// console.debug(items);
			if (items.length > 0) {
				if (items.length == 1) {
					this.host.Edit(items[0], this);
					m_toedit = items[0];
					// this.host.Reload(m_toedit, this);
					// this.reaload(m_toedit, this
				} else
					m_toedit = multiSelection(items, this.host);
			} else {
				m_toedit = null;
			}
			this.host.refresh();
		};
		this.handleMouseUp = function (e) {
			// console.debug("selection mouse up "+ mode);
			switch (mode) {
				case 'ms':
					this.endPos = e.loc;
					var g = _NS.CoreMathOperation.GetBound(this.startPos, this.endPos);
					var d = _NS.CoreMathOperation.GetDistance(this.startPos, this.endPos);
					this.host.Edit(null, this);
					ms_bound = 0;
					if ((m_toedit == null) && (d < 5)) {
						this.selectPoint(e.loc);
					}
					else {
						this.selectBound(g);
					}
					mode = null;
					this.host.refresh();
					break;
				case 't'://translation complete
					if (m_toedit) {
						var _e = m_toedit;
						if (_e.type == 2)
							_e.update();
						else {
							this.host.Reload(_e, this);
							m_toedit = _e;
						}
						this.host.refresh();
					}
					mode = null;
					break;
				default:
					m_tp = 1;
					if (!this.elem) {
						this.selectPoint(e.loc);
					} else {
						if (!this.elem.contains(e.loc.x, e.loc.y, this.host)) {
							// console.debug("no contains");
							m_toedit = null;
							this.host.Edit(null, this);
							this.selectPoint(e.loc);
						} else {
							//force reload edit on element
							this.host.Reload(m_toedit, this);
						}
					}
					m_tp = 0;
					break;
			}
		};
		this.handleMouseDown = function (e) {
			switch (e.ms_btn) {
				case MS_BTN.Left:
					this.startPos = e.loc;
					this.endPos = e.loc;
					if (m_toedit && m_toedit.contains(e.loc.x, e.loc.y, this.host)) {
						if (!_tempMatrix)
							_tempMatrix = new Matrix();
						var v = m_toedit.matrix;
						if (v) {
							//store old translation
							_tempMatrix.copytransform(v.element);
						}
						mode = 't';
					}
					else {
						mode = 'ms';
					}
					this.startCapture();
					break;
				case MS_BTN.Right:
					break;
			}
		};
		this.handleMouseMove = function (e) {
			if (mode == "ms") {
				//multiselection mode
				this.endPos = e.loc;
				this.host.refresh();
				return;
			}
			if (!m_toedit)
				return;
			var v = m_toedit.matrix;
			if (!v)
				return;
			switch (e.ms_btn) {
				case MS_BTN.Left:
					if (mode == 't' && _tempMatrix) {
						this.endPos = e.loc;
						dx = (-this.startPos.x + this.endPos.x);
						dy = (-this.startPos.y + this.endPos.y);
						if ((dx != 0) || (dy != 0)) {
							//translate
							var g = _tempMatrix.element.concat();
							_tempMatrix.translate(dx, dy);
							m_toedit.matrix.copytransform(_tempMatrix.element);
							_tempMatrix.transform(g);
							m_toedit.initialize();
							this.host.refresh();
						}
					}
					break;
			}
		};
		// ------------------------------------------------------------------------------------------
		// transform snippets (see overlayLayers/snippets.js). Resize mode (default): a square in the middle of each
		// edge (index 0 top, 1 right, 2 bottom, 3 left) scales the element along that axis, and a round handle outside
		// the top-left corner (index 4) rotates it. Skew mode: the edge handles (diamonds) skew the element along their
		// edge. A click (without moving) on the rotation handle switches between the two modes.
		// All the maths is done in the document space: the new matrix is W * M, W being a scale, a shear or a rotation
		// about the opposite edge / the center.
		// ------------------------------------------------------------------------------------------
		var m_skew = false; // false: resize mode, true: skew mode
		var m_snip = null; // the snippet being dragged: {index, moved, M, H, Q, C, n, u}
		var mulM = function (m2, m1) {
			return [
				m2[0] * m1[0] + m2[2] * m1[1], m2[1] * m1[0] + m2[3] * m1[1],
				m2[0] * m1[2] + m2[2] * m1[3], m2[1] * m1[2] + m2[3] * m1[3],
				m2[0] * m1[4] + m2[2] * m1[5] + m2[4], m2[1] * m1[4] + m2[3] * m1[5] + m2[5]];
		};
		var apply = function (m, x, y) { return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] }; };
		/** matrix [a b c d e f] of a linear map A (2x2) applied about the point Q */
		var about = function (A, Q) {
			return [A[0], A[1], A[2], A[3], Q.x - (A[0] * Q.x + A[2] * Q.y), Q.y - (A[1] * Q.x + A[3] * Q.y)];
		};
		/**
		 * the selection box: the axis aligned box that surrounds the element as drawn (not the larger box of the
		 * transformed bound: a rotated circle keeps the same box). Circles and ellipses use their real extent.
		 * @returns {{b:{x,y,width,height}, M:number[]}} the box in document space (M is the identity)
		 */
		var handleBox = function (elem) {
			var I = [1, 0, 0, 1, 0, 0];
			var M = elem.matrix ? elem.matrix.element.slice(0, 6) : I;
			var t = elem.getType ? elem.getType() : '';
			var rx = null, ry = null;
			if (t == 'circle' && typeof elem.radius == 'number' && elem.center) { rx = ry = elem.radius; }
			else if (t == 'ellipse' && elem.radius && typeof elem.radius.x == 'number' && elem.center) { rx = elem.radius.x; ry = elem.radius.y; }
			if (rx !== null) {
				// extent of the image of an ellipse by the linear part of the matrix
				var c = apply(M, elem.center.x, elem.center.y);
				var hx = Math.sqrt(Math.pow(M[0] * rx, 2) + Math.pow(M[2] * ry, 2));
				var hy = Math.sqrt(Math.pow(M[1] * rx, 2) + Math.pow(M[3] * ry, 2));
				return { b: { x: c.x - hx, y: c.y - hy, width: 2 * hx, height: 2 * hy }, M: I };
			}
			return { b: _NS.CoreMathOperation.GetElemBound(elem), M: I };
		};
		var handleLocal = function (b, index) {
			switch (index) {
				case 0: return { x: b.x + b.width / 2, y: b.y };
				case 1: return { x: b.x + b.width, y: b.y + b.height / 2 };
				case 2: return { x: b.x + b.width / 2, y: b.y + b.height };
				case 3: return { x: b.x, y: b.y + b.height / 2 };
				default: return { x: b.x, y: b.y }; // 4: rotation, top-left corner
			}
		};
		this.getPoints = function (elem) {
			// a click on the rotation handle (no move) switches the mode
			if (m_snip && m_snip.index == 4 && !m_snip.moved) {
				m_skew = !m_skew;
			}
			m_snip = null;
			// reset  definition on getting points
			mode = null;
			_tempMatrix = null;
			this.freeCapture();
			if (elem && ('bound' in elem)) {
				var hb = handleBox(elem);
				var pts = [];
				for (var i = 0; i < 4; i++) {
					var p = apply(hb.M, handleLocal(hb.b, i).x, handleLocal(hb.b, i).y);
					pts.push({ x: p.x, y: p.y, type: m_skew ? 'losange' : 'square' });
				}
				var r = apply(hb.M, hb.b.x, hb.b.y);
				// the rotation handle is placed 18 screen pixels outside the corner (the offset ignores the zoom)
				pts.push({ x: r.x, y: r.y, sx: -18, sy: -18, type: 'round rotate' });
				return pts;
			}
			return [];
		};
		this.getHandle = function () { return !0; };
		this.onDblClick = function (e) {
			if (this.elem) {
				var _te = this.elem;
				if (this.elem.contains(e.loc.x, e.loc.y, this.host)) {
					var g = Tools.getEditorAttribute(_te.getType());
					if (g) {
						this.host.tool = new g();
						this.host.tool.startEdition(_te);
						m_toedit = null;
						// _te.
						// console.debug("start edition");
						// this.host.refresh();
					}
				}
			}
		};
		this.onStart = function () {
		};
		/** resize the bound of the element from an edge handle (the opposite edge stays where it is); false when the bound cannot be set */
		this.resizeBound = function (elem, st, index, P) {
			var M = st.M, det = M[0] * M[3] - M[1] * M[2];
			if (Math.abs(det) < 1e-9) { return false; }
			var inv = function (p) { // document => local space of the element
				var x = p.x - M[4], y = p.y - M[5];
				return { x: (M[3] * x - M[2] * y) / det, y: (M[0] * y - M[1] * x) / det };
			};
			var b = st.b0;
			var S = st.P0 || st.H;
			var Pl = inv(P), Sl = inv(S);
			var dx = Pl.x - Sl.x, dy = Pl.y - Sl.y; // moved distance in the local space: no jump when the press is next to the handle
			var nb = { x: b.x, y: b.y, width: b.width, height: b.height }, MIN = 1;
			switch (index) {
				case 0: nb.height = Math.max(MIN, b.height - dy); nb.y = b.y + b.height - nb.height; break;
				case 1: nb.width = Math.max(MIN, b.width + dx); break;
				case 2: nb.height = Math.max(MIN, b.height + dy); break;
				case 3: nb.width = Math.max(MIN, b.width - dx); nb.x = b.x + b.width - nb.width; break;
			}
			try { elem.bound = nb; } catch (e) { }
			var got = elem.bound;
			if (!got || Math.abs(got.width - nb.width) > 1e-6 || Math.abs(got.x - nb.x) > 1e-6 || Math.abs(got.height - nb.height) > 1e-6 || Math.abs(got.y - nb.y) > 1e-6) {
				try { elem.bound = { x: b.x, y: b.y, width: b.width, height: b.height }; } catch (e) { }
				st.boundMode = false; // not editable: the matrix scales it
				return false;
			}
			elem.matrix.copytransform(M); // the matrix stays the one of the start
			elem.initialize();
			var after = elem.bound;
			if (!after || Math.abs(after.width - nb.width) > 1e-6 || Math.abs(after.height - nb.height) > 1e-6) {
				// the element rebuilds its bound from its own definition: the matrix scales it
				try { elem.bound = { x: b.x, y: b.y, width: b.width, height: b.height }; } catch (e) { }
				elem.initialize();
				st.boundMode = false;
				return false;
			}
			this.host.refresh();
			return true;
		};
		this.startUpdateIndex = function (elem, index, inf) {
			if (!elem || !elem.matrix) { return; }
			var hb = handleBox(elem);
			var M0 = elem.matrix.element.slice(0, 6);
			var H = apply(hb.M, handleLocal(hb.b, index).x, handleLocal(hb.b, index).y);
			var st = { index: index, moved: false, M: M0, H: H };
			var cb = apply(hb.M, hb.b.x + hb.b.width / 2, hb.b.y + hb.b.height / 2);
			st.C = cb;
			if (index < 4) {
				var Q = apply(hb.M, handleLocal(hb.b, (index + 2) % 4).x, handleLocal(hb.b, (index + 2) % 4).y); // opposite edge
				var dx = H.x - Q.x, dy = H.y - Q.y, len = Math.sqrt(dx * dx + dy * dy);
				st.Q = Q;
				st.len = len;
				st.n = len > 1e-9 ? { x: dx / len, y: dy / len } : null; // from the anchor to the handle
				// the other local axis (along the edge) is the skew direction
				var ax = (index % 2 == 0) ? { x: hb.M[0], y: hb.M[1] } : { x: hb.M[2], y: hb.M[3] };
				var al = Math.sqrt(ax.x * ax.x + ax.y * ax.y);
				st.u = al > 1e-9 ? { x: ax.x / al, y: ax.y / al } : null;
			}
			// resizing edits the bounding box of the element (like the W / H fields of the inspector): the matrix is kept,
			// so the stroke width and the corner radius are not scaled. Shapes without an editable bound use the matrix.
			var eb = elem.bound;
			var axisAligned = Math.abs(M0[1]) < 1e-9 && Math.abs(M0[2]) < 1e-9 && M0[0] > 0 && M0[3] > 0;
			st.boundMode = axisAligned && !!eb && !Array.isArray(eb) && typeof eb.x == 'number' && typeof eb.width == 'number';
			st.b0 = st.boundMode ? { x: eb.x, y: eb.y, width: eb.width, height: eb.height } : null;
			// where the press happened (document space): a snippet released at the same place was only clicked
			st.P0 = (inf && typeof inf.clientX == 'number') ? this.host.getDeviceLocation(inf.clientX, inf.clientY) : null;
			m_snip = st;
			mode = 's';
		};
		this.updateIndex = function (elem, index, endPos) {
			var st = m_snip;
			if (!elem || !elem.matrix || !st || st.index != index) { return; }
			var P = endPos;
			var W = null;
			if (index == 4) { // rotation about the center
				var R0 = st.P0 || st.H; // the handle sits outside the corner: the angle starts where the pointer was pressed
				var a0 = Math.atan2(R0.y - st.C.y, R0.x - st.C.x);
				var a1 = Math.atan2(P.y - st.C.y, P.x - st.C.x);
				var t = a1 - a0;
				if (this.isShift()) { var step = Math.PI / 12; t = Math.round(t / step) * step; } // 15 degrees
				var c = Math.cos(t), sn = Math.sin(t);
				W = about([c, sn, -sn, c], st.C);
			} else if (!st.n) {
				return;
			} else if (!m_skew && st.boundMode && this.resizeBound(elem, st, index, P)) {
				st.moved = true;
				return;
			} else if (!m_skew) { // scale along the axis anchor -> handle
				var S0 = st.P0 || st.H; // measured from where the pointer was pressed: no jump when the press is next to the handle
				var den = (S0.x - st.Q.x) * st.n.x + (S0.y - st.Q.y) * st.n.y;
				if (Math.abs(den) < 1e-6) { return; }
				var s = ((P.x - st.Q.x) * st.n.x + (P.y - st.Q.y) * st.n.y) / den;
				if (Math.abs(s) < 0.01) { s = s < 0 ? -0.01 : 0.01; }
				var k = s - 1;
				W = about([1 + k * st.n.x * st.n.x, k * st.n.x * st.n.y, k * st.n.x * st.n.y, 1 + k * st.n.y * st.n.y], st.Q);
			} else if (st.u) { // shear along the edge, about the opposite edge
				var S1 = st.P0 || st.H;
				var move = (P.x - S1.x) * st.u.x + (P.y - S1.y) * st.u.y;
				var k2 = move / st.len;
				W = about([1 + k2 * st.u.x * st.n.x, k2 * st.u.y * st.n.x, k2 * st.u.x * st.n.y, 1 + k2 * st.u.y * st.n.y], st.Q);
			}
			if (!W) { return; }
			var _z = this.host.zoomX || 1;
			if (!st.P0 || (Math.abs(P.x - st.P0.x) + Math.abs(P.y - st.P0.y)) * _z > 3) { st.moved = true; }
			elem.matrix.copytransform(mulM(W, st.M));
			elem.initialize();
			this.host.refresh();
		};
		this.update = function (e, endP) {
			// console.debug("update selected " + endP.x + " x "+ endP.y);
			if (this.elem) {
				var m = this.elem.matrix;
				if (m) {
					if (mode == null) {
						mode = 't';
						sx = m.element[4];
						sy = m.element[5];
					}
					dx = endP.x - this.startPoint.x;
					dy = endP.y - this.startPoint.y;
					m.translate(dx - sx, dy - sx);
					this.elem.initialize();
					this.host.refresh();
				};
			}
		};
		igk.appendChain(this, 'onEndEdition', function () {
			if (m_tp)
				return;
			m_toedit = null;
		});
		//---------------------------------------------------------
		// selection actions
		//---------------------------------------------------------
		function _zoomIn(a) {
			if (a.type == "keydown")
				this.host.zoomIn();
		};
		function _zoomOut(a) {
			if (a.type == "keydown")
				this.host.zoomOut();
		};
		function _panLeft(a) {
			if (a.type == "keydown")
				this.host.panLeft();
		};
		function _panRight(a) {
			if (a.type == "keydown")
				this.host.panRight();
		};
		function _panUp(a) {
			if (a.type == "keydown")
				this.host.panUp();
		};
		function _panDown(a) {
			if (a.type == "keydown")
				this.host.panDown();
		};
		function _resetZoom(a) {
			if (a.type == "keyup")
				this.host.resetZoom();
		};
		function _resetFitAreaZoom(a) {
			if (a.type == "keyup")
				this.host.resetFitAreaZoom();
		};
		this.deleteSelected = function () {
			// delete the selected element(s): called by the editor.delete action
			_delete.call(this, { type: "keyup" });
		};
		function _delete(a) {
			if (a.type != "keyup")
				return;
			var e = this.host.element;
			// console.debug("delete element");
			if (m_toedit && (m_toedit.type == 2)) {
				// a multi selection always wins: delete all its elements
				m_toedit.deleteAll();
				this.host.Edit(null, this);
				m_toedit = null;
				this.host.refresh();
			} else if (e) {
				var c = e["@container"];
				if (c) {
					c.remove(e);
				}
				this.host.Edit(null, this);
				this.host.refresh();
			} else {
				if (m_toedit) {
					if (m_toedit.type == 2) {
						m_toedit.deleteAll();
					} else {
						this.host.removeAll([m_toedit]);
					}
					this.host.Edit(null, this);
					m_toedit = null;
					this.host.refresh();
				}
			}
		};
		igk.appendChain(this, "registerKeyAction", function (actions) {
			var self = this;
			var M_ACT = igk.system.getNS("igk.winui.cancasEditor.actions.mecanismActions.drawin2D");
			actions[Key.Ctrl | Key.NumPad0] = _resetZoom;
			actions[Key.Ctrl | Key.Alt | Key.NumPad0] = _resetFitAreaZoom;
			actions[Key.Ctrl | Key.Plus] = _zoomIn;
			actions[Key.Ctrl | Key.Minus] = _zoomOut;
			actions[Key.Ctrl | Key.Left] = _panLeft;
			actions[Key.Ctrl | Key.Right] = _panRight;
			actions[Key.Ctrl | Key.Up] = _panUp;
			actions[Key.Ctrl | Key.Down] = _panDown;
			// the delete keys (del / backspace) are handled by the editor action "editor.delete"
			if (M_ACT) {
				actions[Key.Alt | Key.Up] = M_ACT.moveElementOver;
				actions[Key.Alt | Key.Down] = M_ACT.moveElementBelow;
				actions[Key.Shift | Key.Alt | Key.Up] = M_ACT.moveElementTopOver;
				actions[Key.Shift | Key.Alt | Key.Down] = M_ACT.moveElementBottomBelow;
			}  
			this.host.selectorAction = new SelectorAction(this);
		});
		function _updateEditAction(e){
			var s = self.host; 
			if (m_toedit  && (s.layer==null)){ 
				m_toedit = null;
				self.host.refresh();
			}
		};
		function updateWheel(e) {
			var s = self.host; 
			// the zoom is only for the editor surface: the property panel, menus and dialogs scroll on their own
			var c = s.canvas && s.canvas.o;
			var surface = c && (c.parentElement || c);
			if (!surface || !e.target || !surface.contains(e.target)) {
				return;
			}
			var i = e.deltaY >= 0;
			if (i) {
				s.zoomOut();
			} else {
				s.zoomIn();
			}
			// e.preventDefault();
			// e.stopPropagation();
		};
		igk.appendChain(this, "registerEvents", function () {
			var self = this;
			var s = this.host; 
			s.on("mousewheel", updateWheel, { passive: 1 });
			s.on("action", _updateEditAction);
			this.host.overlayLayer.push(this);
			overlay = this.host.overlayLayer.length - 1;
			m_toedit = null;
		});
		igk.appendChain(this, "unregisterEvents", function () {
			var self = this;
			self.host.unreg_event("mousewheel", updateWheel);
			self.host.unreg_event('action', _updateEditAction);
			this.host.removeOverlay(this, overlay);
			overlay = -1;
			m_toedit = null;
		});
		var maskLayer = 0;
		function createMaskLayer() {
			var o = igk.createNode("canvas");
			var p = o.o.getContext("2d");
			var _ri = 0;
			var _masklayer = 'xor';
			// igk.system.createNS("masklayer",{
			// type: 'xor'
			// });
			var _self = (new function () {
				var _w = 0;
				var _h = 0;
				var m_transform = 0;
				_NS.primitive.apply(this, [p]);
				igk.appendProperties(this, {
					setSize: function (w, h) {
						_w = w;
						_h = h;
						o.setAttributes({
							width: _w,
							height: _h
						}).setCss({
							width: _w + 'px',
							height: _h + 'px'
						});
					},
					setGlobalCompositeOperation: function (v) {
						//ignore compositing mode
					},
					getDocumentSize: function () {
						return { w: _w, h: _h };
					},
					bindTransform: function (f) {
						m_transform = f;
					},
					render: function (items) {
						this.fill = "#000";
						this.fillRect(0, 0, _w, _h);
						var s = o.o.toDataURL();
						if (items) {
							var q = items.root;
							this.save();
							p.globalCompositeOperation = _masklayer || 'xor';
							this.fill = '#FFF';
							this.stroke = '#000';
							if (m_transform)
								this.setTransform(m_transform);
							_ri = 1;
							while (q) {
								if (q.visible)
									q.render(this);
								q = q.next;
							}
							_ri = 0;
							// console.debug("p.globalCompositeOperation "+ p.globalCompositeOperation);
							this.restore();
						}
						var g = o.o.toDataURL();
						console.debug("Changed ? " + (s != g));
					},
					toString: function () {
						return 'masklayer'
					}
				});
				var _q = this;
				igk.extendProperty(this, 'fill', {
					get: function (b) {
						return b.apply(this);
					},
					set: function (v, b) {
						if (!_ri)
							b.apply(this, [v]);
					}
				});
				igk.extendProperty(this, 'stroke', {
					get: function (b) {
						return b.apply(this);
					},
					set: function (v, b) {
						if (!_ri)
							b.apply(this, [v]);
					}
				});
				igk.defineProperty(this, 'o', { get: function () { return o.o; } });
			});
			return _self;
		};
		/**
		 * multi select listener 
		 * @param {*} items 
		 * @param {*} host 
		 * @returns 
		 */
		function multiSelection(items, host) {
			if (multiselectionListener) {
				multiselectionListener.setDef(items, host);
				return multiselectionListener;
			}
			function _multiSelectionListener(items, host) {
				var items = items;
				var host = host;
				var m_matrix = new _NS.Matrix();
				igk.appendProperties(this, {
					setDef: function (i, h) {
						items = i;
						host = h;
						m_matrix.reset();
					},
					contains: function (x, y) {
						for (var j = 0; j < items.length; j++) {
							if (items[j].contains(x, y, host)) {
								return !0;
							}
						}
						return !1;
					},
					renderSelection: function (a, dx, dy, ex, ey) {
						if (!items)
							return;
						var b = 0;
						for (var j = 0; j < items.length; j++) {
							b = _NS.CoreMathOperation.GetElemBound(items[j]); //TransformBound(
							if ((b.width <= 0) || (b.height <= 0)) continue;
							a.save();
							a.stroke = "indigo";
							a.setDashPattern(SELECTION_DASH);
							a.strokeWidth = 1;
							var temp = m_matrix.element.slice();
							temp[4] *= ex;
							temp[5] *= ey;
							a.setTransform(temp);
							a.drawRect((b.x * ex) + dx, (b.y * ex) + dy, b.width * ex, b.height * ey);
							a.restore();
						}
					},
					initialize: function () {
						// + | do nothing
					},
					update: function () {
						if (m_matrix.isIdentity()) return;
						var t = m_matrix.element.concat();
						for (var j = 0; j < items.length; j++) {
							items[j].matrix.mult(t, 1);
							items[j].initialize();
						}
						m_matrix.reset();
					},
					deleteAll: function () {
						host.removeAll(items);
						items = null;
					}
				});
				igk.defineProperty(this, 'matrix', { get: function () { return m_matrix; } });
				igk.defineProperty(this, 'type', { get: function () { return 2; } }); //multiselection type
				igk.defineProperty(this, 'items', { get: function () { return items; } }); //multiselection type
			};
			multiselectionListener = new _multiSelectionListener(items, host);
			return multiselectionListener;
		}
		this.render = function (a) {
			var m = a.getTransform();
			var dx = m.element[4];
			var dy = m.element[5];
			var ex = m.element[0];
			var ey = m.element[3];
			var b = 0;
			if (mode == "ms") {
				a.save();
				a.stroke = _NS.colors.black;
				b = _NS.CoreMathOperation.GetBound(this.startPos, this.endPos);
				a.setDashPattern(SELECTION_M_DASH);
				a.drawRect((b.x * ex) + dx, (b.y * ex) + dy, b.width * ex, b.height * ey);
				a.restore();
				return;
			}
			if (ms_bound) {
				// a.save();
				// b = ms_bound;
				// a.fill = "#444";
				// var w = b.width * ex, h=b.height*ey;
				// var x = (b.x*ex)+dx, y=(b.y*ex)+dy;
				// //masking layer
				// maskLayer = maskLayer || createMaskLayer();
				// maskLayer.setGlobalCompositeOperation('difference');
				// var tmp = m.element.concat();
				// maskLayer.setSize( w,h);
				// if (m.isIdentity()){
				// m.translate(-b.x, -b.y);
				// }else{
				// m.translate(-((b.x*ex)+dx),-((b.y*ex)+dy));
				// }
				// maskLayer.bindTransform(m.element.concat());
				// //restore transfor reference
				// m.transform(tmp);
				// //maskLayer.translate(-b.x, -b.y);
				// maskLayer.render(a.layer? a.layer.Elements : a.list);
				// //a.drawRect(x,y,w,h);			
				// a.drawImage(maskLayer.o, x,y, w,h);
				// a.restore();
			}
			if (m_toedit && ('renderSelection' in m_toedit)) {
				//render selection
				m_toedit.renderSelection(a, dx, dy, ex, ey);
			}
			if (!this.elem)
				return;
			b = this.elem.bound;
			if (!b)
				return;
			// the dashed box is the bounding box of the element with its matrix: it turns with the element (like the
			// transform snippets) instead of being the larger axis aligned box of the rotated one
			var hb = handleBox(this.elem);
			var path = new Path2D();
			[[0, 0], [1, 0], [1, 1], [0, 1]].forEach(function (c, i) {
				var p = apply(hb.M, hb.b.x + c[0] * hb.b.width, hb.b.y + c[1] * hb.b.height);
				var X = p.x * ex + dx, Y = p.y * ey + dy;
				if (i == 0) { path.moveTo(X, Y); } else { path.lineTo(X, Y); }
			});
			path.closePath();
			a.save();
			a.stroke = "indigo";
			a.setDashPattern(SELECTION_DASH);
			a.strokeWidth = 1;
			a.drawPath(path);
			a.restore();
			if (_renderBound && _renderBound.show) {
				a.save();
				a.setTransform(m);
				a.stroke = 'yellow';
				b = _renderBound;
				a.drawRect(b.x, b.y, b.width, b.height);
				a.stroke = 'red';
				b = obound;
				a.drawRect(b.x, b.y, b.width, b.height);
				a.restore();
			}
		}
	});
	AC.regActions(null, "editor.selectool.selection", function (a) {
		a.tool = new igk.winui.cancasEditor.Tools.Selection();
	});
})();