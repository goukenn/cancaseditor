"use strict";
(function(){

var CoreMathOperation = igk.winui.canvasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI = igk.winui.canvasEditor.Serializer;
var Tools = igk.winui.canvasEditor.Tools;
var UTILS = igk.winui.canvasEditor.Utils;
var ACTIONS = igk.winui.canvasEditor.Actions;
var Key = ACTIONS.Key;


igk.system.createClass(ELEM, {name:"arc", parent:ELEM.fullname+".circle" }, function(){
		// ELEM.circle.apply(this);
		//this.center = {x:0, y: 0};
		// this.count = 5; //mixed;
		this.angle = 0; 
		this.sweepAngle =  0;
		this.model = 0; // 0|1 ... simple arc is 0, or 1 is pie
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
		
	
		this.initialize = function(){
			// var count = this.count;
			var center = this.center;
			// var vtab = new Array(count);
			var po = CoreMathOperation.ConvDgToRadian;
			var _angle  = ( this.angle * po);
			var _sweepangle = (this.sweepAngle * po);
			var radius = UTILS.IsArray(this.radius) ? this.radius :  [this.radius];
		 
		 _path_ = new Path2D();
		 var _cpath_ = 0;
		 var _rad = 0;
		 var d = 0;
		 for (var j = 0; j < radius.length; j++)
		 {
			 // for (var i = 0; i < count; i++)
			 // {
				 _rad = UTILS.getPoint(radius[j]);
				 d = _rad.x; // Math.sqrt((_rad.x * _rad.x) + (_rad.y * _rad.y));			 
				
				_cpath_ = new Path2D();
				_cpath_.arc(center.x, center.y,  d, _sweepangle, _angle);
				if (this.model==1)
				_cpath_.lineTo(center.x, center.y);
				_cpath_.closePath();
				_path_.addPath(_cpath_);
			 // }
			// _path_.closePath();
			
		 }
			 _path_.closePath();		 
		};
		
		this.render = function(o){
			o.save();				
			o.fill = this.fill;
			o.stroke = this.stroke;
			o.strokeWith = this.strokeWidth;
			o.setTransform(this.matrix);
			o.fillPath(_path_ , this.fillMode);
			o.drawPath(_path_, this.fillMode);
			o.restore();
		};
		
		this.contains = function(x, y, a){
			if (_path_){
				a.save();
				a.setTransform(this.matrix);
				var v =  a.isPointInPath(_path_, x, y);
				a.restore();
				return v;
			}
			return !1;
		};
		
	});
	
	

igk.system.createClass(Tools, {name:'ArcMecanism', parent: Tools.fullname+".CircleMecanism"},
	function(){
		// Tools.CircleMecanism.apply(this);	
		this.createElement = function(){
			return this.host.add('arc');
		};
		this.getPoints = function(elem){
			var tab = [];
			var c = elem.center;
			tab.push(c);
			var radius = UTILS.IsArray(elem.radius) ? elem.radius :  [elem.radius];
			
			tab.push( {
					 x:0,//(c.x + r.x * Math.cos(ra)),
					 y:0 //(c.y + r.y * Math.sin(ra))
			});	
			
			var sweepPoint = {
				x:0,//(c.x + r.x * Math.cos(ra)),
				y:0 //(c.y + r.y * Math.sin(ra))
			};
			var ra = elem.angle * CoreMathOperation.ConvDgToRadian;
			for(var i = 0 ; i < radius.length; i++){
				var r = UTILS.getPoint(radius[i]);
				if (r)
				tab.push( {
					 x:(c.x + r.x * Math.cos(ra)),
					 y:(c.y + r.y * Math.sin(ra))
				 });
				 
				sweepPoint.x = Math.max(sweepPoint.x, r.x);
				sweepPoint.y = Math.max(sweepPoint.y, r.y);
			}
			ra = elem.sweepAngle * CoreMathOperation.ConvDgToRadian;
			tab[1] = {
					 x:(c.x + sweepPoint.x * Math.cos(ra)),
					 y:(c.y + sweepPoint.y * Math.sin(ra))
				 };;
			
			 
			return tab;
		};
		this.update	= function(elem, endPos){
			var _endpos = {
				x : Math.abs(this.startPos.x - endPos.x),
				y : Math.abs(this.startPos.y - endPos.y)				
			};
			elem.center = this.startPos;
			elem.radius = elem.radius = Math.sqrt(_endpos.x * _endpos.x + (_endpos.y * _endpos.y)); 
			elem.angle = CoreMathOperation.GetAngle(elem.center , endPos) * CoreMathOperation.ConvRdToDEGREE;
			elem.initialize();
		};
		var baseudpateIndex = this.updateIndex;
		this.getRadiusPointIndex = function(){
			return 2;
		};
		this.updateIndex=  function(elem, index, endPos){
			if (index>=2)
				elem.angle = CoreMathOperation.GetAngle(elem.center , endPos) * CoreMathOperation.ConvRdToDEGREE;
			else if (index ==1){				
				elem.sweepAngle = CoreMathOperation.GetAngle(elem.center , endPos) * CoreMathOperation.ConvRdToDEGREE;
				elem.initialize();
				this.host.refresh();
				return;
			}
			if (baseudpateIndex)
				baseudpateIndex.apply(this, [elem, index, endPos]);
			// Tools.CircleMecanism
		};

		var _base_ =[];
		_base_["registerKeyAction"] = this.registerKeyAction;
		this.registerKeyAction = function(actions){
			_base_["registerKeyAction"].apply(this, [actions]);
			actions[Key.T] = _toggleModel;
		};
		
		function _toggleModel(a){
			var e = a.elem;
			if (e && (a.type == "keyup")){
				if (e.model == 1)
						e.model = 0;
					else{
						e.model = 1;
				}
				e.initialize();
				a.host.refresh();
					
			}else{
				a.handle = 0;
			}
		};
});


Tools.registerEditorAttribute("arc", Tools.ArcMecanism);
	
var EXPORTS = igk.winui.canvasEditor.Exports;
EXPORTS.register("arc", function(){
var c = EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
		SERI.getAttrib("center", "vector2"),
		{name:"angle", 'default':0 }, 
		{name:"sweepAngle", 'default':0 }, 
		{name:"radius", 'default': 0, serializer: SERI.radiusSerializer  , unserialize: SERI.radiusUnSerializer },
		{name:"fillMode", 'default': ELEM.fillMode.evenodd },	
		{name:"model", 'default': 0 }		
		]).concat(EXPORTS.matrixExport());			
return c;
});


//register actions

ACTIONS.regActions(Key.Shift | Key.A, "editor.selectool.arc", function (a){a.tool = new Tools.ArcMecanism(); });


ACTIONS.regMenuAction("tools.arc", {index:7, callback:function(){
	ACTIONS.invoke("editor.selectool.arc");
}});


})();