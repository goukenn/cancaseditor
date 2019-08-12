"use strict";
(function(){
var _NS = igk.winui.canvasEditor;
var CoreMathOperation = _NS.CoreMathOperation;
var ELEM =  _NS.DrawingElements;
var SERI = _NS.Serializer;
var Tools =  _NS.Tools;

igk.system.createClass(ELEM, {name:"video", parent: ELEM.rectangle }, function(){
	// ELEM.rectangle.apply(this);
	console.debug(this.bound);
	var video = 0;
	var m_blending = "source-over";
	var m_filter = 0;
	var m_pos = 10;
	 
	igk.defineProperty(this, "width", {get:function(){return this.bound.width; }});
	igk.defineProperty(this, "height", {get:function(){return this.bound.height; }});
	// igk.defineProperty(this, "bound", {get:function(){return }this.bound.height; }});
	
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
	
	
	igk.defineProperty(this, "src" , {get:function(){
		return video;
	}, set: function(v){
		video = v;
		if (v){
			this.bound = {
				x:0,
				y:0,
				width: v.videoWidth || v.width,
				height: v.videoHeight || v.height
			};
		}
	}});
	
	this.render = function(a){ 
		a.save();
		var b = this.bound;
		a.setTransform(this.matrix);
		a.setFilter(this.filter);
		//a.setGlobalCompositeOperation(this.blendingMode);
		a.drawImage(video, b.x, b.y, b.width, b.height);		
		a.restore();
	}
	
	
	// this.contains = function(a){
		
	// };
});


// video mecanism can play : seek to position or but can't create element

	Tools.registerEditorAttribute(ELEM.video.Name, Tools.fullname+".Selections");

})();