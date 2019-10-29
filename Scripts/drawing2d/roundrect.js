//linear brush edition
// author: C.A.D. BONDJE DOUE
// 26/11/2018
// part of igk.winui.cancasEditor apps
// desc: definition of round rectangle mecanism


"use strict";

(function(){

var _NS = igk.winui.cancasEditor;
var CoreMathOperation = igk.winui.cancasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
var Tools = _NS.Tools;
var ACTIONS = _NS.Actions;
var Key = ACTIONS.Key; 
var UTILS = _NS.Utils;
var R = _NS.R;
// for round rectangle
igk.system.createClass(ELEM, {name: "roundrect",  parent:ELEM.rectangle  }, function(){
		var _radius = 10; 
		// [ // array of radius
		// {x:0, y:0},
		// {x:0, y:0},
		// {x:0, y:0},
		// {x:0, y:0}		
		// ];	
		var _path_ = 0;
		var _type = 'round';
		this.fillmode = ELEM.fillMode.evenodd;
		
		igk.defineProperty(this, "radius", {
			get:function(){
				return _radius;
			},
			set: function(v){
				if (typeof(v)=='string'){
					//convert radius to definition 
					v = v.trim();
					if(v.length==0){
						v = 0;
					}else {
						var ts = (v.split(' '));
						switch (ts.length){
							case 1:
								v = Math.abs(parseFloat(v) || 0);
							break;
							case 2:
							var _x =  Math.abs(parseFloat(ts[0]) || 0);
							var _y =  Math.abs(parseFloat(ts[1]) || 0);
							v = [];
							for(var i  = 0; i < 4; i++){
								v.push({
									x:_x,
									y:_y
								});
							}
							break;
							case 4:
								v = [];
								for(var i  = 0; i < 4; i++){
									var _x =  Math.abs(parseFloat(ts[i]) || 0);
										v.push({
											x: _x,
											y: _x
										});
								}								
							break;
							case 8:
								v = [];
								for(var i  = 0; i < 8; i = i+2){
									var _x =  Math.abs(parseFloat(ts[i]) || 0);
									var _y =  Math.abs(parseFloat(ts[i+1]) || 0);
										v.push({
											x: _x,
											y: _y
										});
								}								
							break;
							default:								
								v = parseFloat(v) || 0;
							break;
						}
					}
				}else if (typeof(v)!='number'){
					
				}
				_radius = v;
			}
		});
		
		
		
		igk.defineProperty(this, "type", {
			get:function(){
				return _type;
			},
			set: function(v){
				_type = v;
			}
		});
		
		// this.radius = '50 40 0 0 0 0 50 40';
		//this.radius = 10;
		// this.type = 'inner'; 
		// this.radius = '50';
		
		igk.appendChain(this, "Edit", function(engine){
			engine.addGroup()
			.addControlLabel("radius", roundRadiusSerialiser( this.radius));	
		});
		
		var tr_bound = null;
		this.initialize = function(){
			_path_ = new Path2D();
			var tr = this.radius;
			var r = this.bound;	
			// if ((tr_bound ==null) || (tr_bound.src != tr)){
			if (typeof(tr)=='number'){
				//init all with tr;
				if (((tr * 2)> r.width) || ((tr * 2)> r.height)) {
					tr = 0;
				}
				tr = [
					{x:tr, y:tr},
					{x:tr, y:tr},
					{x:tr, y:tr},
					{x:tr, y:tr}		
				];
				tr_bound = tr;
			}else{
				var br = [
					{x:0, y:0},
					{x:0, y:0},
					{x:0, y:0},
					{x:0, y:0}
				];
				
				if (tr.length == 4){
					if ((tr[0].x + tr[1].x)< r.width){						
						br[0].x = tr[0].x;
						br[1].x = tr[1].x;
					}
					if ((tr[2].x + tr[3].x)< r.width){
						br[2].x = tr[2].x;
						br[3].x = tr[3].x;
					}
					
					if ((tr[0].y + tr[1].y)< r.height){						
						br[0].y = tr[0].y;
						br[1].y = tr[1].y;
					}
					if ((tr[2].y + tr[3].y)< r.height){
						br[2].y = tr[2].y;
						br[3].y = tr[3].y;
					}
					
				}
				else{
					for(var j = 0; j < tr.length; j++){
						br.push({x:tr[j].x, y: tr[j].y} );
						if(tr[j].x > r.width){
							br[j].x = 0;
						}
						if(tr[j].y > r.height){
							br[j].y = 0;
						}
					}
				}
				tr_bound = br;
			}
			
			 
			this.buildPath(_path_);
		};
		this.buildPath=function(path){
			var r = this.bound;	
			var tr = tr_bound; 
			if (!tr){
				return;
			}
			var g = _NS.Utils.Path;
			
			switch(this.type){
				case "inner":
						g.roundInnerRect(path, r, tr_bound);
					break; 
				case "flat":
						g.roundFlatRect(path, r, tr_bound);					
				break;				
				case "round":
				default:
						g.roundRect(path, r, tr_bound);			
				break;
			} 
			
			
			
			
			// a.setPath(_path_);
			// a.fillPath(_path_, this.fillmode);
			// a.drawPath(_path_); //Graphics();
		};
		
		this.render = function(a){
			var r = this.bound;	
			var tr = tr_bound; 
			if (!tr){
				return;
			}
			a.save();
			a.setTransform(this.matrix);
			a.fill = this.fill;
			a.stroke = this.stroke;
			a.strokeWidth = this.strokeWidth;		
			a.fillPath(_path_, this.fillmode);
			a.drawPath(_path_);  
			
			a.restore();
		};
	});
	
function _resetRoundRectangle(a){
	if (!a.elem || a.type != "keyup"){
			return;
		}
		
	a.elem.radius = 10;
	a.elem.initialize();
	a.host.refresh();
};

function _toggleRoundMode(a){//a : event args {type:, host:, elem,}
		if (!a.elem || a.type != "keyup"){
			return;
		}
	
	switch(a.elem.type){
		case "flat":
			a.elem.type = "inner";
			break;
		case "inner":
			a.elem.type = "round";
			break;
		case "round":
		default:
			a.elem.type = "flat";
			break;
	}
	a.elem.initialize();
	a.host.refresh();
	
};
	
igk.system.createClass(Tools, {name:'RoundRectMecanism', parent: Tools.RectangleMecanism},
	function(){ 	
		this.createElement = function(){
			return this.host.add('roundrect');
		};
		
		 
		var _base_ = [];
		_base_["registerKeyAction"] =this.registerKeyAction;
		this.registerKeyAction = function(actions){
			_base_["registerKeyAction"].apply(this, [actions]);
			var M_ACT = igk.winui.cancasEditor.actions.mecanismActions.drawin2D;
			actions[Key.R] = _resetRoundRectangle; 
			actions[Key.T] = _toggleRoundMode; 
		};
		this.getPoints = function(elem){
				var b = elem.bound;
				if (b)
					return [
						{x: b.x, y: b.y},
						{x: b.x + b.width, y: b.y},
						{x: b.x + b.width, y: b.y+b.height},
						{x: b.x, y: b.y+b.height}
					];
		};
		
		 
});
	
	
	
	
	function roundRadiusSerialiser(v){
		var s = "";
		var ceil = _NS.CoreMathOperation.ceil;
		
		if (_NS.Utils.IsArray(v)){
			for(var i = 0; i < v.length; i++){
				if (i>0)
					s+=" ";
				s += ceil(v[i].x) + " " +ceil(v[i].y);
			}
		}else{
			if (typeof(v) == 'number'){
				s = v;
			}else{
				
			}
		}
		return s;
	};
	function roundRadiusUnserializer(v){
		
		var tab = v.trim().split(" "); 
		
		if (tab.length>1){
				var g  = [];
				for(var i = 0; i < tab.length; i++){
					g.push(parseFloat(tab[i]));
				}
				if (g.length==1){
					return g[0];
				}else{					
					return g;
				}
		}else{
			return parseFloat(tab[0]);
		}		
	}
	
	
	var EXPORTS = _NS.Exports;
	var SERI = _NS.Serializer;
	
	
	EXPORTS.register("roundrect", function(){
	var c = EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
		{name:"radius", 'default': 10, serializer: roundRadiusSerialiser, unserialize: roundRadiusUnserializer },
		{name:"fillmode", 'default': ELEM.fillMode.evenodd },	
		
		{name:"type", 'default':'round'},
		{name:"bound", serializer: SERI.boundSerializer, unserialize : SERI.boundUnserializer}
		]).concat(EXPORTS.matrixExport());		
	return c;
	
	});
	
	ACTIONS.regActions(Key.None, "editor.selectool.roundrect",  function(a){			
		a.tool = new  Tools.RoundRectMecanism();
	});
	
	Tools.registerEditorAttribute("roundrect", Tools.RoundRectMecanism);
	
	ACTIONS.regMenuAction("tools.roundrect", {index:4, callback:function(){
	ACTIONS.invoke("editor.selectool.roundrect");
}});


})();


