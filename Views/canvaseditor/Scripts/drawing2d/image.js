"use strict";
(function(){

var CoreMathOperation = igk.winui.canvasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI = igk.winui.canvasEditor.Serializer;
var Tools = igk.winui.canvasEditor.Tools;




igk.system.createClass(ELEM, {name:"image", parent: ELEM.rectangle }, function(){
	// ELEM.rectangle.apply(this);
	var image = 0;
	var m_blending = "source-over";
	var m_filter = 0;
	igk.defineProperty(this, "blendingMode", {get:function(){return m_blending; },
	set:function(v){
		if (v in ELEM.BLENDING){
			this.m_blending = v;
		}
	}});
	
	
	igk.defineProperty(this, "filter", {get:function(){return m_filter; },
	set:function(v){		
			m_filter = v;		
	}});
	igk.defineProperty(this, "width", {get:function(){return this.bound.width; }});
	igk.defineProperty(this, "height", {get:function(){return this.bound.height;} });
	
	igk.defineProperty(this, "src" , {get:function(){
		return image;
	}, set: function(v){
		image = v;
		if (v){
			this.bound = {
				x:0,
				y:0,
				width: v.naturalWidth || v.width,
				height: v.naturalHeight || v.height
			};
		}
	}});
	
	this.render = function(a){
		a.save();
		var b = this.bound;
		a.setTransform(this.matrix);
		a.setFilter(this.filter);
		//a.setGlobalCompositeOperation(this.blendingMode);
		a.drawImage(image, b.x, b.y, b.width, b.height);		
		a.restore();
	}
	
});



igk.system.createClass(Tools, {name:'ImageMecanism', parent: Tools.RectangleMecanism},
	function(){
		
		this.createElement = function(){
			return null; 
		};
		
		this.update  = function(){};
		
		
		
});





//line exports
var EXPORTS = igk.winui.canvasEditor.Exports;
 EXPORTS.register("image", function(){
	var c = EXPORTS.initExport().concat([
	{name:"blendingMode", 'default':'source-over'},
	{name:"filter", 'default':0},
	{name:"src", "serializer":function(v){
		var canvas = igk.createNode("canvas");
		canvas.o.width = v.width;
		canvas.o.height = v.height;
		
		var ctx = canvas.o.getContext("2d");
		ctx.drawImage(v, 0,0);
		
		return canvas.o.toDataURL("image/png");
	}
		
	}]).concat(EXPORTS.matrixExport());
		
	return c;
});

})();