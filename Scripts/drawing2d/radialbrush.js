//linear brush edition
// author: C.A.D. BONDJE DOUE
// 26/11/2018
// part of igk.winui.cancasEditor apps
// desc: definition of radial brush mecanism
"use strict";
(function(){
	var linBrush = {};	
	//linear brush edition
	var CoreMathOperation = igk.winui.cancasEditor.CoreMathOperation;
	var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
	igk.system.createClass(ELEM, {name: "radialbrush",  parent:ELEM.rectangle  }, function(){
		var colors = [{o:0, cl:'red'}, {o:1, cl:'black'}];
		var endPoint = {x:0, y:0};
		var startPoint = {x:0, y:0};
		var radius = {x:10, y:10};
		igk.defineProperty(this, "endPoint", {get:function(){
			return endPoint;
		}, set: function(v){
			endPoint = v;
		}});
		igk.defineProperty(this, "def", {get:function(){
			return colors;
		}, set: function(v){
			// color stops [{o: offset, cl: color}]
			if (Array.isArray(v) && v.length > 0)
				colors = v;
		}});
		igk.defineProperty(this, "startPoint", {get:function(){
			return startPoint;
		}, set: function(v){
			startPoint = v;
		}});
		igk.defineProperty(this, "radius", {get:function(){
			return radius;
		}, set: function(v){
			radius = v;
		}});
		this.render = function(a){
			a.save();
			var bound  = this.bound;
			a.setTransform(this.matrix);
			//var def = a.getBrushDefinition("");
			var b  = a.createRadialGradient(startPoint.x, startPoint.y, radius.x,  endPoint.x, endPoint.y, radius.y);
			b.loadColors(colors);
			a.fill = b.getDef(); //"red";
			a.fillRect(bound.x, bound.y, bound.width, bound.height);
			a.restore();
		};
	});
var Tools = igk.winui.cancasEditor.Tools;
// console.debug(Tools.RectangleMecanism);
//selection mecanism : used for selections
igk.system.createClass(Tools, {name:'radialBrushMecanism', parent: Tools.RectangleMecanism }, function(){
	var overlay = -1; //overlay index
	igk.appendChain(this, "registerEvents",  function(){		
		this.host.overlayLayer.push(this);
		overlay = this.host.overlayLayer.length-1;
	});	
	igk.prependChain(this, "unregisterEvents",  function(){	
		// console.debug("remove over radial");
		this.host.removeOverlay(this, overlay);
		overlay = -1;
	});
	this.createElement=function(){
		return this.host.add("radialbrush");
	};
this.getPoints=function(e){
	return [
		{x:e.bound.x, y:e.bound.y},
		{x:e.startPoint.x, y:e.startPoint.y, type:'losange start', color:'black'},
		{x:e.endPoint.x, y:e.endPoint.y, type:'losange end', color:'black'},
		{x:e.bound.x+ e.bound.width, y:e.bound.y+e.bound.height}
	];
};
igk.appendChain(this, "registerKeyAction", function(actions){
		var self=  this;
		actions[Key.R] =  function(){
			if (self.elem){
				var e = self.elem;
				e.startPoint = {x: Math.ceil( e.bound.x + (e.bound.width/2), 2), y: (e.bound.y + e.bound.height/2)};
				e.endPoint =e.startPoint;
				e.initialize();
					self.host.Reload(e, self);
				self.host.refresh();
			}
		};
	});
	this.update = function(e, endP){
		 e.bound = CoreMathOperation.GetBound(this.startPos, endP);
		 e.startPoint = {x: Math.ceil( e.bound.x + (e.bound.width/2), 2), y: (e.bound.y + e.bound.height/2)};
		 e.endPoint =e.startPoint;
		 // x: radius of the first color stop (center), y: radius of the last one
		 e.radius = {
			 x:0,
			 y:(Math.max(e.bound.width, e.bound.height)/2)
		 };
	 };
	this.updateIndex = function(elem, index, endPos){
		var b = elem.bound;
		switch(index){
			case 0: 
			elem.bound = CoreMathOperation.GetBound(endPos, {x: b.x + b.width, y: b.y + b.height});
			break;
			case 1:
			if (this.isShift()){
				elem.radius.x = CoreMathOperation.GetDistance(elem.startPoint, endPos);
			}
			else
				elem.startPoint = endPos;
			break;
			case 2:
			if (this.isShift()){
				elem.radius.y = CoreMathOperation.GetDistance(elem.endPoint, endPos);
			}
			else
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
});
var SERI = igk.winui.cancasEditor.Serializer;
// exports
var EXPORTS = igk.winui.cancasEditor.Exports;
 EXPORTS.register("radialbrush", function(){
	var c = EXPORTS.initExport().concat([
			{name:'startPoint', serializer: SERI.vector2Serializer, unserialize: SERI.vector2Unserializer },
			{name:'endPoint', serializer: SERI.vector2Serializer, unserialize: SERI.vector2Unserializer },
			{name:'bound', serializer: SERI.boundSerializer, unserialize: SERI.boundUnserializer },	 
			{name:'radius', serializer: SERI.radiusSerializer, unserialize: function(v){
				// the brush radius is a {x, y} couple: a single number is saved when x equals y
				var r = SERI.radiusUnSerializer(v);
				if (Array.isArray(r))
					r = r[0];
				return (typeof(r) == 'number') ? {x: r, y: r} : r;
			} },	 
			{name:"def", serializer: SERI.gradientDefinitionSerializer, unserialize: function(v){
				// "offset color,offset color": see Serializer.gradientDefinitionSerializer
				if (typeof(v) != 'string')
					return null;
				var tab = v.split(',').map(function(p){
					var i = p.trim().indexOf(' ');
					return {o: parseFloat(p.trim().substring(0, i)), cl: p.trim().substring(i+1)};
				}).filter(function(c){ return !isNaN(c.o) && c.cl; });
				return tab.length > 0 ? tab : null;
			}}
			]);			
	return c;
});
//register actions
var ACTIONS = igk.winui.cancasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regActions(Key.None, "editor.selectool.radialbrush", function (a){a.tool = new Tools.radialBrushMecanism(); });
ACTIONS.regMenuAction("tools.radialbrush", {index:20, callback:function(){
	ACTIONS.invoke("editor.selectool.radialbrush");
}});
})();