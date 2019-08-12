//linear brush edition
// author: C.A.D. BONDJE DOUE
// 26/11/2018
// part of igk.winui.cancasEditor apps
// desc: definition of linear brush mecanism


"use strict";

(function(){
	var linBrush = {};	

	var CoreMathOperation = igk.winui.cancasEditor.CoreMathOperation;
	var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});

	
	
	igk.system.createClass(ELEM, {name: "linearbrush",  parent:ELEM.rectangle  }, function(){
		var colors = [{o:0, cl:'white'}, {o:1, cl:'black'}];
		var endPoint = {x:0, y:0};
		var startPoint = {x:0, y:0};
		
		igk.defineProperty(this, "endPoint", {get:function(){
			return endPoint;
		}, set: function(v){
			endPoint = v;
		}});
		
		
		igk.defineProperty(this, "startPoint", {get:function(){
			return startPoint;
		}, set: function(v){
			startPoint = v;
		}});
		
		igk.defineProperty(this, "def", {get:function(){
			return colors;
		}});
		
		
		this.render = function(a){
			a.save();
			a.setTransform(this.matrix);
			var bound  = this.bound;
			//var def = a.getBrushDefinition("");
			var b  = a.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
			b.loadColors(colors);
			
			a.fill = b.getDef(); //"red";
			
			a.fillRect(bound.x, bound.y, bound.width, bound.height);
			a.restore();
		};
	});
	
	
var Tools = igk.winui.cancasEditor.Tools;

// console.debug(Tools.RectangleMecanism);
//selection mecanism : used for selections
igk.system.createClass(Tools, {name:'linearBrushMecanism', parent: Tools.RectangleMecanism }, function(){
	
	var overlay = -1; //overlay index
	igk.appendChain(this, "registerEvents",  function(){		
		this.host.overlayLayer.push(this);
		overlay = this.host.overlayLayer.length-1;
	});	
	igk.prependChain(this, "unregisterEvents",  function(){	
		this.host.removeOverlay(this, overlay);
		overlay = -1;
	});
	
	this.createElement=function(){
		return this.host.add("linearbrush");
	};
this.getPoints=function(e){
	return [
		{x:e.bound.x, y:e.bound.y},
		{x:e.startPoint.x, y:e.startPoint.y, type:'losange start', color:'black'},
		{x:e.endPoint.x, y:e.endPoint.y, type:'losange end', color:'black'},
		{x:e.bound.x+ e.bound.width, y:e.bound.y+e.bound.height}
	];
};
	this.update = function(e, endP){
		 
		 e.bound = CoreMathOperation.GetBound(this.startPos, endP);
		 e.startPoint = {x: e.bound.x, y: e.bound.y};
		 e.endPoint = {x: e.bound.x+e.bound.width, y: e.bound.y};
		 
	 };
	this.updateIndex = function(elem, index, endPos){
		var b = elem.bound;
		switch(index){
			case 0: 
			elem.bound = CoreMathOperation.GetBound(endPos, {x: b.x + b.width, y: b.y + b.height});
			break;
			case 1:
			elem.startPoint = endPos;
			break;
			case 2:
			elem.endPoint = endPos;
			break;
			case 3:
			elem.bound = CoreMathOperation.GetBound( {x: elem.bound.x, y: elem.bound.y}, endPos);
			break;			
		}
		elem.initialize();
	};
	
	this.startUpdateIndex = function(elem, index, inf){
		
	};
	 this.render = function(a){
		 var e = this.elem;
		if (e){
			//console.debug("render overlay");
			a.save();
			a.setTransform(a.getTransform());
			a.stroke = 'pink';
			a.drawLine(e.startPoint.x, e.startPoint.y, e.endPoint.x, e.endPoint.y);
			a.restore();
		} 
	 };
	 
	 igk.appendChain(this, "registerKeyAction", function(actions){
		var self=  this;
		 
		actions[Key.R] =  function(){
			if (self.elem){
				var e = self.elem;
				
				e.startPoint = {x: e.bound.x, y: e.bound.y};
				e.endPoint = {x: e.bound.x+e.bound.width, y: e.bound.y};
				e.initialize();
				self.host.Reload(e, self);
				
				self.host.refresh();
			}
		};
	 
	});
	
	
	
});



var SERI = igk.winui.cancasEditor.Serializer;
// exports
var EXPORTS = igk.winui.cancasEditor.Exports;
 EXPORTS.register("linearbrush", function(){
	var c = EXPORTS.initExport().concat([
			{name:'startPoint', serializer: SERI.vector2Serializer },
			{name:'endPoint', serializer: SERI.vector2Serializer },	  
			{name:"def", serializer: SERI.gradientDefinitionSerializer}			
			]);			
	return c;
});




//register actions
var ACTIONS = igk.winui.cancasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regActions(Key.Shift | Key.Alt | Key.L, "editor.selectool.linearbrush", function (a){a.tool = new Tools.linearBrushMecanism(); });


ACTIONS.regMenuAction("tools.linearbrush", {index:20, callback:function(){
	ACTIONS.invoke("editor.selectool.linearbrush");
}});


})();