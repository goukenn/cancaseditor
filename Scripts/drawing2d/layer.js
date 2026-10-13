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
	igk.defineProperty(this, "clip", {get:function(){return m_clip; }, set: function(v){
		m_clip = v;
	}});
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
		a.setAlpha(this.opacity);
		var _clip = this.clip;
		if (_clip){
			if ('path' in _clip){
				// a.save();
				var m = a.currentTransform();
				a.setTransform(_clip.matrix);
				a.clip(_clip.path, _clip.fillMode || 'evenodd');
				a.resetTransform();
				a.setTransform(m);
			}
		}
		if (!this.matrix.isIdentity()){
			a.setTransform(this.matrix);
		}
		if (_elements && _elements.root){
			var q  = _elements.root;
			while(q){
				if (q.visible){
					q.render(a);
				}
				q = q.next;
			}
		}
		a.restore();
	};
	this.add = function(i){
		if (igk.system.isInherit(i, ELEM.layer)){
			return 0;
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
		return {x:0, y: 0, height: 100, width: 100};
	}});
});
// exports
var EXPORTS = igk.winui.cancasEditor.Exports;
 EXPORTS.register("layer", function(){
	var c = EXPORTS.initExport().concat([
	{name:"opacity", "default": 1}, 
	// the visibility is exported by every element (Exports.initExport)

	{name:"filter", "default": 0}, 
	{name:"clip", "default": null, serializer: function(v){
		if (typeof(v)=='object'){
			return '#'+v.id;
		}
		return v;
	}, resolv: function(item, d, n){
		item.clip = d;
	}}, 
	{name:"blendingMode", 'default':'source-over'}]);
	c.loadingComplete = function(item, a){
		if(typeof(item.clip)=='string'){
			var n = item.clip.trim();
			if (n[0]=='#')
				n = n.substring(1);			
			var g = a.getElementById(n);			
			item.clip = g;
		}		
	};
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