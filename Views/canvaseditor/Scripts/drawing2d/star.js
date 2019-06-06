
"use strict";
(function(){

var CoreMathOperation = igk.winui.canvasEditor.CoreMathOperation;
var ELEM  = igk.system.createNS("igk.winui.canvasEditor.DrawingElements", {});
var SERI  = igk.winui.canvasEditor.Serializer;
var Tools = igk.winui.canvasEditor.Tools;
var UTILS = igk.winui.canvasEditor.Utils;
var PATH  = igk.winui.canvasEditor.Utils.Path;


igk.system.createClass(ELEM, {name:"star", parent:ELEM.circle }, function(){
		//ELEM.circle.apply(this);
		//this.center = {x:0, y: 0};
		var _initializing = 0; //initializing flags
		var count = 5; //mixed;
		this.angle = 0; 
		this.sweepAngle =  0;
		this.offsetAngle = 0;
		this.tension = 0;
		this.outerRadius = 0;
		
		//this.radius = 0;
		var _path_ = new Path2D();
		var m_bound = {x:0, y:0, width : 0, height: 0};
		
		
		igk.defineProperty(this, "bound", {get:function(){
			return m_bound;
		}});
		
		igk.defineProperty(this, "path", {get:function(){
			return _path_;
		}});
		
		igk.defineProperty(this, "count", {get:function(){
			return count;
		}, set: function(v){
			if((v>=3 )|| (v<360)){
				count = v;
			}
		}});
		
		// this.exports = [
		// "id",
		// "fill",
		// "stroke",
		// {name:"center",
		// serializer: SERI.vector2Serializer}, 
		// {name:"count", 'default':5 }, 
		// "angle", "radius"];
		igk.appendChain(this, "Edit", function(engine){
			engine.addGroup()
			.addControlLabel("count", this.count);
			
			engine.addGroup()
			.addControlLabel("tension", this.tension);			
			
			engine.addGroup()
			.addControlLabel("angle", this.angle);
			
			engine.addGroup()
			.addControlLabel("sweepAngle", this.sweepAngle);
			
			engine.addGroup()
			.addControlLabel("offsetAngle", this.offsetAngle);
			
		});
	
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
		this.buildPath = function(path){
			var count = this.count;
			var center = this.center;
			// var vtab = new Array(count);
			var po = CoreMathOperation.ConvDgToRadian;
			// var _angle  = ( this.angle * po);
			// var _sweepangle = (this.sweepAngle * po);
			var radius = this.radius;
			var outerRadius = this.outerRadius;
			m_bound = {x:0, y:0, width : 0, height: 0};
			var minx = 0;
			var miny = 0; 
			var maxx = 0; 
			var maxy = 0;
			
			
			if ((count<3) && (count>360))
				return;
			// var _cpath_ = 0;
			// var _rad = 0;
			// var d = 0;



			var p = count * 2;
			var step =  ((360 /  p) * po);
			var vangle =  (this.angle * po);
			var v_offAngle =(this.offsetAngle * po);
			var pts = 0;
			var tpts = [];
			if (p>0)
			for (var i = 0; i < p; i++)
			{
				if ((i % 2) == 0)
				{
					//for inner radius
					pts = {x: center.x + radius * Math.cos(i * step + vangle + v_offAngle),
						y:( center.y + radius * Math.sin(i * step + vangle + v_offAngle))
					};
				}
				else
				{
					pts = {x:(center.x + outerRadius * Math.cos(i * step + vangle)),
						y: (center.y + outerRadius * Math.sin(i * step + vangle))
					};
				}
				// if (i==0){
					// _path_.moveTo(pts.x, pts.y);
				// }else{
					// _path_.lineTo(pts.x, pts.y);
				// }
				
				tpts.push(pts);
				
				if (i==0){
					minx = pts.x;
					maxx = pts.x;
					miny = pts.y;
					maxy = pts.y;
				}else{
					minx = Math.min(minx, pts.x);
					maxx = Math.max(maxx, pts.x);
					miny = Math.min(miny, pts.y);
					maxy = Math.max(maxy, pts.y);
				}
			}
			PATH.BuildPath(path, tpts, tpts.length, true, this.tension);	
			path.closePath();
		
			if (_initializing){
				m_bound = {
					x : minx,
					y : miny,
					width : maxx - minx,
					height: maxy - miny
				};		 
			}
		};
		this.initialize = function(){ 
			_initializing = 1;
			_path_ = new Path2D();
			this.buildPath(_path_);
			_initializing =  0;
		};
		
		this.render = function(o){
			o.save();
			o.setTransform(this.matrix);
			o.fill = this.fill;
			o.stroke = this.stroke;
			o.strokeWidth = this.strokeWidth;
			o.fillPath(_path_ , this.fillMode);
			o.drawPath(_path_, this.fillMode);
			o.restore();
		};
		
		
		this.updateTransformElement = function(){
			var m = this.matrix;
			
			if (!m.isIdentity()){ 
				// var pts = [this.center];
			
				this.center = CoreMathOperation.TransformPoint(this.center, m);
				// this.center = pts[0];
				 
			}
			m.reset();
			this.initialize();
		};
		
	});
	
	


igk.system.createClass(Tools, {name:'StarMecanism', parent: Tools.CircleMecanism},
	function(){
		// Tools.CircleMecanism.apply(this);	
		this.createElement = function(){
			return this.host.add('star');
		};
		var _base_ = [];
		_base_["registerKeyAction"] =this.registerKeyAction;
		this.registerKeyAction = function(actions){
			_base_["registerKeyAction"].apply(this, [actions]);
			// if (ba){
				// ba.apply(this, [actions]);
			// }
			var M_ACT = igk.winui.canvasEditor.actions.mecanismActions.drawin2D;
			// actions[Key.Escape] = function(a){
				// if (a.type == "keyup"){
					// if (a.elem){
						// this.cancelEdition();
					// }else
						// this.goToDefaultMecanism();
				// }
			// };
			actions[Key.Plus] = M_ACT.countPropertyUp;
			actions[Key.Minus] = M_ACT.countPropertyDown;		
			actions[Key.Shift | Key.Plus] = M_ACT.tensionPropertyUp;
			actions[Key.Shift | Key.Minus] = M_ACT.tensionPropertyDown;
		};
		
		this.getPoints = function(elem){
			var tab = [];
			var c = elem.center;
			
			var radius = UTILS.IsArray(elem.radius) ? elem.radius :  [elem.radius];
			
			tab.push(c);
			tab.push( {
					 x:0, 
					 y:0 
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
			ra = elem.offsetAngle * CoreMathOperation.ConvDgToRadian;
			//update radius position
			// console.debug("update radius position");
			tab[1] = {
					 x:(c.x + elem.outerRadius * Math.cos(ra)),
					 y:(c.y + elem.outerRadius * Math.sin(ra))
				 };
			
			 
			return tab;
		};
		this.update	= function(elem, endPos){
			var _endpos = {
				x : Math.abs(this.startPos.x - endPos.x),
				y : Math.abs(this.startPos.y - endPos.y)				
			};
			elem.center = this.startPos;
			elem.radius = Math.sqrt(_endpos.x * _endpos.x + (_endpos.y * _endpos.y)); 
			elem.outerRadius = elem.radius / 2;
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
				var _endpos = {
							x : Math.abs(elem.center.x - endPos.x),
							y : Math.abs(elem.center.y - endPos.y)				
				};			
				elem.offsetAngle = CoreMathOperation.GetAngle(elem.center , endPos) * CoreMathOperation.ConvRdToDEGREE;
				elem.outerRadius = Math.sqrt(_endpos.x * _endpos.x + (_endpos.y * _endpos.y)); 
				elem.initialize();
				this.host.refresh();
				return;
			}
			if (baseudpateIndex)
				baseudpateIndex.apply(this, [elem, index, endPos]);
			// Tools.CircleMecanism
		}
});
	
	
Tools.registerEditorAttribute("star", Tools.StarMecanism);



var EXPORTS = igk.winui.canvasEditor.Exports;
EXPORTS.register("star", function(){
var c = EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
		{name:'center', serializer: SERI.vector2Serializer , unserialize : SERI.vector2Unserializer},	
		{name:"angle", 'default':0,  serializer: SERI.floatSerializer }, 
		{name:"offsetAngle", 'default':0 , serializer: SERI.floatSerializer}, 
		{name:"radius", 'default': 0, serializer: SERI.floatSerializer, unserialize: SERI.radiusUnSerializer },
		{name:"outerRadius", 'default': 0, serializer: SERI.floatSerializer},
		{name:"tension", 'default': 0},
		{name:"fillMode", 'default': ELEM.fillMode.evenodd }		
		]).concat(EXPORTS.matrixExport());			
return c;
});


//register actions
var ACTIONS = igk.winui.canvasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regActions(Key.Alt | Key.Shift | Key.K, "editor.selectool.star", function (a){a.tool = new Tools.StarMecanism(); });


ACTIONS.regMenuAction("tools.star", {index:8, callback:function(){
	ACTIONS.invoke("editor.selectool.star");
}});


})();