"use strict";
(function(){

var _NS = igk.winui.canvasEditor;
var CoreMathOperation = _NS.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI = _NS.Serializer;
var Matrix = _NS.Matrix;
var R = _NS.R;
var GUI =  igk.system.createNS("igk.winui.canvasEditor.gui", {});
var CT = igk.system.convert;
var assets = _NS.assetManager;

igk.system.createClass(ELEM, {name:"document", parent:ELEM.drawing2DContainer }, function(){
	// ELEM.drawing2DContainer.apply(this);
	
	var m_width = 1024;
	var m_height = 768;
	var m_fill = "white";
	var m_stroke = "transparent";
	var m_matrix = new Matrix();
	var m_currentLayer = null;	
	var m_filter = 0;
	var m_title = "";
	this.setSize = function(x,y){
		m_width = x>0 ? x : m_width;
		m_height = y>0 ? y: m_height;
		this.dispatchEvent("sizeChanged", {
			source: this
		});
	};
	
	
	igk.defineProperty(this, "filter", {get:function(){return m_filter; },
	set:function(v){		
			m_filter = v;		
	}});	
	
	igk.defineProperty(this, "width", {get:function(){return m_width; }});
	igk.defineProperty(this, "height", {get:function(){return m_height; }});
	igk.defineProperty(this, "stroke", {get:function(){return m_stroke; }});
	igk.defineProperty(this, "fill", {get:function(){return m_fill; }});
	igk.defineProperty(this, "title", {get:function(){return m_title; } , set: function(v){
		if((v==null) || (typeof(v)=='string'))
		m_title = v;
	}});
	
	
	this.render = function(a){
		var _elements = this.Elements;
		a.save();
		a.setTransform(m_matrix);
		
		if (m_fill!='transparent' && !(a.transparentBg)){
			a.fill = m_fill;
			a.stroke = m_stroke;
			a.fillRect(0,0, m_width, m_height);
		} 
		if (_elements){
			var q = _elements.root;
			while(q){
				if (q.visible)
					q.render(a);
				q = q.next;
			}
		}
		a.restore();
		
	};
	var _base_add =  this.add;
	this.add = function(i){
		if (igk.system.isInherit(i, ELEM.document)){
			console.debug("failed to add a "+ i.getType());
			return 0;
		}
		igk.winui.canvasEditor.DrawingElements.drawing2DContainer.prototype.add.apply(this, [i]);	
		// var e = this.Elements;
		// e.push(i);
		// if (e.item)
		// {
			// i.next = e.item.next; 
			// e.item.next = i;
		// }else 
			// i.next = null;
		// e.item = i; 
	};
	this.initialize = function(){
		
	};
	this.getLayers = function(){
		var tab = []; 
		var e = this.Elements;
		for(var s = 0; s < e.length; s++){
			if (e[s].getType() == "layer")
				tab.push(e[s]);
		}
		return tab;
	};
	
});



// exports
var EXPORTS = igk.winui.canvasEditor.Exports;
 EXPORTS.register("document", function(){
	var c = EXPORTS.initExport().concat([
	"stroke", 
	"width", 
	"height",
	{name:"filter", "default": 0}, 
	]);			
	return c;
});


var AC = igk.winui.canvasEditor.Actions;
var Key = AC.Key;


AC.regMenuAction("document.properties", { callback: function(a){
	//show about dialog
	if (a.document==null)
		return;
		
	var d = (new DocumentSettingDialog(a, a.document)).control;
	GUI.dialog.showDialog(R.title_options, d);
}, index:100});



function DocumentSettingDialog(a, document){
	
	var d = igk.createNode("div");
	
	var frm = d.add("form");
	var engine = igk.winui.engine.getEngine("bmc", frm, R); // get prefered engine 
	var W = document.width;
	var H = document.height;
	var _title = document.title;
	
	engine.setAsset(R);
	engine	
	.addGroup()
	.addControlLabel("id", document.id)
	.addGroup()
	.addControlLabel("title", document.title)
	.addGroup()
	.addControlLabel("width", document.width)
	.addGroup()
	.addControlLabel("height", document.height);
	
	if ('blendingMode' in this){
		var g = igk.winui.canvasEditor.enums.blendings.getComboboxEnumValue();							
		engine.addGroup().
		addCombobox("blendingMode", this.blendingMode, g );		
	}
	
	frm.select('input').each_all(function(){
		this.on("keyup change", function(){
			update_value();
		});
	});
	
	function update_value(){
		var w = CT.parseToInt(frm.engine.getItem("width").val()) || document.width;
		var h =  CT.parseToInt(frm.engine.getItem("height").val()) || document.height;
		
		// console.debug("set size : "+w+"x"+h);
		document.setSize(w, h);
		document.title = frm.engine.getItem("title").val();
		document.id = frm.engine.getItem("id").val();
		a.getTransform(!0);
		a.refresh();
	};
	function reset (){
		frm.engine.getItem("title").val(_title); 
		frm.engine.getItem("width").val(W); 
		frm.engine.getItem("height").val(H); 
		update_value();
	};
	
	var bar = frm.add("div").addClass("igk-action-bar");
	bar.add("input").setAttributes({
		"type":"button",
		"value": R.btn_reset,
		"class":"igk-btn"
	}).on("click", function(){
		reset();
	});
		
	reset();
	this.control = d;
	
}



})();