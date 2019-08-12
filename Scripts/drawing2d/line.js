"use strict";
(function(){

var CoreMathOperation = igk.winui.canvasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI = igk.winui.canvasEditor.Serializer;

igk.system.createClass(ELEM, {name:"line", parent:ELEM.drawing2D }, function(){
		ELEM.drawing2D.apply(this);
		this.stroke = "#000";
		this.strokeWidth = 1;
		this.start = {x:0, y:0};
		this.end = {x:0, y:0};
		
		// this.exports = ["id", "stroke", "strokeWidth",  {name:"start", 
		// serializer: SERI.vector2Serializer},
		// {name:"end", 
		// serializer: SERI.vector2Serializer}
		// ];
		this.render = function(a){
			a.save();	
			a.setTransform(this.matrix);			
			a.stroke = this.stroke;
			a.strokeWidth = this.strokeWidth;
			a.drawLine(this.start.x, this.start.y, this.end.x, this.end.y);
			a.restore();
		};
		
		this.contains = function(x, y, a){
			
			a.save();
			a.setTransform(this.matrix);
			var _p = new Path2D();
			_p.moveTo(this.start.x, this.start.y);
			_p.lineTo(this.end.x, this.end.y);
			a.strokeWidth = this.strokeWidth;
			var o = a.isPointInStroke(_p, x, y);
			a.restore();
			return o;
			
		}
});



var Tools = igk.winui.canvasEditor.Tools;

// console.debug(Tools.RectangleMecanism);
//selection mecanism : used for selections
igk.system.createClass(Tools, {name:'LineMecanism', parent: Tools.RectangleMecanism }, function(){
	Tools.RectangleMecanism.apply(this);
	var _lineAngle = 30;
	
	 this.createElement = function(){
		return this.host.add("line"); 
	 };
	 
	 this.update = function(e, endP){
		 if (this.isShift()){
			endP = CoreMathOperation.GetAnglePoint( this.startPos, endP, _lineAngle); 
		 }
		 e.start = this.startPos;
		 e.end = endP;
		 
		 
	 };
	 this.getPoints = function(e){
		 return [
			e.start,
			e.end
		 ];
	 };
	 this.updateIndex = function(elem, index, endPos){
		
		switch(index){
			case 0:
			if (this.isShift()){
				endPos = CoreMathOperation.GetAnglePoint( elem.end, endPos, _lineAngle); 
			}
			elem.start = endPos;
			break;
			case 1:
			if (this.isShift()){
				endPos = CoreMathOperation.GetAnglePoint( elem.start, endPos, _lineAngle); 
			}
			elem.end = endPos;
			break;
			
		}
	};
	
	this.startUpdateIndex = function(elem, index, inf){
		
	};
});



//line exports
var EXPORTS = igk.winui.canvasEditor.Exports;
 EXPORTS.register("line", function(){
	var c = EXPORTS.initExport().concat([
			{name:"stroke", "default": "#000"}, 
			{name:"strokeWidth", "default":1},
			{name:"start", 
			serializer: SERI.vector2Serializer},
			{name:"end", 
			serializer: SERI.vector2Serializer}
			]);			
	return c;
});


//register actions
var ACTIONS = igk.winui.canvasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regActions(Key.Shift | Key.L, "editor.selectool.line", function (a){a.tool = new Tools.LineMecanism(); });


ACTIONS.regMenuAction("tools.line", {index:2, callback:function(){
	ACTIONS.invoke("editor.selectool.line");
}});


})();