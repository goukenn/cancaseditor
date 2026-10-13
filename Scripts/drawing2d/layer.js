"use strict";
(function(){
const _NS = igk.winui.cancasEditor;
const { CoreMathOperation, Matrix } = _NS; 
var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
var SERI = igk.winui.cancasEditor.Serializer; 
var BLENDING = {
	"source-over":1,
	"source-in":1,
	"source-out":1,
	"source-atop":1,
	"destination-over":1,
	"destination-in":1,
	"destination-out":1,
	"destination-atop":1,
	"lighter":1,
	"copy":1,
	"xor":1,
	"multiply":1,
	"screen":1,
	"overlay":1,
	"darken":1,
	"lighten":1,
	"color-dodge":1,
	"color-burn":1,
	"hard-light":1,
	"soft-light":1,
	"difference":1,
	"exclusion":1,
	"hue":1,
	"saturation":1,
	"color":1,
	"luminosity":1
};
ELEM.BLENDING = BLENDING;
/**
 * render a child element: with its shadow when it has one (the shadow is set on the context before it renders)
 */
/**
 * clip / mask of an element, layer or group: another element of the same container (stored by id when saved).
 * The clip is a hard path clip, the mask uses the luminance (or the alpha) of the rendered mask element as opacity.
 * An element used as a clip or a mask is not drawn on its own.
 */
ELEM.defineClipMask = function(obj){
	var m_clip = null, m_mask = null, m_mode = 'luminance';
	function link(v){
		if (v && (typeof(v) == 'object')){
			var u = v['@clipUsers'] = v['@clipUsers'] || [];
			if (u.indexOf(obj) == -1)
				u.push(obj);
		}
	}
	// a reference loaded from a file is an id: resolved among the siblings when it is first needed
	function resolve(v){
		if (typeof(v) != 'string')
			return v;
		var id = v.trim().replace(/^#/, '');
		var e = obj['@container'] && obj['@container'].Elements;
		for(var i = 0; e && i < e.length; i++){
			if (e[i].id == id)
				return e[i];
		}
		return v;
	}
	function prop(name, get, set){
		Object.defineProperty(obj, name, {configurable: true, enumerable: true, get: get, set: set});
	}
	function norm(v){ return (v === undefined || v === null || v === '' || v === 'null') ? null : v; }
	prop('clip', function(){
		if (typeof(m_clip) == 'string'){ var r = resolve(m_clip); if (typeof(r) == 'object'){ m_clip = r; link(r); } else return null; }
		return m_clip;
	}, function(v){ m_clip = norm(v); link(m_clip); });
	prop('mask', function(){
		if (typeof(m_mask) == 'string'){ var r = resolve(m_mask); if (typeof(r) == 'object'){ m_mask = r; link(r); } else return null; }
		return m_mask;
	}, function(v){ m_mask = norm(v); link(m_mask); });
	prop('maskMode', function(){ return m_mode; }, function(v){ if (v == 'alpha' || v == 'luminance') m_mode = v; });
};
ELEM.isClipSource = function(q){
	var u = q['@clipUsers'];
	for(var i = 0; u && i < u.length; i++){
		if (u[i]['@container'] && ((u[i].clip === q) || (u[i].mask === q)))
			return true;
	}
	return false;
};
/** the Path2D of a shape used as a clip (null when it has none): own path, circle, buildPath, else its bound */
ELEM.clipPathOf = function(el){
	try {
		if (el.path instanceof Path2D)
			return el.path;
		var p = new Path2D();
		if (el.getType() == 'circle' && el.center && el.radius){
			p.arc(el.center.x, el.center.y, el.radius, 0, Math.PI * 2);
			return p;
		}
		var r = el.buildPath ? el.buildPath(new Path2D()) : null;
		if (r instanceof Path2D)
			return r;
		var b = el.bound;
		if (b && !Array.isArray(b) && b.width > 0){
			p.rect(b.x, b.y, b.width, b.height);
			return p;
		}
	}
	catch(e){}
	return null;
};
ELEM.applyClip = function(a, clip){
	var path = ELEM.clipPathOf(clip);
	if (!path)
		return;
	var m = a.currentTransform();
	a.setTransform(clip.matrix);
	a.clip(path, clip.fillMode || 'evenodd');
	a.resetTransform();
	a.setTransform(m);
};
/** render q multiplied by the mask element: both are drawn on their own canvas, then combined */
ELEM.renderMasked = function(a, q, mask){
	var ctx = a.getContext && a.getContext();
	if (!ctx || !_NS.CancasPrimitive){
		ELEM.renderItem(a, q, true);
		return;
	}
	var W = ctx.canvas.width, H = ctx.canvas.height, T = a.currentTransform();
	var layer = function(el){
		var c = document.createElement('canvas');
		c.width = W; c.height = H;
		var p = new _NS.CancasPrimitive(c.getContext('2d'));
		// the helpers of the editor that elements call while rendering (bindBrushStyle...): they work on `this`
		for(var k in a){ if ((typeof(a[k]) == 'function') && !(k in p)) p[k] = a[k]; }
		p.setTransform(T);
		ELEM.renderItem(p, el, true);
		return c;
	};
	var content = layer(q), m = layer(mask);
	var mx = m.getContext('2d');
	if (q.maskMode != 'alpha'){
		var img = mx.getImageData(0, 0, W, H), d = img.data;
		for(var i = 0; i < d.length; i += 4){
			d[i + 3] = Math.round(d[i + 3] * (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255);
		}
		mx.putImageData(img, 0, 0);
	}
	var cx = content.getContext('2d');
	cx.setTransform(1, 0, 0, 1, 0, 0); // both canvases are in device pixels
	cx.globalCompositeOperation = 'destination-in';
	cx.drawImage(m, 0, 0);
	a.save();
	a.resetTransform();
	ctx.drawImage(content, 0, 0);
	a.restore();
};
ELEM.renderItem = function(a, q, inner){
	if (!inner){
		if (ELEM.isClipSource(q))
			return;
		// global opacity and filter of a 2d element (layers and groups apply their own when they render)
		var fx = !('Elements' in q) && ((q.opacity < 1) || q.filter);
		var clip = q.clip, mask = q.mask;
		var hasClip = !!clip;
		if (fx || hasClip || mask){
			a.save();
			try {
				// a filter has its own opacity(): the global opacity is only used when there is no filter
				if (fx && q.filter)
					a.setFilter(q.filter);
				else if (fx && q.opacity < 1)
					a.setAlpha(a.getAlpha() * q.opacity);
				if (hasClip)
					ELEM.applyClip(a, clip);
				if (mask)
					ELEM.renderMasked(a, q, mask);
				else
					ELEM.renderItem(a, q, true);
			}
			finally {
				a.restore();
			}
			return;
		}
	}
	var sh = (q.activeShadows && a.setShadow) ? q.activeShadows() : [];
	var prev = a.currentElement; // the element being rendered (brush fills are resolved against its bound)
	a.currentElement = q;
	try {
		if (sh.length == 0){
			q.render(a);
		}
		else if (sh.length == 1){
			a.save();
			q.bindShadow(a, sh[0]);
			q.render(a);
			a.restore();
		}
		else {
			// the canvas has one shadow per drawing: each shadow is drawn alone (the element is drawn 20000 px
			// away and the shadow offset compensates it), then the element is drawn once without shadow
			var BIG = 20000;
			var T = a.currentTransform();
			for (var i = 0; i < sh.length; i++){
				a.save();
				a.resetTransform();
				a.transform(new Matrix([1, 0, 0, 1, BIG, 0]));
				a.transform(T);
				q.bindShadow(a, sh[i], -BIG);
				q.render(a);
				a.restore();
			}
			q.render(a);
		}
	}
	finally {
		a.currentElement = prev;
	}
};
igk.system.createClass(ELEM, {name:"layer", parent: ELEM.drawing2DContainer }, function(){
	// ELEM.drawing2DContainer.apply(this);
	//blending operation 
	var m_blending = "source-over";
	var m_opacity = 1;
	var m_document = 0;
	var m_filter = 0;
	var m_clip = null;
	var m_visible = !0;
	var m_matrix = new _NS.Matrix();
	var m_isgroup = false;
	Object.defineProperty(this, 'matrix', {get(){return m_matrix; }});
	/**
	 * when group is a grouping layer that allow to manage or select group contains
	 */
	Object.defineProperty(this, 'isgroup', {get(){return m_isgroup; }, set(v){ m_isgroup = v; }});
	igk.defineProperty(this, "filter", {get:function(){return m_filter; },
	set:function(v){		
			m_filter = v;		
	}});	
	igk.defineProperty(this, "document", {get:function(){return m_document; }});
	ELEM.defineClipMask(this); // clip, mask, maskMode
	igk.defineProperty(this, "blendingMode", {get:function(){return m_blending; },
	set:function(v){
		if (v in BLENDING){
			m_blending = v;
		}
	}});
	igk.defineProperty(this, "visible", {get:function(){return m_visible; },
	set:function(v){
		if (typeof(v)=='boolean'){
			m_visible = v;		
		}
	}});
	igk.defineProperty(this, "opacity", {get:function(){return m_opacity; } ,set:function(v){
		v = Number(v); // loaded from an attribute: a string
		if (isNaN(v))
			return;
		if (v<0)
			v = 0;
		if (v>1)
			v = 1;
		m_opacity = v;
	}});
	this.setDocument = function (doc){
		this.m_document = doc;
		doc.add(this);
	};
	this.render = function(a){
		var _elements = this.Elements;		
		a.save();
		a.setFilter(this.filter);
		a.setGlobalCompositeOperation(this.blendingMode);
		// a group inside a layer / group multiplies the opacity; a filter has its own opacity(): no global opacity then
		a.setAlpha((this.filter ? 1 : this.opacity) * (a.getAlpha ? a.getAlpha() : 1));
		if (!this.matrix.isIdentity()){
			a.setTransform(this.matrix);
		}
		if (_elements && _elements.root){
			var q  = _elements.root;
			while(q){
				if (q.visible){
					ELEM.renderItem(a, q);
				}
				q = q.next;
			}
		}
		a.restore();
	};
	this.add = function(i){
		if (igk.system.isInherit(i, ELEM.layer) && (i.getType() != 'group')){
			return 0; // a layer is added to a document; a group can be added to a layer
		}
		//console.debug(ELEM.drawing2DContainer.prototype.add);
		ELEM.drawing2DContainer.prototype.add.apply(this, [i]);
	};
	this.initialize = function(){
	}
	this.contains = function(x, y, editor, list){
		console.log(this);
		const _elements = this.Elements;
		list = list || [];
		if (_elements && _elements.root){
			var q  = _elements.root;
			while(q){
				if (q.visible && q.contains(x,y, editor, list)){
					list.push(q);
				}
				q = q.next;
			}
		} 
		return false;
	};
	//+| computed bound
	Object.defineProperty(this, 'bound', {get(){
		// the union of the visible children (a group is selected and moved with it), a default box when empty
		var e = this.Elements, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
		for(var i = 0; e && i < e.length; i++){
			var c = e[i];
			if (!c.visible || !c.bound)
				continue;
			var b = _NS.CoreMathOperation.GetElemBound(c);
			if (!(b.width >= 0) || !(b.height >= 0))
				continue;
			x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
			x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
		}
		if (x0 === Infinity)
			return {x:0, y: 0, height: 100, width: 100};
		return {x:x0, y: y0, height: y1 - y0, width: x1 - x0};
	}});
});
/**
 * group: a layer placed inside a layer (or a group) that behaves as one element. It keeps the properties of a
 * layer (opacity, blending mode, filter, clip, matrix, visibility) and is selected, moved and ordered as a whole.
 */
igk.system.createClass(ELEM, {name:"group", parent: ELEM.layer}, function(){
	this.isgroup = true;
	this.add = function(i){
		var t = i.getType();
		if ((t == 'layer') || (t == 'document'))
			return 0;
		ELEM.drawing2DContainer.prototype.add.apply(this, [i]);
	};
	// hit test: the group is hit when one child is (the children are not selected on their own)
	this.contains = function(x, y, editor){
		var e = this.Elements;
		var m = this.matrix;
		if (m && !m.isIdentity()){ // to the local space of the group
			var t = m.element, det = t[0] * t[3] - t[1] * t[2];
			if (det == 0)
				return false;
			var px = x - t[4], py = y - t[5];
			x = (t[3] * px - t[2] * py) / det;
			y = (t[0] * py - t[1] * px) / det;
		}
		for(var i = e.length - 1; i >= 0; i--){
			if (e[i].visible && e[i].contains && e[i].contains(x, y, editor, []))
				return true;
		}
		return false;
	};
});
// exports
var EXPORTS = igk.winui.cancasEditor.Exports;
 EXPORTS.register("layer", function(){
	var c = EXPORTS.initExport().concat([
	// the visibility is exported by every element (Exports.initExport)

	{name:"blendingMode", 'default':'source-over'}]);
	return c;
});
EXPORTS.register("group", function(){
	// the properties of a layer + the matrix (a group is moved as a whole)
	var c = EXPORTS.layer.apply();
	EXPORTS.matrixExport().forEach(function(m){ c.push(m); });
	return c;
});
var AC = igk.winui.cancasEditor.Actions;
var Key = AC.Key;
AC.regMenuAction("layer.new", { callback: function(a){
	// new layer
	if (!a.document){
		var doc =  a.createElement("document"); 
		a.add(doc);
		a.document = doc; 
	}
	var layer  = a.createElement("layer");
	if (!layer)
		throw new Error('failed to create a layer');
	a.document.add(layer);
	layer.setDocument(a.document);
	a.layer = layer;
	a.refresh(); 
}, index:0});
AC.regMenuAction("layer.clear", { callback: function(a){
	// - clear the current layer
	if (a.layer){
		a.layer.clear();
		a.Edit(null, null);
		//a.dispathMessage("layerClear");
		if (a.tool.elem){
			a.tool.cancelEdition();
		};
		a.refresh();
	}
}, index:0});
AC.regMenuAction("layer.clip", { callback: function(a){
	// - set clip to current layer 
	if (a.layer){
		if (a.element){		
			a.layer.clip = a.element;
		}else 
			a.layer.clip = null;
		a.refresh();
		//a.editElement(a.layer);
	}
}, index:10});
AC.regMenuAction("layer.resetclip", { callback: function(a){
	// - reset current layer clip
	if (a.layer && a.layer.clip){ 
		a.layer.clip = null;		
		a.refresh();
		//a.editElement(a.layer);
	}
}, index:11});
AC.regMenuAction("layer.properties", { callback: function(a){
	//show layer property (compositing page of the document settings)
	if (a.layer)
		_NS.showDocumentSettings(a, 'layers');
}, index:100});
})();