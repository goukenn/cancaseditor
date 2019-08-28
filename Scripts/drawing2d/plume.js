"use strict";

(function(){
var CoreMathOperation = igk.winui.cancasEditor.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
var SERI = igk.winui.cancasEditor.Serializer;
var Matrix = igk.winui.cancasEditor.Matrix;


function DefSegment(){
	this.point = {x:0, y:0};
	this.handleIn = {x:0, y:0};
	this.handleOut = {x:0, y:0};
	
};



function Segments(){
	var root = null;
	var node = null;
	var length = 0;
	this.clear = function(){
		root = null;
		node = null;
		length = 0;
	};
	this.addDef = function(pos){
		var p = new DefSegment();
		p.point = pos;
		p.handleIn = pos;
		p.handleOut = pos;
		
		this.push(p);
		return p;
	};
	this.navPrevious = function(){
		if (node && node.prev){
			node = node.prev;
			return 1;
		}
		return 0;
	};
	this.navNext = function(){
		if (node && node.next){
			node = node.next;
			return 1;
		}
		return 0;
	};
	this.getPrevious = function(){
		if(node.prev)
			return node.prev.item;
		return null;
	};
	this.getSegment = function(){
		return node ? node.item : null;
	};
	
	igk.defineProperty(this, "length", {get: function(){
		return length;
	}});
	igk.defineProperty(this, "node", {get: function(){
		return node;
	}});
	igk.defineProperty(this, "root", {get: function(){
		return root;
	}});
	
	this.insert=function(e){
		node = {
			prev: node,
			item: e,
			next: node && node.next ? node.next : null
		};
		node.prev.next = node;
	},
	this.push = function(e){
		// segment.push(e);
		node = {
			prev: node,
			item: e,
			next: null
		};
		if(node.prev)
		node.prev.next = node;
		if (root == null)
			root = node;
		length++;
	};
	this.each_all = function(callback){
		var q = root;
		while(q){
			
			callback.apply(q);
			
			q = q.next;
		}
	};
	this.insertBefore = function(item){
		if(node.prev==null){
			root = {
				prev: null,
				item: item,
				next: node
			};
		}else{
			
			var q = node.prev;
			q.next = {
				prev :q,
				item:item,
				next: node
			};
			node.prev = q.next;
		}
		length++;
	};
	
	
};

igk.system.createClass(ELEM, {name:"plume", parent: ELEM.rectangle }, function(){

var path = new Path2D();
var fillMode = ELEM.fillMode.evenodd;
var segments = new Segments();
var close = !1;
igk.defineProperty(this, "segments", {get: function(){
		return segments;
	}});
igk.defineProperty(this, "path", {get: function(){
	return path;
}});
	
igk.defineProperty(this, "close", {get: function(){
		return close;
	}, set: function(v){
		close = v;
	}});

igk.defineProperty(this, "fillMode", {get: function(){
		return fillMode;
	}, set: function(v){
		fillMode = v;
}});

	
this.render = function(a){
	a.save();
	a.setTransform(this.matrix);
	a.fill = this.fill;
	a.stroke = this.stroke;
	a.strokeWidth = this.strokeWidth;
	a.fillPath(path, fillMode);
	a.drawPath(path, fillMode);
	a.restore();
};

this.updateTransformElement = function(){
	var m = this.matrix;
	
	if (!m.isIdentity()){
		segments.each_all(function(){
			if (!this.point){
				this.point = this.item.point; // {x:0, y:0};
			}
			this.point = CoreMathOperation.TransformPoint(this.point, m);
		});	
	}
	m.reset();
	this.initialize();
};
			
			
this.initialize = function(){
	path = new Path2D();
	
	var start = !0;
	var lcontrol = 0;
	var cur = 0;
	var inC = 0;
	var outC = 0;
	var prevX = 0;
	var prevY = 0;
	var minx=0;
	var miny=0;
	var maxx=0;
	var maxy=0;
	segments.each_all(function(){
		var i = this.item;
		if (start){
			path.moveTo(i.point.x, i.point.y);
			start = !1;
			minx = i.point.x;
			maxx = i.point.x;
			miny = i.point.y;
			maxy = i.point.y;
		}else{
			
			minx = Math.min(minx, i.point.x);
			maxx = Math.max(maxx, i.point.x);
			miny = Math.min(miny, i.point.y);
			maxy = Math.max(maxy, i.point.y);
			
			
			inC = {
					x: i.point.x + (i.point.x - i.handleIn.x),
					y: i.point.y + (i.point.y - i.handleIn.y)
				};
			if ((inC.x == i.point.x) && 
			   (inC.y == i.point.y) && 
			   (outC.x == prevX) && 
			   (outC.y == prevY))
					path.lineTo(i.point.x, i.point.y);
			else {
				cur = i.point; 
				path.bezierCurveTo(
				outC.x, outC.y, 
				inC.x, inC.y, 
				cur.x, cur.y);
			}			
		}
		prevX = i.point.x;
		prevY = i.point.y;
		
		outC = {
			x: i.point.x + (i.point.x - i.handleOut.x),
			y: i.point.y + (i.point.y - i.handleOut.y)
		};
	});
	
	if (close){
		path.closePath();
	}
	
	this.bound = {
		x: minx,
		y: miny,
		width: maxx - minx,
		height: maxy - miny
	};
};

this.contains = function(x, y, a){
	if (path){
		a.save();
		a.setTransform(this.matrix);
		var v =  a.isPointInPath(path, x, y);
		a.restore();
		return v;
	}
	return !1;
};

});


function _closePath(a){
	if (a.type =="keyup"){
		if (a.elem){
			a.elem.close = !this.elem.close;
			a.elem.initialize();
			a.host.refresh();
		}
	}
};
	
	

//mecanism
var Tools = igk.winui.cancasEditor.Tools;
// text mecanism
igk.system.createClass(Tools, {name:'PlumeMecanism', parent: Tools.RectangleMecanism }, function(){
		var overlay = -1;
		var startShift = !1;
		
		igk.appendChain(this, "registerEvents",  function(){		
		this.host.overlayLayer.push(this);
		overlay = this.host.overlayLayer.length-1;
	});	
	igk.prependChain(this, "unregisterEvents",  function(){		
		var tab = this.host.overlayLayer;
		var t =  [];
		
		for (var g = 0 ; g < tab.length; g++){
			if (tab[g]==this)
				continue;
			
			t.push(tab[g]);
		} 
		this.host.overlayLayer.length = 0;
		this.host.overlayLayer = t;		
		overlay = -1;
	});
	
igk.appendChain(this, "registerKeyAction", function(actions){
		var self=  this;
		actions[Key.C] =  _closePath;
	
	});


		this.createElement = function(){
		 var e = this.elem;
		 startShift = !1;
		 
		 if (e != null){
			 
			 e.segments.addDef(this.startPos);
			 e.initialize();
			  this.host.refresh();
			 return e;
		 }
		 
		 	e =  this.host.add("plume"); 
			var b = e.segments.getSegment();
			if (b)
				b.initPoint(this.startPos, this.startPos);
			else {
				e.segments.addDef(this.startPos);
				e.segments.addDef(this.startPos);
			}
			return e; 
		 };
		 var editindex = -1;
		 var segments = [];
		 this.getPoints = function(e){
			 var tab = [];
			editindex = -1;
			segments = [];
			startShift = !1;
		
			 e.segments.each_all(function(){
				 var i = this.item;
				 var r = [];
				 r.push(i.point);
				 
				 if ((i.handleIn.x != i.handleOut.x) || (i.handleIn.y != i.handleOut.y))
				 {
					 r.push(i.handleIn);
					 r.push(i.handleOut);
				}	
					segments.push({
							min: tab.length,
							length: r.length,
							segment: this
						});
						
				 
				 tab = tab.concat(r);
			 });
			 return tab;
		 };
		 this.update = function(e, endP){
			 
			 var g = e.segments.getSegment();
			 g.point = endP;
			 g.handleIn = endP;
			 g.handleOut = endP;
			 e.initialize();
			 
		 };
		 this.updateIndex = function(e, idx, endP){
			 
			  if (editindex == -1){
				  // get segment
				  for(var j = 0; j < segments.length; j++){
					  if( (idx - segments[j].min) < segments[j].length){
						  editindex = j;
						  break;
					  }  
				  }
			  }
			  var pos = idx - segments[editindex].min;
			  var  g = segments[editindex].segment.item;
			  // g.setPoint(pos, endPos);
			   // if (pos==0 && (editindex > 0)){ // joint mode
					 // var p = segments[editindex - 1].segment;
					 // if (p) p.endPoint = endPos;
				// }
				
				
				
			 // var g = e.segments.getSegment();
			 if ( startShift ||  ((this.isShift() && (pos == 0)) || (pos!=0)) ){
				 var diff = {x : endP.x - g.point.x, y: endP.y - g.point.y};
				if ((pos==0) || (pos==1)){
					g.handleIn = {x :   g.point.x + diff.x, y: g.point.y+diff.y};
					g.handleOut = {x :   g.point.x - diff.x, y: g.point.y-diff.y};
				}else{
					g.handleOut = {x :   g.point.x + diff.x, y: g.point.y+diff.y};
					g.handleIn = {x :   g.point.x - diff.x, y: g.point.y-diff.y};
				}
				startShift = !0;
				// g.handleOut = {x: diff.x * 2, y : diff.y * 2};
				
			 }else{
				 var diff = {x : g.handleIn.x - g.point.x, y: g.handleIn.y - g.point.y};
				 g.point = endP;
				 g.handleIn = {x : endP.x + diff.x, y: endP.y+diff.y};
				 g.handleOut = {x : endP.x - diff.x, y: endP.y-diff.y};
			 }
			 e.initialize();
		 };
		 
		 this.render = function(a){
				if (this.elem){
							a.save();
			a.setTransform(a.getTransform());
					this.elem.segments.each_all(function(){
						var i = this.item;
						a.save();
						a.stroke = "pink";
						a.drawLine(i.handleIn.x,  i.handleIn.y,
					 i.handleOut.x, i.handleOut.y);
						a.restore();
					});
					a.restore();
				} 
		 };
});


//actions
//register actions
var ACTIONS = igk.winui.cancasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regActions(Key.Alt | Key.Shift | Key.P, "editor.selectool.plume", function (a){a.tool = new Tools.PlumeMecanism(); });



var EXPORTS = igk.winui.cancasEditor.Exports;
EXPORTS.register("plume", function(){
var c = EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
		{name:"close", 'default': !1 },	
		// {name:"d", 'default': null, generate: function(item){
			// var s = "";
			// var ms = 0;
			// item.bezierSegment.each_all(function(){
				
				// s+= this.getDef(ms==0);
				// ms=1;
				
				
				
			// });
			// if (item.close){
				// s+="Z";
			// }
			// return s;
		// }}	,
		{name:"fillMode", 'default': ELEM.fillMode.evenodd },	
		{name:"d", 'default': null, 'generate': function(item){
			var o = "";
			var ceil =  CoreMathOperation.ceilVector;
			item.segments.each_all(function(){
				o+= "d"+ceil([this.item.point,
				 this.item.handleIn, 
				 this.item.handleOut], 2);
			});
			return o;
		}, 'resolv': function(item, v){
			item.segments.clear();
			SERI.loadDefPoint(v, 
			function(pts, m){
				var o = 0;
				switch(m){
					case 'd':	
						// console.debug(pts);
						var g = item.segments.addDef(pts[0]);
						g.handleIn = pts[1];
						g.handleOut = pts[2];
							
						break;
					
				}	
			});
		}},	
		]).concat(EXPORTS.matrixExport());		
return c;
});



var ACTIONS = igk.winui.cancasEditor.Actions;
ACTIONS.regMenuAction("tools.plume", {index:6, callback:function(){
	ACTIONS.invoke("editor.selectool.plume");
}});


Tools.registerEditorAttribute("plume", Tools.PlumeMecanism);


})();