//+ bezier element
"use strict";
(function(){

//bezier / plume element 
var _NS = igk.system.require('igk.winui.cancasEditor');
var CoreMathOperation = _NS.CoreMathOperation;
var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {});
var SERI = _NS.Serializer;
var Matrix = _NS.Matrix;


function BezierSegment(){
	Array.prototype.constructor.apply(this);
	// var segment = [];
	var root = null;
	var node = null;
	var length = 0;
	
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
	// this.pop = function(){
		// return segment.pop();
	// };
	igk.defineProperty(this, "length", {get: function(){
		return length;
	}});
	igk.defineProperty(this, "node", {get: function(){
		return node;
	}});
	igk.defineProperty(this, "root", {get: function(){
		return root;
	}});
	
	this.getItem= function(i){
		if(i==0)
			return root.item;
		var g = 0;
		var k = root;
		while(k){
			if (g==i)
				return k.item;
			g++;
			k = k.next;
		}
		return null; //egment[i];
	};
	
	this.clear = function(){
		// segment = [];
		node = null;
		root = null;
		length = 0;
	};
	
	

	this.each_all= function(callback){
		if (!root)
			return;
		var c = root;
		while(c){
			callback.apply(c.item);
			c = c.next;
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
	
	//demos
	this.push(new BezierCurveSegment());
	// this.push(new ArcSegment());
	//this.push(new BezierPenSegment());
	
};
function LineSegment(){
	this.startPoint = {x:0, y:0};
	this.endPoint = {x:0, y:0};
	this.getSvgType= function(){return "L"; };
	this.getLastPointIndex= function(){ return 1; };
	
	this.initPoint = function(s, e){
		this.startPoint = s; 
		this.endPoint = e;
	};
	this.getDef= function(d){
	var pts = this.getPoints();
		var s = "";
				
		if (d){
			s+="M";
			s+=Math.ceil(this.startPoint.x, 2)+","+Math.ceil(this.startPoint.y,2)+" ";
		}
		s+="L";
		s+=Math.ceil(this.endPoint.x, 2)+","+Math.ceil(this.endPoint.y,2);					
		return s;	
	};

	
	this.bind = function(path, start){
		if (start)
		path.moveTo(this.startPoint.x, this.startPoint.y);
		path.lineTo( 
		this.endPoint.x, this.endPoint.y);
	};
	this.setPoint = function(idx, p){
		switch(idx){
			case 0:
			this.startPoint = p;
			break;
			case 1:
			this.endPoint = p;
			break;
		}
	};
	this.initPoint = function(s, e){		
		this.startPoint = s;
		this.endPoint = e;
	};
	this.getPoints=function(){
		return [
			this.startPoint,
			this.endPoint
		 ];
	};
	
	this.renderSnippetJoint=function(a){
		
	};
	
	
};
function QuadricSegment(){
	this.startPoint =  {x:0, y:0};
	this.controlPoint =  {x:0, y:0};
	this.endPoint = {x:0, y:0};
	this.close = 0;
	this.getLastPointIndex= function(){ return 2; };
	this.renderSnippetJoint=function(a){
		a.save();
		a.stroke = "pink";
		a.drawLine(this.startPoint.x ,this.startPoint.y, this.controlPoint.x,this.controlPoint.y);
		a.drawLine(this.controlPoint.x, this.controlPoint.y, this.endPoint.x, this.endPoint.y);
		a.restore();
	};
	
	this.getDef= function(d){
		var pts = this.getPoints();
		var s= "Q";
				
		for(var i = 0 ; i < pts.length ; i++){
			if (i>0)
				s+=" ";
			s+=Math.ceil(pts[i].x, 2)+","+Math.ceil(pts[i].y,2);
		}
		if (this.close)
			s+="Z";
			
		return 	s;	
	};
	this.bind = function(path, start){
		if (start)
		path.moveTo(this.startPoint.x, this.startPoint.y);
		path.quadraticCurveTo(this.controlPoint.x, this.controlPoint.y, 
		this.endPoint.x, this.endPoint.y);
		
		if (this.close)
			path.closePath();
	};
	this.setPoint = function(idx, p){
		switch(idx){
			case 0:
			this.startPoint = p;
			break;
			case 1:
			this.controlPoint = p;
			break;
			case 2:
			this.endPoint = p;
			break;
		}
	};
	this.initPoint = function(s, e){		
		this.startPoint = s;
		this.controlPoint = {
			x: s.x + (e.x - s.x )/2,
			y: s.y + (e.y - s.y )/2
		};
		this.endPoint = e;
	};
	this.getPoints=function(){
		return [
			this.startPoint,
			this.controlPoint,
			this.endPoint
		 ];
	};
};
function BezierCurveSegment(){
	this.startPoint =  {x:0, y:0};
	this.controlPoint1 =  {x:0, y:0};
	this.controlPoint2 =  {x:0, y:0};
	this.endPoint = {x:0, y:0};
	this.close = 0;
	this.getLastPointIndex= function(){ return 3; };
	this.getDef= function(d){
		var ceil = _NS.CoreMathOperation.ceil;
		var pts = this.getPoints();
		var s= d ? "M" : "C";
		var i =1;	
		if (d){
		s+= ceil(this.startPoint.x)+","+ceil(this.startPoint.y);
		s+="C";
		}		
		for(; i < pts.length ; i++){
			if (i>0)
				s+=" ";
			s+= ceil(pts[i].x)+","+ceil(pts[i].y);
		}
		if (this.close)
			s+="Z";	
		return 	s;	
	};	
	this.bind = function(path, start){
		if (start)
			path.moveTo(this.startPoint.x, this.startPoint.y);
		path.bezierCurveTo(
		this.controlPoint1.x, this.controlPoint1.y, 
		this.controlPoint2.x, this.controlPoint2.y, 
		this.endPoint.x, this.endPoint.y);
		if (this.close){
			path.closePath();
		}
	};
	this.setPoint = function(idx, p){
		switch(idx){
			case 0:
			this.startPoint = p;
			break;
			case 1:
			this.controlPoint1 = p;
			break;
			case 2:
			this.controlPoint2 = p;
			break;
			case 3:
			this.endPoint = p;
			break;
		}
	};
	
	this.initPoint = function(s, e){		
		this.startPoint = s;
		var gx =  (e.x - s.x )/3;
		var gy =  (e.y - s.y )/3;
		this.controlPoint1 = {
			x: s.x + gx,
			y: s.y + gy
		};
		this.controlPoint2 = {
			x: s.x + (gx*2),
			y: s.y + (gy*2)
		};
		
		this.endPoint = e;
	};
	this.getPoints=function(){
		return [
			this.startPoint,
			this.controlPoint1,
			this.controlPoint2,
			this.endPoint
		 ];
	};
	
	this.renderSnippetJoint=function(a){
		a.save();
		a.stroke = "pink";
		a.drawLine(this.startPoint.x ,this.startPoint.y, this.controlPoint1.x,this.controlPoint1.y);
		a.drawLine(this.controlPoint2.x, this.controlPoint2.y, this.endPoint.x, this.endPoint.y);
		a.restore();
	};
};
function BezierPenSegment(){
	BezierCurveSegment.apply(this);
	this.getLastPointIndex= function(){ return 3; };
	this.initPoint = function(s, e){		
		this.startPoint = s;
		this.controlPoint1 =e;
		this.controlPoint2 = e;		
		this.endPoint = e;
	};
	this.setPoint = function(idx, p){
		switch(idx){
			case 0:
			this.startPoint = p;
			break;
			case 1:
			var diff = {x: this.endPoint.x - p.x, y: this.endPoint.y - p.y};
			this.controlPoint1 = p;
			this.controlPoint2 = {x: this.endPoint.x + diff.x, y: this.endPoint.y + diff.y};
			break;
			case 2:
			var diff = {x: this.endPoint.x - p.x, y: this.endPoint.y - p.y};
			this.controlPoint1 =  {x: this.endPoint.x + diff.x, y: this.endPoint.y + diff.y};
			this.controlPoint2 = p;
			break;
			case 3:
			this.endPoint = p;
			break;
		}
	};
	
	this.renderSnippetJoint=function(a){
		a.save();
		a.stroke = "pink";
		a.drawLine( this.controlPoint1.x,this.controlPoint1.y, this.controlPoint2.x,this.controlPoint2.y);
		// a.drawLine(this.controlPoint2.x, this.controlPoint2.y, this.endPoint.x, this.endPoint.y);
		a.restore();
	};
	
	
};

function StartSegment(x,y){
	this.startPoint = {x:x, y:y};
	this.getDef = function(){
		var ceil = _NS.CoreMathOperation.ceil;
		return "M"+ceil(this.startPoint.x)+" "+ceil(this.startPoint.y);
	};
};

function ArcSegment(x,y, x2, y2, radius){
	var ceil = _NS.CoreMathOperation.ceil;
	this.startPoint = {x:x, y:y};
	this.endPoint = {x:x2, y:y2};
	this.radius = radius;
	this.getDef = function(){
		var rx =ceil(this.radius),  ry =  rx;
		return "A"+rx+' '+ry+' 0 0 1 ' +
		ceil(this.endPoint.x)+" "+ceil(this.endPoint.y) ;//+ " "+rx;
	};
};

//export settings
igk.system.createNS(_NS.fullname+".drawing2d.segments", {
	// arcSegment: ArcSegment,
	quadricSegment: QuadricSegment,
	bezierCurveSegment: BezierCurveSegment,
	lineSegment: LineSegment,
	bezierPenSegment: BezierPenSegment,
	drawingContext: function(){
	
		var segments = [];
		var _lp = 0;//last point
		igk.appendProperties(this, {
			moveTo: function(x, y){
				segments.push(new StartSegment(x,y));
				_lp = {x:x, y:y};
			},
			bezierCurveTo: function(c1x, c1y, c2x, c2y, x, y){
				var g = new BezierCurveSegment();
				
				g.startPoint = _lp || {x:c1x, y:c1y};
				g.controlPoint1 = {x:c1x, y:c1y};
				g.controlPoint2 = {x:c2x, y:c2y};
				g.endPoint = {x:x, y:y};
				segments.push(g);
				_lp = {x:x, y:y};
				
			},
			close:function(){
				if (segments.length>0){
					segments[segments.length-1].close = 1;
				}
				_lp = 0;
			},
			arcTo:function(x,y, x2, y2, radius){
				var ln = new ArcSegment(x,y, x2, y2, radius);
				segments.push(ln);
			},
			lineTo: function(x,y){
				var ln = new LineSegment();
				ln.startPoint = {x:x, y:y};
				ln.endPoint = {x:x, y:y};
				segments.push(ln);
			},
			getDef: function(){
				var s = "";
				for(var i = 0; i < segments.length;i++){
					s+= segments[i].getDef(0);					 
				}
				if(this.close)
					s+='Z';
				return s;
			}
		});
	}
});



igk.system.createClass(ELEM, {name:"bezier", parent: ELEM.rectangle }, function(){
 
	
	//igk.defineProperty(this, "font", {get:function(){return font; }, set: function(v){ font = v;}});	
	// this.textAlign = "right";
	var measures = []; // measure all 
	var points = [];
	var bezierSegment = new BezierSegment();
	var path = 0;
	var close = !1;
	
	var mode = "join";
	var blendingMode = 'source-over';
	
	
	igk.defineProperty(this, "close", {get: function(){
		return close;
	},set: function(v){
		close = v;
	}});
	
	
	igk.defineProperty(this, "mode", {get: function(){
		return mode;
	},set: function(v){
		mode = v;
	}});
	
	igk.defineProperty(this, "path", {get:function(){ return path; }} );
	

	// blending is apply with layer and text
	
	// igk.defineProperty(this, "blendingMode", {get: function(){
		// return blendingMode;
	// },set: function(v){
		// blendingMode = v;
	// }});
	
	
	// console.debug(bezierSegment);
	igk.defineProperty(this, "bezierSegment", {get: function(){
		return bezierSegment;
	}});
	this.render = function (a){
		var b = this.bound;
		// if (!b || path || !points || (points.length ==0) || (bezierSegment.length==0))
			// return;
		if (!path)
			return;
		
		a.save();	
		a.setGlobalCompositeOperation(blendingMode);
		a.setTransform(this.matrix);
		a.fill = this.fill;
		a.stroke = this.stroke;
		a.strokeWidth = this.strokeWidth;
		
		// console.debug("fill mode : "+ this.fillMode);
		a.fillPath(path, this.fillMode);	
		a.drawPath(path, this.fillMode);		
		
		a.restore();
	};
	this.initialize = function(){
		//console.debug("initialize");
		path = new Path2D();
		var index = 1;
		var points = [];
		bezierSegment.each_all(function(){
			this.bind(path, index);
			points = points.concat(this.getPoints());
			if (this.close)
				index = 1;
			else 
				index = 0;
		});
		
		this.bound = CoreMathOperation.GetVectorBounds(points);
		
		// for(var i = 0; i < bezierSegment.length; i++){
			// var e = bezierSegment.getItem(i);
			// if (i==0){
				// e.bind(path, 1);
			// }else{
				// e.bind(path, 0);
			// }
		// }
		if (close)
			path.closePath();
	};
	
	
	
	
});







//mecanism
var Tools = igk.winui.cancasEditor.Tools;
// text mecanism
igk.system.createClass(Tools, {name:'BezierMecanism', parent: Tools.RectangleMecanism }, function(){
	//Tools.RectangleMecanism.apply(this);
	var index = 0;
	var overlay = -1;
	var self = this;
	var mode = 1;
	var editMecanism = !1; //  (true|false) // single segment edition or all
	var _toolAngle = 15;
	igk.appendChain(this, "registerEvents",  function(){		
		this.host.overlayLayer.push(this);
		overlay = this.host.overlayLayer.length-1;
	});	
	igk.prependChain(this, "unregisterEvents",  function(){	
		// console.debug("un register event - bezier");
		this.host.removeOverlay(this, overlay);
		overlay = -1;
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
	function _gotoPreviouSegment(e){
		if (e.type != "keyup"){
			if (e.elem.bezierSegment.navPrevious()){
				index--;
				this.host.Reload(e.elem, this);
			}
		}
	};
	
	function _gotoNextSegment(e){
		if ((e.type != "keyup")){
				if (e.elem.bezierSegment.navNext()){
						index++;
					this.host.Reload(e.elem, this);
				}
			}
	};
	
	function _toggleEditMecanism(e){
		if ((e.type != "keyup")){
			editMecanism = !editMecanism;
			this.host.Reload(e.elem, this);
		}
	};
	
	function _toggleModeMecanism(e){
		if ((e.type != "keyup")){
			switch(mode){
				case 1:
				mode = 3;
				break;
				case 3:
				mode = 2;
				break;
				case 2:
				mode = 1;
				break;
			}
			this.host.Reload(e.elem, this);
		}
	};
	
	function createNewSegment(mode){
		var o=null;
		switch(mode){
				 case 2:
				 
				  o  = new QuadricSegment();
				 break;
				 case 3:
				  o  = new LineSegment();
				 break;
				 case 1:
				 default:
				  o  = new BezierCurveSegment();
				 break;
			 }
		return o;
	};
	
	function _resetAllSegment(e){
		if (e.elem){
			var g = e.elem.bezierSegment.getSegment();
			g.initPoint(g.startPoint, g.endPoint);
			e.elem.initialize();
			this.host.Reload(e.elem, this);
			
		}
	};
	
	function _closeCurrentSegment(e){
		if ((e.type != "keyup") &&  e.elem ){
			var g = e.elem.bezierSegment.getSegment();
			g.close = !g.close;
			e.elem.initialize();
			this.host.Reload(e.elem, this);
		}
	}
	
	igk.appendChain(this, "registerKeyAction", function(actions){
		var self=  this;
		actions[Key.C] =  _closePath;
		actions[Key.P] =  _gotoPreviouSegment;
		actions[Key.N] =  _gotoNextSegment;
		actions[Key.A] =  _toggleEditMecanism;
		actions[Key.T] =  _toggleModeMecanism;
		actions[Key.R] =  _resetAllSegment;
		actions[Key.V] =  _closeCurrentSegment;
		actions[Key.Shift | Key.R] =  function(){
				if (self.elem){
					self.elem.bezierSegment.clear();
					self.elem.initialize();
					self.host.Reload(self.elem, self);
					self.host.refresh();
				}
		};
	});
				
	 this.createElement = function(){
		 var e = this.elem;
		 if (e != null){
			 // console.debug("already create element");
			// this.host.Edit(null, this);
			 var o = createNewSegment(mode);
			
			 if (o){
				  var bez = e.bezierSegment;
				  // console.debug("mode : "  + mode);
				
				 var p =  bez.getSegment(); //getItem(index);
				 if (p){ // joint mode
				 // console.debug("init prev");
					 o.initPoint(p.endPoint, this.startPos);
					 this.startPos = p.endPoint;
				 }else{
					  o.initPoint(this.startPos, this.startPos);
				 }
				 
				 if (this.isShift()){
					  e.bezierSegment.insert(o);
				 }
				 else
				 e.bezierSegment.push(o);
			     index++;
			 }
			 //this.host.Edit(e, this);
			 e.initialize();
			 this.host.refresh();
			 return e;
		 }
		 
		index = 0;
		e =  this.host.add("bezier"); 
		e.bezierSegment.getItem(0).initPoint(this.startPos, this.startPos);
		return e;
	 };
	 this.getInfo = function(){
		return "Shortcut list";
	 };
	 
	
	 this.update = function(e, endP){	
		
		//e.points = [this.starPos, endP];
		var g = e.bezierSegment.getSegment();
		if (!g){
			//create a segment
			g = createNewSegment(mode);
			e.bezierSegment.push(g);
		}
		
		var s = this.startPos;
		
		if (this.isShift()){
		  endP = CoreMathOperation.GetAnglePoint(s, endP, _toolAngle); 
		}
		g.initPoint(s, endP);		
		e.initialize();
	 };
	 this.getPoints = function(e){
		 //single point
		 if (!editMecanism){
			var g = e.bezierSegment.getSegment();
			if (g)
				return g.getPoints();
			return [];
		}
		var t = [];
		editindex = -1;
		segments = [];
			e.bezierSegment.each_all(function(){
						var d = this.getPoints();					
						segments.push({
							min: t.length,
							length: d.length,
							segment: this
						});
						t = t.concat(d); //.renderSnippetJoint(a);
				});
		return t;
	 };
	 var segments = [];
	 var editindex = -1;
	 this.updateIndex = function(elem, idx, endPos){
		 var g = null;
		  if (!editMecanism){
				 g = elem.bezierSegment.getSegment();
				 if (this.isShift() && (idx == g.getLastPointIndex())){
				  endPos = CoreMathOperation.GetAnglePoint( g.startPoint, endPos, _toolAngle); 
				}	
				 g.setPoint(idx, endPos);
				 if (idx==0){ // joint mode
					 var p = elem.bezierSegment.getPrevious(); 
					 if (p && !p.close) 
						 p.endPoint = endPos;
				 }
		 
		  }else{
			  //get segment
			  // console.debug(idx);
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
			  g = segments[editindex].segment;
			  
			  if (this.isShift() && (idx == g.getLastPointIndex())){
				  endPos = CoreMathOperation.GetAnglePoint( g.startPoint, endPos, _toolAngle); 
			  }		  
			  
			  g.setPoint(pos, endPos);
			   if (pos==0 && (editindex > 0)){ // joint mode
					 var p = segments[editindex - 1].segment;
					 if (p && !p.close) 
						 p.endPoint = endPos;
				}
		  }
		 elem.initialize();
		
	 };
	 
	 var renderOverLay = function(elem, a){
		if (elem){
				if (!editMecanism){
						var g = elem.bezierSegment.getSegment();
						if (g)
						g.renderSnippetJoint(a);
					return;
				}
				
				elem.bezierSegment.each_all(function(){
					this.renderSnippetJoint(a);
				});
		}
	 };
	 this.render = function(a){
		if (this.elem){
			//console.debug("render overlay");
			a.save();
			a.setTransform(a.getTransform());
			renderOverLay(this.elem, a);			
			a.restore();
		} 
	 };
	
});


//actions
//register actions
var ACTIONS = igk.winui.cancasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regActions(Key.Alt | Key.Shift | Key.B, "editor.selectool.bezier", function (a){a.tool = new Tools.BezierMecanism(); });


var EXPORTS = igk.winui.cancasEditor.Exports;
EXPORTS.register("bezier", function(){
var c = EXPORTS.initExport().concat(EXPORTS.getStrokeAndFillExport()).concat([
		{name:"close", 'default': !1 },	
		{name:"d", 'default': null, generate: function(item){
			var s = "";
			var ms = 0;
			item.bezierSegment.each_all(function(){
				s+= this.getDef(ms==0);
				if (this.close)
					ms = 0;
				else
					ms=1;
			});
			if (item.close){
				s+="Z";
			}
			return s;
		}, resolv: function(item , v){
			
			// console.debug("call resolve");
			item.bezierSegment.clear();
			// var o = new LineSegment();
			// o.initPoint({x:0, y: 0}, {x:100, y: 100});
			// item.bezierSegment.push(o);
			var lpts =  {x:0, y:0};
			SERI.loadPathDef(v, 
			function(pts, m){
				var o = 0;
				switch(m){
					case 'C':
					case 'c':
							o = new  BezierCurveSegment();
							if (pts.length==4){
							o.startPoint = pts[0];
							o.controlPoint1 = pts[1];
							o.controlPoint2 = pts[2];
							o.endPoint = pts[3];
							lpts = pts[3];
							}else {
								o.startPoint = lpts || {x:0, y:0};
								o.controlPoint1 = pts[0];
								o.controlPoint2 = pts[1];
								o.endPoint = pts[2];
								lpts = pts[2];
							}
						break;
					case 'Q':
					case 'q':
							o = new  QuadricSegment();
							o.startPoint = pts[0];
							o.controlPoint = pts[1];
							o.endPoint = pts[2];
							lpts = pts[2];
						break;
					case 'L':
					case 'l':
						o = new LineSegment();
						if(pts.length == 2){
							o.startPoint = pts[0];
							o.endPoint = pts[1];
						}else{
							o.startPoint = lpts;
						}
						lpts = pts[1];
						break;
					case 'z':
					case 'Z':
						item.bezierSegment.getSegment().close = 1;
						break;
				}				
				if (o){
					item.bezierSegment.push(o);
				}
			});
			
			
		}},
		{name:"fillMode", 'default': ELEM.fillMode.evenodd }, 	
		]).concat(EXPORTS.matrixExport());
return c;
});

var ACTIONS = igk.winui.cancasEditor.Actions;
ACTIONS.regMenuAction("tools.bezier", {index:6, callback:function(){
	ACTIONS.invoke("editor.selectool.bezier");
}});


Tools.registerEditorAttribute("bezier", Tools.BezierMecanism);

})();