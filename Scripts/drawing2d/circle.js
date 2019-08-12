"use strict";
//circle element
(function(){
	var _NS = igk.winui.cancasEditor;
	var CoreMathOperation = _NS.CoreMathOperation;
	var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
	var SERI =  _NS.Serializer;
	var Tools = _NS.Tools;
	var UTILS = _NS.Utils;
	var PATH  = _NS.Utils.Path;
	var ACTIONS = _NS.Actions;
	var Key = ACTIONS.Key; 

//circle - element
	igk.system.createClass(ELEM, {name:"circle", parent: ELEM.drawing2D}, function(){
		//ELEM.drawing2D.apply(this);
		// console.debug("djf");
		this.center = {x:0, y: 0};
		var _radius = 0.0; //mixed;
		this.fillMode = ELEM.fillMode.evenodd;
		var strokeWidth = 1;
		var path = null;
		var UTILS = igk.winui.cancasEditor.Utils;
		var self = this;
		var _NS = igk.winui.cancasEditor;
		
		function _GetMaxRadius(){
			return UTILS.getMaxRadius(self.radius);			
		};
		
		
		igk.defineProperty(this, "strokeWidth", {
			get: function(){return strokeWidth; },
			set: function(v){ if (!v)return; strokeWidth = v; },
			
		});
		igk.defineProperty(this, "radius", {
			get: function(){return _radius; },
			set: function(v){ if (!v)
				return; 
			if (typeof(v)=='string'){
				v  = SERI.radiusUnSerializer(v);
			}
			_radius = v; 
			
			},
			
		});
		igk.defineProperty(this, "bound", {
			get: function(){
				var rad = _GetMaxRadius();
				return {
					x: this.center.x - rad.x,
					y: this.center.y - rad.y,
					width : 2 * rad.x,
					height: 2 * rad.y
				};

			}			
		});
		igk.defineProperty(this, "path", {
			get: function(){
				 return path;
			}			
		});
		
		this.contains = function(x, y, a){
			var v = !1;
			
			var m = this.matrix;
			a.save();
			a.setTransform(m);			
			if (path){
				v = a.isPointInPath(path, x, y);
			}else{
			//	a.setCircle(x, y , this.radius);
				//v = a.contains(x, y);
			}
			a.restore();
			return v;
		};
		
		igk.appendChain(this, "Edit", function(engine){
			engine.addGroup()
			.addControlLabel("radius", SERI.radiusSerializer( _radius));	
		});
		
		
		this.render = function(o){
			var c =  this.center;
			var r = this.radius;
			if ((typeof(r)=='number' ) && (r<=0.0) || !path)
				return;
			o.save();				
			o.fill = this.fill;
			o.stroke = this.stroke;
			o.strokeWidth = strokeWidth;
			if (!this.matrix.isIdentity())
				o.setTransform(this.matrix);
		
			if (path){ 
				o.fillPath(path, this.fillMode);
				o.drawPath(path, this.fillMode);
			}else{
				o.setCircle(c.x, c.y, r);
				o.fillGraphics();
				o.strokeGraphics();//drawEllipse(c.x, c.y, this.radius);
			}
			o.restore();
		};
		this.initialize = function(){
			// if (typeof(this.radius) =='number'){
				// path = null;
				// return;
			// }
			// console.debug("initialize");
			
			path = new Path2D();
			var r = this.radius;
			var pts = 0;
			var c =  this.center;
			var maxx = 0;
			var maxy = 0;
			if (UTILS.IsArray(r)){
				for(var i = 0; i < r.length; i++){
					pts = UTILS.getPoint(r[i]);		
// path.closePath();	
					var cpath = new Path2D();
					cpath.ellipse(c.x, c.y, pts.x, pts.y, 0,  0, Math.PI * 2);
					 
					maxx=Math.max(maxx, pts.x);
					maxy=Math.max(maxy, pts.y);
					path.addPath(cpath); 
				}
			}else{
				if (typeof(r) == 'number'){
					r = {x: r, y: r};
				}else{
					r = r;
				}
				path.ellipse(c.x, c.y, r.x, r.y, 0, 0, Math.PI * 2);
				maxx=Math.max(maxx, r.x);
					maxy=Math.max(maxy, r.y);
			}
			
			// this.bound = {
				// x: c.x - maxx,
				// y:c.y - maxy,
				// width: 2 * maxx,
				// heigth: 2 * maxy
			// };
			
		};
	
	
		igk.prependChain(this, 'updateTransformElement', function(){
			
			var m = this.matrix;
			if (!m.isIdentity()){
				this.center = CoreMathOperation.TransformPoint(this.center, m);
				var g = this.radius;
				if (typeof(g) == 'number'){
					g = CoreMathOperation.TransformVector({x:g, y:g}, m);
					if (g.x == g.y){
						this.radius = Math.abs(g.x);
					}else
						this.radius = {x:Math.abs(g.x), y: Math.abs(g.y)};
				}
			}
		});
	
	});
	
	igk.system.createClass(Tools, {name:'CircleMecanism', parent: Tools.RectangleMecanism}, function(){
		//M.Rectangle.apply(this);
		var startMultiRadius = !1;
		var IsArray = igk.winui.cancasEditor.Utils.IsArray;
		
		this.createElement = function(){
			return this.host.add("circle");
		};
		this.update = function(elem, endPos, type){
			elem.center = this.startPos;
			var _endpos = {
				x : Math.abs(this.startPos.x - endPos.x),
				y : Math.abs(this.startPos.y - endPos.y)				
			};		
			
			elem.radius = Math.sqrt(_endpos.x * _endpos.x + (_endpos.y * _endpos.y)); //(this.startPos.x, 
			elem.initialize();
		};
		this.getPoints = function(elem){
			var tab = [];
			tab.push(elem.center);
			var radius = elem.radius;
			var UTILS = igk.winui.cancasEditor.Utils;
			
			if(UTILS.IsArray(radius)){
				
				for(var j=0 ; j < radius.length; j++){
					var p = UTILS.getPoint(radius[j]);
					
					tab.push({x: tab[0].x + p.x ,y: tab[0].y});
				}
				
			}else{
				var p = UTILS.getPoint(radius);
				tab.push({x: tab[0].x + p.x ,y: tab[0].y});
			}
			
			return tab;
		};
	
	
	this.getRadiusPointIndex = function(){
		return 1;
	};
		this.startUpdateIndex = function(elem, index, inf){
			var baseIdx = this.getRadiusPointIndex();
			if ((index >= baseIdx) && inf.isShift){ //index # of the center
				//console.debug("start multiRadius update");
				
				var idx = index-baseIdx;
				var rad = elem.radius;
				// startMultiRadius = 1;
				// var _endpos = {
					// x : Math.abs(elem.center.x - inf.startPos.x),
					// y : Math.abs(elem.center.y - inf.startPos.y)				
				// };
				
			//	var d = Math.sqrt(_endpos.x * _endpos.x + (_endpos.y * _endpos.y));
				if (IsArray(rad)){
					var d = rad[idx];					
					rad.push( d); //r[index] = d;
				}else{
					rad = [rad, rad];
				}
				
				 elem.radius = rad;
				 elem.initialize();
				 this.host.refresh();
				 startMultiRadius = 1;					
			}
		};
		this.updateIndex = function(elem, index, endPos){
			switch(index){
				case 0:
					elem.center = endPos;
					elem.initialize();				
				break;
				default:
				//update radius
				var _endpos = {
					x : Math.abs(elem.center.x - endPos.x),
					y : Math.abs(elem.center.y - endPos.y)				
				};	
				//calculate distance
				var idx = index-this.getRadiusPointIndex();
				var rad = elem.radius;
				var _is_mpoints = IsArray(rad) && (rad.length>=0) && (idx < rad.length);				
				if (!this.isCtrl()){
				var d = Math.sqrt(_endpos.x * _endpos.x + (_endpos.y * _endpos.y));
				
				//if (startMultiRadius){
				
					if ( _is_mpoints ){
						rad[idx] = d;
					}else
						elem.radius = d;
				}
				else{
					if (_is_mpoints){
						rad[idx] = _endpos;
					}else
						elem.radius = _endpos;
				}
				// }else{
					
					// elem.radius = d;
				// }				
				elem.initialize();				
				break;
			}
		}
	
	});
	
	
		
	ACTIONS.regActions(Key.Alt | Key.Shift  | Key.C, "editor.selectool.circle",  function(a){			
		a.tool = new igk.winui.cancasEditor.Tools.CircleMecanism();
	});
	Tools.registerEditorAttribute("circle", "CircleMecanism");
	
	
ACTIONS.regMenuAction("tools.circle", {index:4, callback:function(){
	ACTIONS.invoke("editor.selectool.circle");
}});


})();