"use strict";
(function(){

var CoreMathOperation = igk.winui.canvasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI = igk.winui.canvasEditor.Serializer;
var Tools = igk.winui.canvasEditor.Tools;
var UTILS = igk.winui.canvasEditor.Utils;
var PATH  = igk.winui.canvasEditor.Utils.Path;
var ACTIONS = igk.winui.canvasEditor.Actions;
var Key = ACTIONS.Key;

igk.system.createClass(ELEM, {name:"polygon", parent:ELEM.fullname+".circle" }, function(){
		//ELEM.circle.apply(this);
		//this.center = {x:0, y: 0};
		this.count = 3; //mixed;
		this.angle = 0; 
		this.tension = 0;
		//this.radius = 0;
		var _path_ = new Path2D();
		// this.exports = [
		// "id",
		// "fill",
		// "stroke",
		// {name:"center",
		// serializer: SERI.vector2Serializer}, 
		// {name:"count", 'default':5 }, 
		// "angle", "radius"];
		igk.defineProperty(this, "path", {get: function(){ return _path_; }});
		
		igk.appendChain(this, "Edit", function(engine){
			engine.addGroup()
			.addControlLabel("count", this.count);
			
			engine.addGroup()
			.addControlLabel("tension", this.tension);			
			
		});
	
		this.initialize = function(){
			var count = this.count;
			var center = this.center;
			var vtab = new Array(count);
			var po = CoreMathOperation.ConvDgToRadian;
			var step = ((360 / count) * (po));
			var v_angle = (this.angle * po);
			var radius = UTILS.IsArray(this.radius) ? this.radius :  [this.radius];
		 
		 _path_ = new Path2D();
		 var _cpath_ = 0;
		 for (var j = 0; j < radius.length; j++)
		 {
			 vtab = [];
			 for (var i = 0; i < count; i++)
			 {
				 vtab.push({
					 x:(center.x + radius[j] * Math.cos(i * step + v_angle)),
					 y:(center.y + radius[j] * Math.sin(i * step + v_angle))
				 });
				 // if(i==0){
					// _path_.moveTo(vtab[i].x, vtab[i].y);
				 // }else{
					// _path_.lineTo(vtab[i].x, vtab[i].y);
				 // }
			 }
			 _cpath_ = new Path2D();
			 PATH.BuildPath(_cpath_, vtab, vtab.length, true, this.tension);
			
			 _cpath_.closePath();
			 _path_.addPath(_cpath_);
			// if (this.EnableTension)
			// {
			// _path_.AddClosedCurve(vtab, this.Tension);
			// }
			// else
			// _path_.AddPolygon(vtab);
		 }
					 
		};
		
		this.render = function(o){
			o.save();				
			o.fill = this.fill;
			o.stroke = this.stroke;
			o.strokeWidth = this.strokeWith;
			o.setTransform(this.matrix);			
			o.fillPath(_path_ , this.fillMode);
			o.drawPath(_path_, this.fillMode);
			o.restore();
		};
		
		this.contains = function(x, y, a){
			var v = !1;
			if (_path_){
			var m = this.matrix;
			a.setTransform(m);			
			v = a.isPointInPath(_path_, x, y);
			a.restore();
			}
			return v;
		};
		
	});
	
	

igk.system.createClass(Tools, {name:'PolygonMecanism', parent: Tools.fullname+".CircleMecanism" },
	function(){
		Tools.CircleMecanism.apply(this);	
		this.createElement = function(){
			return this.host.add('polygon');
		};
		
		// function _upCount(e){
			// if (e.elem){
				// if (e.type == "keyup"){
					// return;
				// }
				// e.elem.count = Math.min(360, e.elem.count+1);
				// e.elem.initialize();
				// e.host.refresh();
			// }else 
				// e.handle = 0;
		// };
		// function _downCount(e){
			// if (e.elem){
				// if (e.type == "keyup"){
					// return;
				// }
				// e.elem.count = Math.max(3, e.elem.count-1);
				// e.elem.initialize();
				// e.host.refresh();
			// }else{
				// e.handle = 0;
			// }
		// };
		var _base_ = [];
		_base_["registerKeyAction"] =this.registerKeyAction;
		this.registerKeyAction = function(actions){
			_base_["registerKeyAction"].apply(this, [actions]);
			var M_ACT = igk.winui.canvasEditor.actions.mecanismActions.drawin2D;
			actions[Key.Plus] = M_ACT.countPropertyUp;
			actions[Key.Minus] = M_ACT.countPropertyDown;
			actions[Key.Shift | Key.Plus] = M_ACT.tensionPropertyUp;
			actions[Key.Shift | Key.Minus] = M_ACT.tensionPropertyDown;
			actions[Key.Alt | Key.Plus] = M_ACT.strokeWidthPropertyUp;
			actions[Key.Alt | Key.Minus] = M_ACT.strokeWidthPropertyDown;
			actions[Key.Shif | Key.Div] = M_ACT.toogleFillMode;
		};
		this.getPoints = function(elem){
			var tab = [];
			var c = elem.center;
			tab.push(c);
			var radius = UTILS.IsArray(elem.radius) ? elem.radius :  [elem.radius];
			var ra = elem.angle * CoreMathOperation.ConvDgToRadian;
			for(var i = 0 ; i < radius.length; i++){
				var r = UTILS.getPoint(radius[i]);
				if (r)
				tab.push( {
					 x:(c.x + r.x * Math.cos(ra)),
					 y:(c.y + r.y * Math.sin(ra))
				 });
			}
			return tab;
		};
		this.update	= function(elem, endPos){
			var _endpos = {
				x : Math.abs(this.startPos.x - endPos.x),
				y : Math.abs(this.startPos.y - endPos.y)				
			};
			elem.center = this.startPos;
			elem.radius =Math.ceil(Math.sqrt(_endpos.x * _endpos.x + (_endpos.y * _endpos.y)), 3); 
			elem.angle = Math.ceil(CoreMathOperation.GetAngle(elem.center , endPos) * CoreMathOperation.ConvRdToDEGREE, 3);
			elem.initialize();
		};
		var baseudpateIndex = this.updateIndex;
		this.updateIndex=  function(elem, index, endPos){
			if (index>0)
			elem.angle = Math.ceil( CoreMathOperation.GetAngle(elem.center , endPos) * CoreMathOperation.ConvRdToDEGREE , 3);
			if (baseudpateIndex)
				baseudpateIndex.apply(this, [elem, index, endPos]);
			// Tools.CircleMecanism
		}
});
	
var EXPORTS = igk.winui.canvasEditor.Exports;
EXPORTS.register("polygon", function(){
var c = EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
		{name:"center",	serializer: SERI.vector2Serializer, unserialize: SERI.vector2Unserializer }, 
		{name:"count", 'default':3 }, 
		{name:"angle", 'default':0 }, 
		{name:"radius", 'default': 0, serializer: SERI.radiusSerializer , unserialize: SERI.radiusUnSerializer },
		{name:"fillMode", 'default': ELEM.fillMode.evenodd },
		{name:"tension", 'default': 0 }
		
		]).concat(EXPORTS.matrixExport());		
return c;
});

Tools.registerEditorAttribute("polygon", Tools.PolygonMecanism);

ACTIONS.regMenuAction("tools.polygon", {index:5, callback:function(){
	ACTIONS.invoke("editor.selectool.polygon");
}});

})();