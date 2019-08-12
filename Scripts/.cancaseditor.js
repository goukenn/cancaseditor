// cancasEditor
// namespace : igk.winui.cancasEditor
// author: C.A.D  BONDJE DOUE
// version : 1.0
// startDate : 10/01/2018
// description: application environment for design
"use strict";

(function(){
var _NS = 0;
var _libUri=0;
_NS = igk.system.createNS("igk.winui.cancasEditor", {}); // global _NS definition



if (_NS.initialize)
	return;
if (igk.navigator.isSafari() && (igk.navigator.SafariVersion().split('.')[0] <600)){

	
	igk.defineProperty(_NS, "NotAvailable", {get:function(){ return 1; }});
	
	igk.winui.initClassControl("igk-canvas-editor-app",function(){
		this.setHtml("");
		this.remove();
	});
	return;
}; 


igk.defineProperty(_NS,'initialize', {get:function(){return 1;}});
var _moodule = igk.system.module("com.igkdev.cancaseditor");
var m_initlib = 0;

function _initLib(o){
	if (!o || m_initlib){
		return;
	}
	
	_libUri = o.appAssets; //store asset location
	m_initlib = 1;
};


(function(){

var _assetManager = {}; // assetmnager
var _location = igk.system.module.getModule().dir; //store module location;

var _p_reg = {}; // pattern register
var _pattern = {
	getres: function(n){
		if(n in _p_reg)
			return _p_reg[n];
		if (n in this){
			//buid pattern
			var svg = this[n];
			var rawData = (new XMLSerializer()).serializeToString(svg);
			var blob = new Blob([rawData], { type: 'image/svg+xml;charset=utf-8' });
			//igk.dom.body().add(svg);
			var img = igk.createNode("img").on("load", function(){
				console.debug(n+" resource loaded");
			});
			
			//igk.dom.body().add(img);
			//img.o.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent(rawData); //URL.createObjectURL(blob);
			img.o.src =  URL.createObjectURL(blob);
			// console.debug(svg);
			// console.debug(img.o);
			_p_reg[n] = img.o;
			return img.o;
		}
		return null;
	}
}; // pattern canvas
igk.appendProperties(_assetManager,{
	getUri: function(u){
		var _loc = _libUri ||_location;
		// console.debug("get uri "+u + " for "+_libUri);
		return _loc+"/assets/"+u;
	}
});

function createSvg(w,h, src){
	var svg = $igk(igk.svg.newSvgDocument());
	svg.setCss({
		width:w+'px',
		height:h+'px'
	}).setAttributes({
		viewPort: '0 0 '+w+' '+h,
		width:w,
		height:h
	});
	
	svg.setHtml(src);

	return svg.o;
};

igk.defineEnum(_pattern, {
	dashgrid : createSvg(48,48,'<g id="layer_1"><rect id="rectangle_1"  fill="#555" stroke-width="1" x="0" y="0" width="24" height="24"></rect><rect id="rectangle_2"  fill="#555" stroke-width="1" x="24" y="24" width="24" height="24"></rect></g>')
});


igk.defineProperty(_assetManager, 'pattern', {
	get: function(){
		return _pattern;
	}
});


igk.defineProperty(_NS,'assetManager', {get:function(){
	return _assetManager;
}});

})();
(function(){
	

	var m_editors = []; // store canvas editor append
	var m_capture =0;
	
function linearGradient(g){
	this.loadColors=function(colors){
		for(var i = 0; i < colors.length; i++){
			var cl = colors[i];
			g.addColorStop(cl.o, cl.cl);
		}
	};
	this.getDef=function(){
		return g;
	};
};
	
function CancasPrimitive(m_ctx){
	// - CancasPrivimitive encapsuler  
	// - primitive properties
	igk.defineProperty(this, "fill", {get:function(){ return m_ctx.fillStyle; } , set: function(v){ m_ctx.fillStyle = v; }});
	igk.defineProperty(this, "stroke", {get:function(){ return m_ctx.strokeStyle; } , set: function(v){ m_ctx.strokeStyle = v; }});
	igk.defineProperty(this, "strokeWidth", {get:function(){ return m_ctx.lineWidth; } , set: function(v){ m_ctx.lineWidth = v; }});
	
	// - primitive functions
	igk.appendProperties(this, {
		getDocumentSize: function(){
			return {w: 0 , h : 0};
		},
		clip: function(path, fillmode){
			m_ctx.clip(path, fillmode);
		},
		isPointInPath: function(path, x, y, fillmode){
			if (path.custom){
				return path.pathContain(m_ctx, x,y, fillmode);
				
			};
			return m_ctx.isPointInPath(path, x, y, fillmode);
		},
		setPattern: function (m){
			//@m : mixed data : image or creation pattern
			var p = m_ctx.createPattern(m,'repeat');
			if (p){
				m_ctx.fillStyle = p;
			}
			return p;
		},
		isPointInStroke: function(path, x, y){
			return m_ctx.isPointInStroke(path, x, y);
		},
		createLinearGradient: function(x1, y1, x2, y2){
			var g = m_ctx.createLinearGradient(x1, y1, x2, y2);
			return new linearGradient(g);			
		},
		createRadialGradient: function(x1, y1, r1, x2, y2, r2){
			var g = m_ctx.createRadialGradient(x1, y1,r1,  x2, y2, r2);
			return new linearGradient(g);			
		},
		
		setShadow: function(cl, blur, offsetx, offsety){
			m_ctx.shadowColor = cl;
			m_ctx.shadowBlur = blur;
			m_ctx.shadowOffsetX = offsetx || 0;
			m_ctx.shadowOffsetY = offsety || 0;
		},
		setFilter: function(b){
			if ('filter' in m_ctx){
				m_ctx.filter = b;
			}else{
				//console no filter
			}
		},
		fillRoundRect: function(bound, radius, fillrule){ 			
			_NS.Utils.Path.roundRect(m_ctx, bound, radius);
			m_ctx.fill(fillrule);
		},
		drawRoundRect: function(bound, radius){
			_NS.Utils.Path.roundRect(m_ctx, bound, radius);	
			m_ctx.stroke();
		},
		clearShadow: function(){
			m_ctx.shadowColor='transparent';
		},
		clearRect: function(x, y, w, h){
			m_ctx.clearRect(x,y,w,h);
		},
		setFont: function (n){
			m_ctx.font = n;
		},
		setTextAlign: function (n){ // default is left
			m_ctx.textAlign = n;
		},
		setDashoffset: function(offsets){
			m_ctx.setLineDash(offsets);
		},
		measureText: function(txt){
			var e = {
				width:m_ctx.measureText(txt).width,
				height:0
			};
			//get font size
			var fs = 0;
			var ft = m_ctx.font;
			ft.replace(/([0-9]+)(px)/g, function(m, g1)
			{
				fs = g1;
			});
			if (fs>0){
				//measure font 
				var dv = igk.dom.body().add("div");
				e.height = igk.getNumber(dv.setHtml("M").setCss({
					"position":"absolute",
					"lineHeight":fs+"px",
					"fontSize":fs+"px",
					"fontFamily": ft.split(" ")[1]
				}).getComputedStyle("height"));				
				dv.remove();
				// console.debug(ft);
				// console.debug(e);
			}
			
			//{
				//console.debug(m_ctx.font+ " "+ fs);
			//}
			
			return e;
		},
		wrapText: function(text, x, y, w, lineHeight) {
			var words = text.split(' ');
			var line = '';
			lineHeight = lineHeight || 12;

			for(var n = 0; n < words.length; n++) {
			  var testLine = line + words[n] + ' ';
			  var metrics = m_ctx.measureText(testLine);
			  var testWidth = metrics.width;
			  if (testWidth > w && n > 0) {
				m_ctx.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			  }
			  else {
				line = testLine;
			  }
			}
			m_ctx.fillText(line, x, y);
		},
		drawImage:function(img, x, y, w, h){
			if (!w || !h)
				return;
			m_ctx.drawImage(img, x, y, w, h);
		},
		drawText: function(txt, x, y , w){
			m_ctx.strokeText(txt, x, y, w);
		},
		fillText: function(txt, x, y, w){
		
			m_ctx.fillText(txt, x, y, w);
		},
		drawRect: function(x,y, w, h){
			// m_ctx.rect(x, y, w, h);
			// m_ctx.stroke();
			m_ctx.strokeRect(x, y , w , h );
		},
		fillRect: function(x, y, w, h){
			// m_ctx.rect(x, y, w, h);
			// m_ctx.fill();
			
			m_ctx.fillRect(x, y, w, h);
		},
		drawLine: function(x1, y1, x2, y2){
			m_ctx.beginPath(); 
			m_ctx.moveTo(x1, y1);
			m_ctx.lineTo(x2, y2);
			m_ctx.stroke();
			
		},
		setCircle:function(x,y,r){
			r = typeof(r)=='object' ? r : {x:r, y:r};		
			m_ctx.beginPath(); 
			m_ctx.arc(x, y, r.x, 0, 2*Math.PI, false); 
			m_ctx.closePath();
		},
		fillGraphics: function(fillmode){
			if (fillmode)
			m_ctx.fill(fillmode);
			else
				m_ctx.fill();
		},
		strokeGraphics: function(){
			m_ctx.stroke();
		},
		fillCircle: function(x, y, r){
			this.setCircle(x,y,r);
			m_ctx.fill();
		},
		drawCircle: function(x, y, r){
			this.setCircle(x,y,r);
			m_ctx.stroke();
		},
		save: function(){
			m_ctx.save();
		},
		setGlobalCompositeOperation: function(v){
			m_ctx.globalCompositeOperation = v;
		},
		restore: function(){
			m_ctx.restore();
		},
		setAlpha : function(v){
			m_ctx.globalAlpha = v;
		},
		setTransform: function(matrix){
			var e = matrix.element || matrix;
			m_ctx.transform(e[0], e[1], e[2], e[3], e[4], e[5]);
		},
		transform: function(matrix){//multiply the current matrix
			var tab = matrix.element;
			m_ctx.transform(tab[0], tab[1], tab[2], tab[3], tab[4], tab[5]);
		},
		currentTransform: function(){
			var fc = m_ctx.getTransform || m_ctx.mozCurrentTransform;
			if (typeof(fc)!='function'){
				return new _NS.Matrix(fc);
			}
			var g = fc.apply(m_ctx);//.getTransform();
			return new _NS.Matrix([g.a, g.b, g.c, g.d, g.e, g.f]);
		},
		resetTransform: function(){
			m_ctx.resetTransform();
		},
		drawPath: function(path2d, fillRule){
			fillRule = fillRule || "nonzero"; //evenodd"; // nonzero
			if ('pathlist' in path2d){
				var t = path2d.pathlist;
				for(var i = 0; i < t.length; i++){
					m_ctx.stroke(t[i], fillRule);
				}
				return;
				
			}
			m_ctx.stroke(path2d, fillRule);
		},
		fillPath:function(path2d, fillRule){
			fillRule = fillRule || "nonzero"; //evenodd"; // nonzero
			if (path2d.custom){ 
				path2d.render(m_ctx, fillRule);
				return;
			}
			if ('pathlist' in path2d){
				var t = path2d.pathlist;
				for(var i = 0; i < t.length; i++){
					m_ctx.fill(t[i], fillRule);
				}
				return;
			}
			
			m_ctx.fill(path2d, fillRule);			
		},
		contains:function(path2d, x, y, fillRule){
			fillRule = fillRule || "nonzero"; //evenodd"; // nonzero
			if(path2d.custom){
				return m_ctx.isPointInPath(x, y, fillRule);
			}
			return m_ctx.isPointInPath(path2d, x, y , fillRule);
		},
		clearScene : function(){
			var c = $igk(m_ctx.canvas);
			var w = igk.getNumber( c.getComputedStyle("width")); 
			var h = igk.getNumber( c.getComputedStyle("height"));	
			c.setAttribute("width", w);			
			c.setAttribute("height", h);			
			m_ctx.clearRect(0, 0, w, h);
		}
	});
	

	
};

function copy_bound(b){
	var g = {};
	for(var i in b){
		g[i] = b[i];
	}
	return g;
	// return {
		// x: b.x,
		// y: b.y,
		// width: b.width,
		// height: b.height
	// };
}
	
igk.appendProperties(_NS,{
	getEditors: function(){
		return m_editors;
	},
	getCapture: function(){
		return igk.winui.mouseCapture.getCapture() || m_capture;
	},
	setCapture : function(v){
		igk.winui.mouseCapture.setCapture(v);
		m_capture = v;
	},
	releaseCapture : function(){
		igk.winui.mouseCapture.releaseCapture();
		m_capture = 0;
	},
	isCapturing: function(){
		return m_capture != 0;
	}
});

var CoreMathOperation = { // default mathematical operation - Onjrvy
		ceilVector: function(tab, l){
			l = l || 2;
			var f = (l * 10);
			if (f==0)
				f = 1;
			var o = "";
			for(var i = 0; i < tab.length; i++){
				if (i>0){
					o+=",";
				}
				o+= (Math.ceil(tab[i].x * f)/f)+" "+ Math.ceil(tab[i].y * f)/f;
			}
			return o; 
				
		},
		ceilBound: function(tab, l){
			l = l || 2;
			var f = (l * 10);
			if (f==0)
				f = 1;
			var o = "";
			for(var i = 0; i < tab.length; i++){
				if (i>0){
					o+=",";
				}
				o+= [(Math.ceil(tab[i].x * f)/f),Math.ceil(tab[i].y * f)/f, 
				Math.ceil(tab[i].width * f)/f,
				Math.ceil(tab[i].height * f)/f].join(' ');
			}
			return o; 
		},
		ceil: function(d, l){
			l = l || 2;
			var f = (l * 10);
			if (f==0)
				f = 1;
			return Math.ceil(d * f)/f;
		},
		TransformBound : function(bound, matrix){
			var b = copy_bound( bound);
			var m = matrix;			
			if (m){
				b.x = (m.element[0] * b.x) + m.element[4];
				b.y = (m.element[3] * b.y) + m.element[ 5];
				b.width = (m.element[0] * b.width );
				b.height = (m.element[3] * b.height);
			} 
			return b;
		},	
		GetElemBound : function(e){
			var b = copy_bound( e.bound);
			var m = e.matrix;	
			var T =_NS.CoreMathOperation;			
			if (m){
				var tab = [{x:b.x, y:b.y}, {x:b.x+b.width, y:b.y},{x:b.x, y:b.y + b.height}, {x:b.x + b.width, y:b.y + b.height}];
				T.TransformPoints(tab, m);//. m.transformPoint(tab);
				b= T.GetVectorBounds(tab);			
			}
			return b;
		},
		GetDistanceP : function(currentPoint, refPoint){
			return {
				x: (currentPoint.x - refPoint.x),
				y: (currentPoint.y - refPoint.y)
			};
		},
		GetAnglePoint: function(refPoint, currentPoint, angle){
			var T =_NS.CoreMathOperation;
			angle = angle || 1;			
            if (angle == 0)
                return {x:0, y:0};
			
            var pt = T.GetDistanceP(currentPoint, refPoint);
            var v_angle = T.GetAngle(refPoint, currentPoint) * T.ConvRdToDEGREE;
            v_angle = Math.round((v_angle) / angle) * angle;
            var v_x = 0.0;
            var v_y = 0.0;
            var d = 0.0;
			var R = Math.sqrt( (pt.x * pt.x) + (pt.y * pt.y));
            d = Math.min(pt.x, pt.y);// CoreMathOperation.GetDistanceP(currentPoint, refPoint);
			// console.debug("info");
			if ((v_angle % 180) == 0){
				v_x = currentPoint.x;
				v_y = refPoint.y;
			}else{
				//divide by quater
				if (v_angle<0){
					v_angle += 360;
				}
				// console.debug(v_angle + " = "+angle);
				
				// if (v_angle<=90){
					v_x = refPoint.x +( R * Math.cos(v_angle * T.ConvDgToRadian));
					v_y = refPoint.y +( R * Math.sin(v_angle * T.ConvDgToRadian));
				// }else if (v_angle <=180){
					
				// } else if (v_angle <=270){
					// v_x = refPoint.x -( R * Math.cos(v_angle * T.ConvDgToRadian));
					// v_y = refPoint.y -( R * Math.sin(v_angle * T.ConvDgToRadian));
					
				// } else if (v_angle <360){
					// v_x = refPoint.x +( R * Math.cos(v_angle * T.ConvDgToRadian));
					// v_y = refPoint.y +( R * Math.sin(v_angle * T.ConvDgToRadian));
				// }else {
					// console.debug("no sangle");
				// }
				// switch (v_angle)
				// {
					// case 0:
					// case 180:
						
						// break;
					// case 90:
					// case 270:
						// v_x = refPoint.x;
						// v_y = currentPoint.y;
						// break;
					// case 45:
						// {
							// v_x = refPoint.x + d;
							// v_y = refPoint.y + d;
						// }
						// break;
					// case 135:
						// {
							// v_x = refPoint.x + d;
							// v_y = refPoint.y - d;
						// }
						// break;
					// case 225:
							// v_x = refPoint.x + d;
							// v_y = refPoint.y + d;                    
						// break;
					// case 315:
					// case -45:
							// v_x = refPoint.x - d;
							// v_y = refPoint.y + d;                    
						// break;
				// }
			}
            return {x:v_x, y:v_y};
        },        
		GetVectorBounds: function(t){
			var minx = 0;
			var miny = 0;
			var maxx = 0;
			var maxy = 0;
			for(var i = 0; i < t.length; i++){
				if (i==0){
					minx = t[i].x;
					miny = t[i].y;
					maxx = t[i].x;
					maxy = t[i].y;
				}else{
					minx = Math.min(minx, t[i].x);
					miny = Math.min(miny, t[i].y);
					maxx = Math.max(maxx, t[i].x);
					maxy = Math.max(maxy, t[i].y);
				}
			}
			return {
				x: minx,
				y: miny,
				width : maxx - minx,
				height: maxy - miny
			}; 
		},
		ConvDgToRadian: Math.PI / 180.0,
		ConvRdToDEGREE: 180/Math.PI,
		GetBound: function(spts, epts){
			
			return {
				x: Math.min(spts.x, epts.x),
				y: Math.min(spts.y, epts.y),
				width: Math.abs(spts.x- epts.x),
				height: Math.abs(spts.y- epts.y)
			};
		},
		GetDistance: function (p1, p2){
			var x = p2.x - p1.x;
			var y = p2.y - p1.y;
			return Math.sqrt((x*x) + (y*y));
		},
		GetDiff: function (p1, p2){// get difference beetween to point
			var x = Math.abs(p2.x - p1.x);
			var y = Math.abs(p2.y - p1.y);
			return {x: x, y:y};
		},
		GetAngle: function(center, def){ // get angle in radian from 2point
		//@center: centerpoint reference
		//@def: definition point
			var  dx, dy;
            dx = def.x - center.x;
            dy = def.y - center.y;
            if ((dx == 0.0) && (dy == 0.0))
            {
                return 0.0;
            }
            if (dx == 0.0)
            {
                if (dy > 0)
                {
                    return (Math.PI / 2.0);
                }
                else
                    return (-Math.PI / 2.0);
            }
            var angle = Math.atan(dy / dx);
            if (dx < 0)
                angle += Math.PI;
            return angle;
		},	
		TransformPoint : function(pts, matrix){ // transform point to 
			if (!matrix.isIdentity()){
				var e = matrix.element;
				pts = {
					x: ( (pts.x  * e[0]) +( pts.y * e[2]) ) + e[4],
					y: ( (pts.x * e[1]) + (pts.y * e[3]) ) + e[5]
				};
			
			}		
			return pts;
		},
		TransformVector : function(pts, matrix){ // transform point to 
			if (!matrix.isIdentity()){
				var e = matrix.element;
				pts = {
					x: ( (pts.x  * e[0]) +( pts.y * e[2]) ),
					y: ( (pts.x * e[1]) + (pts.y * e[3]) )
				};
			
			}		
			return pts;
		},
		TransformPoints: function (points, matrix){
			if (matrix && !matrix.isIdentity()){
				var e = matrix.element;
				var pts = 0;
				for(var i=0; i < points.length; i++){
					pts = points[i];
					
					pts =  {
						x: ( (pts.x * e[0]) + (pts.y * e[2]) ) + e[4],
						y: ( (pts.x * e[1]) + (pts.y * e[3]) ) + e[5]
					};
					points[i] = pts;//_NS.CoreMathOperation.TransformPoint(pts[i]);
				}
			}
		},
		TransformVectors: function(points, matrix){
			//[x y 1] * [a b]
			//          [c d]
			//          [h m]
			
			// result is : 
			// [ a.x+c.y + h]
			// [ b.x+d.y + m]
			
			
			if (matrix && !matrix.isIdentity()){
				var e = matrix.element;
				var pts = 0;
				for(var i=0; i < points.length; i++){
					pts = points[i];
					pts =  {
						x: ( (pts.x  * e[0]) +( pts.y * e[2])),
						y: ( (pts.x * e[1]) + (pts.y * e[3]))
					};
					points[i] = pts;//_NS.CoreMathOperation.TransformPoint(pts[i]);
				}
			}
		}	
};

var _services = {};

//export CoreMathOperation
igk.defineProperty(_NS, 'CoreMathOperation', {
	get: function(){
		return CoreMathOperation;
	}
});

igk.defineProperty(_NS, 'services', {get:function(){
			return _services; 
		}
});

(function(){
	var m_globalsetting = {};
	igk.system.createNS(_NS.fullname+".settings",{
		storeSetting: function(n,v){
			m_globalsetting[n]=v;
		},
		getSetting: function(n){
			return m_globalsetting[n];
		}
	});

})();
igk.system.createNS(_NS.fullname, {
	primitive: CancasPrimitive,
	initApplication: function(fc){
		var g = initApplication;
		if (g){
			initApplication = function(a){
				g.apply(null, [a]);
				fc.apply(null, [a]);
			};  
		} else {
			initApplication = fc;
		}
	}
});
//@ store container of list element
// function canvasAppContainer(app){
		// this.Elements = app.list;
		// _NS.DrawingElements.drawing2DContainer.apply(this);
		// igk.appendProperties(this, _NS.DrawingElements.drawing2DContainer.prototype);
// };

// represent the application service manager
function Service(app){ // service singleton pattern
	var _srv = {}; 
	igk.appendProperties(this, {
		getService: function(n){
			if (n in _srv)
				return _srv[n];
			var s = null;
			if (n in _NS.services){
				var g = _NS.services[n];
				//init service
				var s = new g(app);
				_srv[n] = s;
			}
			return s; 
		}
	});
};
//* represent the canvas editor application object
//@q: target node 
//@o: options -settings
function CancasEditorApp(q, o){
	m_editors.push(this);
	_initLib(o);
	
	//private member
	var m_tool = null;
	var m_selectedItem = null;
	var m_ctx = null; // the drawing 2d context 
	var m_gl = null; // the gl context 
	var m_services = null; // service manager
	var self=this;
	var event = {};  // event prevent
	var m_id_manager = {};	
	var m_document =null; // current document
	var m_layer; // current layer
	this.list = []; //store list of items 
	this.overlayLayer = []; // overlay layers
	var m_asset_node = 0;
	var m_istouchable = 0;
	var m_matrix = 0; // global matrix
	var m_zoomx = 1.0;
	var m_zoomy = 1.0;
	var m_panx =  0.0;
	var m_pany = 0.0;
	var m_zoomMode = 1;
	var title;
	var __container__ = 0;
	q.editor = this;
	//utils ns
	var CoreMathOperation = _NS.CoreMathOperation;
	
	
	

	
	//check if support touching device
	//console.debug(q.istouchable());
	
	if (q.istouchable()){
		q.addClass("touchable-device");
		m_istouchable = 1;
		
		//cancel auto reload for the surface mecanism management
		q.on('touchstart', function(e){	
			e.preventDefault();
			e.stopPropagation();
		});
		
		 
	}
	this.setDebug = function(m){
		if (!o.isDebug){
			return;
		}
		var g = q.select(".debug").first();
		if (!g){
			g = q.add("div").addClass("debug posab").setCss({
				bottom:'0px',
				right : '10px'
			});
			
		}
		g.setHtml("");
		
		for(var i = 0; i < m.length; i++){
			g.add('div').setHtml(m[i]);
		}
	};
	
	function getItemIndex(i){
		var n = i.getType();
		if (! (n in m_id_manager)){
			m_id_manager[n] = 1;
		}
		return m_id_manager[n];		
	};
	function getNewItemId(i){
		var n = i.getType();
		var idx = getItemIndex(i);
		m_id_manager[n]++;
		return n+"_"+idx;
	}
	
	// ----------------------------------------------------------------------
	// properties
	// ----------------------------------------------------------------------
	igk.defineProperty(this, "host", {get: function(){return q; }});
	igk.defineProperty(this, "settings", {get: function(){return o; }});
	igk.defineProperty(this, "zoomX", {get: function(){return m_zoomx; }});
	igk.defineProperty(this, "zoomY", {get: function(){return m_zoomy; }});
	igk.defineProperty(this, "panX", {get: function(){return m_panx; }});
	igk.defineProperty(this, "panY", {get: function(){return m_pany; }});	
	igk.defineProperty(this, "zoomMode", {get: function(){return m_zoomMode; }});
	igk.defineProperty(this, "matrix", {get: function(){return m_matrix; }});
	
	//set context setting
	// igk.defineProperty(this, "fill", {get:function(){ return m_ctx.fillStyle; } , set: function(v){ m_ctx.fillStyle = v; }});
	// igk.defineProperty(this, "stroke", {get:function(){ return m_ctx.strokeStyle; } , set: function(v){ m_ctx.strokeStyle = v; }});
	// igk.defineProperty(this, "strokeWidth", {get:function(){ return m_ctx.lineWidth; } , set: function(v){ m_ctx.lineWidth = v; }});


	igk.defineProperty(this, "istouchable", {get:function(){ return m_istouchable; }});
	igk.defineProperty(this, "canvas", {get:function(){ return this.settings.canvas; }} ); 
	igk.defineProperty(this, "tool", {get:function(){return m_tool; } , set: function(v){
		if (v && !(igk.system.isInherit( v, _NS.Tools.Mecanism))){
			console.error("try to set a non mecanism tools ");
			return;
		}
		if (m_tool !=v){
			if(m_tool)
				m_tool.unregisterEvents();
			
			m_tool = v;
			if(m_tool){
				m_tool.host = self;
				m_tool.registerEvents();
			}
			raiseEvent('toolChanged', this);
		}
	}});
	
	//get or set the current document
	igk.defineProperty(this, "document", {get:function(){return m_document; }, set : function(v){
		if (m_document != v){
			var e =  {
			old: m_document,
			current: v
		};
		m_document = v; 
		raiseEvent("currentDocumentChanged",e);
		this.getTransform(!0);
	}}
	});
	//get or set the current layer
	igk.defineProperty(this, "layer", {get:function(){return m_layer; }, set : function(v){ if (m_layer!= v){
		var e =  {
			old: m_layer,
			current: v
		};
		m_layer = v; 
		raiseEvent("currentLayerChanged",e);
	}}});
	
	//get selected element
	igk.defineProperty(this, "element", {get:function(){return m_selectedItem; }});
	//get or set the title
	igk.defineProperty(this, "title", {get:function(){return title; }, set: function(v){
		if (v != title){
			title = v;
			q.raiseEvent("titleChanged");
		}
	}});
	
	this.raise = function(n, e){
		if (this["@loading"])
			return;
		q.raiseEvent(n, e);
	};
	

	// ----------------------------------------------------------------------
	// Events
	// ---------------------------------------------------------------------- 
	q.addEvent("toolChanged", event);
	q.addEvent("elementChanged", event);
	q.addEvent("itemStartEdition", event);
	q.addEvent("itemEndEdition", event);
	q.addEvent("currentLayerChanged", event);
	q.addEvent("currentDocumentChanged", event);
	q.addEvent("zoomChanged", event);
	q.addEvent("titleChanged", event);
	q.addEvent("selectChanged", event);
	q.addEvent("elementAdded", event);
	q.addEvent("elementRemoved", event);
	
	this.removeOverlay = function(over, index){
		var tab = this.overlayLayer;
		var t =  [];
		
		for (var g = 0 ; g < tab.length; g++){
			if (tab[g]==over){				
				if (index!= g){
					console.debug("the index of overlay was not correct");
				}
				continue;
			}
			
			t.push(tab[g]);
		} 
		this.overlayLayer.length = 0;
		this.overlayLayer = t;	
	};
	this.editElement = function(e){ // edit element with show dialog 
		
		if (e==null)
			return;		
		var T = _NS.tools;
		var GUI = _NS.gui;
		var R =  _NS.R;
		var d = (new T.EditElementSettingDialog(this, e, R)).control;
		GUI.dialog.showDialog(R.title_options, d);
	};
	this.getTransform = function(update){
		if (!m_matrix){
			update = 1;
			m_matrix =  new _NS.Matrix();
		};
		if (!update)
			return m_matrix;
		
		var e = _NS.enums.zoomMode;
		var W = 0;
		var H = 0;
		var posx = 0;
		var posy = 0;
		var w = 0;
		var h = 0;
		var zx = this.zoomX;
		var zy = this.zoomY;
		
		W = igk.getNumber(this.canvas.getComputedStyle("width"));
		H = igk.getNumber(this.canvas.getComputedStyle("height"));
		if (this.document){
			
			w = this.document.width;
			h = this.document.height;
		}else{
			w = W;
			h = H;
		}
		
		
		switch(this.zoomMode){
			case e.center:
				  posx = ((W - (w *  zx )) / 2.0);
                  posy = ((H - (h * zy) ) / 2.0);			 
				 
			break;
			case e["default"]:
				break;
			case e.stretch:
			console.debug("strech mode");
				break;
			
		}
		m_matrix.reset();		
		m_matrix.scale(zx, zy);
		m_matrix.translate(posx  + m_panx, posy + m_pany);
		
		var e = {
			zoom : zx == zy ? zx : Math.min(zx, zy),
			docWidth: W,
			docHeight: H
		};
		m_matrix.d = e;
		q.raiseEvent("zoomChanged", e);
		return m_matrix;
		
		
	};
	
	//addEvent("toolChanged", event);
	this.getDeviceLocation = function(x, y){
		 //getDeviceLocation
		
		var loc = this.canvas.getScreenLocation();
			
		var oloc = {
			x : x - loc.x,
			y : y - loc.y							
		};			// //console.debug(e);
		//if (this.document){
			
			//console.debug("transform ");
			var trans = this.getTransform();		
			oloc = {
				x: (oloc.x - trans.element[4]) / this.zoomX,
				y: (oloc.y - trans.element[5]) / this.zoomY
			};		 
		// };
 
		
		return oloc;
	};
	
	this.getScreenLocation=function(x, y){
		var loc = this.canvas.getScreenLocation();
			
		var oloc = {
			x : x ,
			y : y						
		};			// //console.debug(e);
		//if (this.document){
			
			//console.debug("transform ");
			var trans = this.getTransform();		
			oloc = {
				x: (oloc.x * this.zoomX) + trans.element[4],
				y: (oloc.y * this.zoomY) + trans.element[5]
			};		 
		// };
 
		
		return oloc;
	};
	
	//-----------------------------------------------------------------
	//functions list
	//-----------------------------------------------------------------
	igk.appendProperties(this, {
		getService: function(n){
			if (!m_services){
				m_services = new Service(this);
			}
			return m_services.getService(n);
		},
		select: function(loc){
			var items = 0;
			if (this.layer){
				items = this.layer.select(loc.x, loc.y, this);
			}else{
				items = [];
				var l = this.list;
				var c = l.root;
				
				while(c){
					if (c.contains(loc.x, loc.y, this)){
						items.push(c);
					}
					c = c.next;
				}
			
			}
			q.raiseEvent("selectChanged", {
				items: items
			});
			return items;
		},
		selectBound: function(bound){
			return [];
		},
		getElementById:function(id){
			var DC =_NS.DrawingElements.drawing2DContainer;
			var qlist = [this.list];
			var c = 0;
			var i = 0;
			while(c = qlist.pop()){
				for(var j = 0; j < c.length; j++){	
					i = c[j];
					if (i.id ==id)
						return i;
					
					if (igk.system.isInherit(i, DC)){
						qlist.push(i.Elements);
					}
				}
			}
			return null;
		},
		resetZoom: function(){
			m_zoomx = 1.0;
			m_zoomy = 1.0;
			m_panx = 0;
			m_pany = 0;
			this.getTransform(true);
			this.refresh();
		},
		resetFitAreaZoom: function(){
			if (this.zoomMode != _NS.enums.zoomMode.center){
				return;
			}
			var loc = this.canvas.getScreenLocation();
			
			var s = this.canvas.getSize();
			var W = (this.document? this.document.width:null)|| m_matrix.d.docWidth;
			var H = (this.document? this.document.height:null)|| m_matrix.d.docHeight;
			
			var ex = (s.w - 20)/ W;
			var ey = (s.h - 20)/ H;
			
			m_zoomx = Math.min(ex, ey);
			m_zoomy = m_zoomx;
			
			
			m_panx = 0;
			m_pany = 0;
			
			this.getTransform(true);
			this.refresh();
		},
		zoomIn: function(){
		 
			var W = (this.document? this.document.width:null)|| m_matrix.d.docWidth;
			// console.debug(W);
			if ((m_zoomx *1.1) > 8)
			{
				if (m_zoomx!= 8){
					m_zoomx = 8;
					m_zoomy = 8;	
					this.getTransform(true);
					this.refresh();
				}
				
			
				return;
			}
			m_zoomx *= 1.1;
			m_zoomy *= 1.1;			
			this.getTransform(true);
			this.refresh();
		},
		zoomOut: function(){
			var W = (this.document? this.document.width:null)|| m_matrix.d.docWidth;
			// console.debug(W);
			if ((W * (m_zoomx /1.1)) < 16)
				return;
			
			m_zoomx /= 1.1;
			m_zoomy /= 1.1;
			this.getTransform(true);
			this.refresh();
		},
		panLeft: function(d){
			m_panx -= d || 10;
			this.getTransform(true);
			this.refresh();
			
		},
		panRight: function(d){
			m_panx += d || 10;
			this.getTransform(true);
			this.refresh();
		},	
		panUp: function(d){
			m_pany -=  d || 10;
			this.getTransform(true);
			this.refresh();
			
		},
		panDown: function(d){
			m_pany += d || 10;
			this.getTransform(true);
			this.refresh();
		}
	});
	
	
	
	//raise event shortcut
	function raiseEvent(n, e){
		igk.winui.events.raise(q, n, e);
	};
	this.Reload= function(item, mecanism){ // reload edition view
		if (m_selectedItem == item){
			raiseEvent("itemEndEdition", {
					element: item,
					mecanism: mecanism								
			});	
			raiseEvent("itemStartEdition", {
					element: item,
					mecanism: mecanism								
			});
			this.refresh();
		}
	};
	//edit element from mecanism
	this.Edit = function(item, mecanism){
		if (m_selectedItem != item){			
			if (item){
				m_selectedItem = item;
				raiseEvent("itemStartEdition", {
					element: item,
					mecanism: mecanism								
				});
			}
			else{
				var e = m_selectedItem;
				m_selectedItem = item;
				raiseEvent("itemEndEdition", {
					element: e,
					mecanism: mecanism								
				});	
			}
			this.refresh();
		}
	};
	this.removeAll=function(items){ //items is array of container elements
		var c = 0;
		for(var j=0; j < items.length; j++){
			c = items[j]["@container"];
			if (c && c.remove(items[j])){
				raiseEvent("elementRemoved", {item:items[j], parent:c});
			}
		}
	};
	function createContext(canvas, type, opts){		
		var q = canvas.getContext(type, opts);
		return q;
	};
	function createWebglContext(canvas){
		var q = canvas.getContext("webgl") || canvas.getContext('experimental-webgl');
		return q;
	};
	
	//initialize 2d context
	this.initContext = function(type){
		type = type || "2d";		
		if (type == "2d"){			
		
			m_ctx = createContext(this.settings.canvas.o, type);		
			// m_ctx = this.settings.canvas.o.getContext("2d");			
			m_ctx.globalCompositeOperation = "source-over";
			if ('msImageSmoothingEnabled' in m_ctx)
				m_ctx.msImageSmoothingEnabled = 1;
		}
		//
		CancasPrimitive.apply(this, [m_ctx]);
		
		igk.appendProperties(this, {
		getDocumentSize: function(){
			var s = this.canvas.getSize();
			var W =  s.w;
			var H =  s.h;
			if (this.document){
				W = this.document.width;
				H = this.document.height;
			}
			return {
				w: W,
				h: H
			};
		}});
		
		
		if (this.settings.isDebug){
			
			this.renderFillModeDemo= function(){
			m_ctx.save();
			m_ctx.fillStyle = "red";
			m_ctx.strokeStyle = "black";
			m_ctx.beginPath();
			
			m_ctx.moveTo(0,0);
			m_ctx.lineTo(100, 0);
			m_ctx.lineTo(100, 100);
			m_ctx.lineTo(0, 100);
			// m_ctx.lineTo(100, 0);
			// .drawRect(0,0 ,100,100);
			// m_ctx.closePath();
		    //m_ctx.beginPath();
			m_ctx.moveTo(10,10);
			m_ctx.lineTo(40,10);
			m_ctx.lineTo(40,40);
			m_ctx.lineTo(10,40);
			
			m_ctx.closePath();
			 
			m_ctx.fill("evenodd");
			m_ctx.stroke();
			m_ctx.restore();
			
		};
		
		}
	};
	
	

	
	// append properties . primitive drawing function 
	igk.appendProperties(this, {
		clearScene : function(){
			var c = $igk(m_ctx.canvas);
			var w = igk.getNumber( c.getComputedStyle("width")); 
			var h = igk.getNumber( c.getComputedStyle("height"));	
			c.setAttribute("width", w);			
			c.setAttribute("height", h);			
			m_ctx.clearRect(0, 0, w, h);
		},
		refresh: function(){
			var a = this;
			a.clearScene();
			//render scene
			var _isbg = a.document !=null;
			var W = _isbg ? a.document.width:0;
			var H = _isbg ? a.document.height:0;
			var m =a.getTransform();
			var dx = m.element[4];
			var dy = m.element[5];
			var ex = m.element[0];
			var ey = m.element[3];
			a.save();
			if (a.document && a.document.fill=='transparent'){
				//(b.x*ex)+dx
				var mdash = _NS.assetManager.pattern.getres('dashgrid');
				try{
				var p = m_ctx.createPattern(mdash,'repeat');
				if (p){
					var c = igk.svg.newSvgDocument();
					var mat = c.o.createSVGMatrix();
					
					mat = mat.translate(dx, dy);
					// m_ctx.fillStyle = p;
					p.setTransform(mat);//new SVGMatrix());
					a.fill = p;
						 //etPattern(_NS.assetManager.pattern.getres('dashgrid'));
					a.fillRect(dx, dy, W * this.zoomX, H * this.zoomY);
				}
				}
				catch(e){
					console.error(e);
				}
			
			}
			
			a.setTransform(m);
			
			if (_isbg){
				a.setShadow("#444", 10, 0 , 0);
				a.drawRect(0,0, W, H);
				a.clearShadow();
			}
			
			if (a.settings.isDebug){
			a.renderFillModeDemo();
			}
			
			
			
			// a.moveTo(0,0);
			//a.fillCircle(100,100,100);
		
			// a.fill = 'white';
			// m_ctx.beginPath(); 
			// m_ctx.arc(100, 100, 50, 0, 2*Math.PI, false); 
			// m_ctx.moveTo(200, 100);
			// m_ctx.arc(100, 100, 100, 0, 2*Math.PI, false); 
			// m_ctx.closePath();		
			// m_ctx.fill('evenodd');
			// m_ctx.stroke();

			
			
			var q = a.list.root;
			while(q){
				q.render(a);
				q = q.next;
			}
			
			// for(var i= 0; i < a.list.length; i++){
				// a.list[i].render(a);
			// }
			
		
			a.restore();
			if (_isbg){
				
				a.save();
				a.stroke = 'black';
				a.setDashoffset([5,2,5]);
				var dx = m.element[4];
				var dy = m.element[5];
				var ex = m.element[0];
				var ey = m.element[3];
				a.drawRect(dx,dy,W * ex, H * ey);
				a.restore();
			}
			
			//render overlay layers
			for(var i = 0; i< a.overlayLayer.length; i++){
				a.overlayLayer[i].render(a);
			}
		},
		clear: function(){
			//reset all application items
			this.list = [];
			m_id_manager = {};
			this.Edit(null,null);		
			this.layer = null;
			this.document = null;
			m_selectedItem = null;
			if (m_asset_node){
				m_asset_node.setHtml("");
			}
										
		},
		addAsset: function(asset){
			if (!m_asset_node){
				m_asset_node = igk.dom.body().add("div").addClass("assets dispn");
			}
			m_asset_node.add(asset);
			return this;
		},
		addImageDocument: function(img){
			if (!img)
				return !1;
			var a = this;
			var doc = a.createElement("document");
			var l = a.createElement("layer");
			l.add(img);
			doc.add(l);
			a.add(doc);
			
			doc.setSize(
				img.width ,
				img.height
			);
			
			a.document = doc;
			a.layer = l;
			return !0;
		},
		createElement: function(name){
			if (name in _NS.DrawingElements){
				var f = _NS.DrawingElements[name];
				var i = new f();
				
				var id = getNewItemId(i);
				i.id = id;	
				return i;
			}
			return null;
		},
		add: function(name){
			//create or add element
			var i = 0;
			if (typeof(name)=="string")
				i = this.createElement(name);
			else 
				i = name;
			if (this.layer){
				this.layer.add(i);
				raiseEvent("elementAdded",{item:i, parent:this.layer});
				return i;
			}
			
			if (this.document && (i.getType() == "layer")){
				this.document.add(i);
				raiseEvent("elementAdded",{item:i, parent:this.document});
				return i;
			}
			
			// __container__ = __container__ || new canvasAppContainer(this);
			
			if (i){
				if (!this.list.item){
					// this.list.item = null;
					i.next = null;
					this.list.item = i;
				}
				else
				{
					i.next =  this.list.item.next;
					this.list.item.next = i;				
					// i.previous = this.list.item; 
				}
				if (!this.list.root)
					this.list.root = i;
				this.list.item = i;
				this.list.push(i);
				i['@container'] = this;	
				raiseEvent("elementAdded",{item:i, parent:this});				
				return i;			
			}
			return i;
		},		
		//container implement function
		moveOver:function(e){
			return _NS.DrawingElements.drawing2DContainer.MoveOver(this.list, e);
		},
		moveTopOver:function(e){
			return _NS.DrawingElements.drawing2DContainer.MoveTopOver(this.list, e);
		},
		moveBelow:function(e){
			return _NS.DrawingElements.drawing2DContainer.MoveBelow(this.list, e);
		},
		moveBottomBelow:function(e){
			return _NS.DrawingElements.drawing2DContainer.MoveBottomBelow(this.list, e);
		},
		remove: function(e){
			if (e['@container'] == this){
				var q = this.list.root;
				var m = [];
				if (q == e){
					//delete root element
					this.list = this.list.slice(1);//[m.length-1];
					this.list.root = q.next;
					this.list.item = this.list.length> 0 ? this.list[this.list.length - 1] : null; //this.list;
					return 1;
				}
				//generate new item
				
				var rm = 0;
				while(q){
					if (q.next == e){
						q.next = e.next;
						rm = 1;
					}
					m.push(q);					
					q = q.next;
				}
				// for(var i = 0; i < this.list.length; i++){
					// if (this.list[i]==e){
						// rm = 1;
						// continue;
					// }
					// if (i>0){
						// this.list[i-1].next = this.list[i];
					// }
					// m.push(this.list[i]);
				// }
				this.list = m;
				if (m.length>0){
					this.list.item = this.list[m.length-1];
					this.list.root = m[0];
				}
				else 
					this.list.item = null;
				return rm;
				
			}else{
				return e["@container"].remove(e);
			}
		},
		saveToXML: function(){
			igk.io.file.download("application/xml", "project.xml", 
			igk.winui.cancasEditor.visitors.xml(this.list));
		},
		exportTo: function(type){
			if (type in _NS.visitors){
				
				var e = {
					mimetype: 'text/plain',
					name : 'project.txt'
				};
				var gs = this.getDocumentSize();
				e.width = gs.w;
				e.height = gs.h; 
				var c =_NS.visitors[type].apply(null, [this.list, e]);
				if (c){
					igk.io.file.download(e.mimetype, e.name, c);
				}
				return 1;
			}
			return !1;
		}
	});
};




function loadMenu(ul, items, editor){	
	// console.debug("load menu");
	var pa =0; //parent 
	var p = ul;
	var nodes = {}; 
	var sn = "";
	var ACTIONS =_NS.Actions;
	var tab = ACTIONS.getMenuActions();
	var R = igk.system.createNS(_NS.getType().getFullName()+".R",{});	
	items.sort(ACTIONS.sortMenu(tab)); 	
	ACTIONS.initMenuList(items, p , nodes, editor, ACTIONS.menuItem);	
};

var initApplication =  null;

igk.appendProperties(CancasEditorApp.prototype, {
	initialize: function(){ // initialize the game application interface
		var q = this.host;
		var self = this;		
		var tools = {};
		if (!initApplication){
			alert("no init application");
			return;
		}
		initApplication(this);
		
		q.setHtml("");
		tools.top = q.add("div").addClass("tool t");  // top 
		tools.left = q.add("div").addClass("tool l"); // left 
		tools.bottom = q.add("div").addClass("tool b no-selection"); // bottom
		tools.bottom.setAttribute("igk-no-contextmenu", 1).init();
		
		
		
		// tools.bottom.add("div").setHtml("Selection");
		
		var ul = tools.top.add("ul").addClass("menu no-selection no-contextmenu");
		ul.setAttribute("igk-no-contextmenu",1);
		
		//menu as array for sorting
		var items = [];		
		var tab = _NS.Actions.getMenuActions();
		for(var i in tab){
			items.push(i);
		}
	
		// console.debug("load menu");	
		loadMenu(ul, items, this);
	
		ul.select(".contextmenu").remove();
		ul.init();
		
		var m_canvas = q.add("div").addClass("surface loc_a fit no-overflow")
		.add("canvas").addClass("surface-2d fit no-padding no-margin dispb");
		m_canvas.o.width = '100';
		m_canvas.o.height = '100';
		this.settings.canvas = m_canvas;
	
		this.initContext();	
		
		m_canvas.o.width = igk.getNumber(m_canvas.getComputedStyle("width"));
		m_canvas.o.height = igk.getNumber(m_canvas.getComputedStyle("height"));
		
		this.on("toolChanged", function(){
			// console.debug("toolchanged : "+ self.tool.name );
			if  (!tools.bottom._selection){
				var dv = 0;
				dv = tools.bottom.add("div");
				if (tools.bottom.o.childNodes.length>1)
					
					$igk(tools.bottom.o.childNodes[0]).insertBefore(dv.o);
				dv.addClass("dispib");
				tools.bottom._selection = dv; 
			}
			tools.bottom._selection.setHtml(self.tool.name);
		});
		
		
		//
		var lyDown =  _NS.Editor.getTools("Bottom").each(function(){
			this.attachTo(tools.bottom, self);
			//tools.bottom.add(this);
		});
		lyDown =  _NS.Editor.getTools("Left").each(function(){
			this.attachTo(tools.left, self);
			//tools.bottom.add(this);
		});
		_NS.Editor.getTools("Top").each(function(){
			this.attachTo(tools.top, self);
			
			//tools.bottom.add(this);
		});
		
		//----------------------------------------------------------------------------
		//- demo -  startup
		//----------------------------------------------------------------------------
		this.clearScene();
		// this.drawRect(0, 0, 10, 10);
		// this.fillRect(0, 0, 100, 200);
		this.stroke = "#000";
		this.fill = "white";
	
		// var rec = this.createElement("rectangle");
		// rec.bound = [
			// {x:0, y:0, width: 100, height: 100}, 
			// {x:10, y:10, width: 60, height: 60}
		// ];
		
		// var document = this.add("document");
		
		// var layer = this.createElement("layer");
		// layer.add(rec);
		// document.add(layer);
		
		
		// var l = this.createElement("line"); 
		// console.debug("? "+s.isInstanceOf(igk.winui.cancasEditor.DrawingElements.line));
		
		
		this.refresh();	
		
		igk.winui.reg_event(window, 'resize', 
		(function(q){
			return function(){
				q.getTransform(true);
			q.refresh(); }; 
		})(this));
		
		//initialize overlay layer		
		this.overlayLayer.push(new _NS.Layers.pageLayer(this));
		this.overlayLayer.push(new _NS.Layers.snippets(this));
		
		//init default tool
		if (!this.settings.isDebug)
			this.tool = new _NS.Tools.Selection();
		else 
			// this.tool = new _NS.Tools.CircleMecanism();		
			this.tool = new _NS.Tools.RoundRectMecanism();		
		//igk.winui.cancasEditor.Actions.invoke("editor.selectool.overlayLayer");
		
	},
	on: function(n, func, args){
		this.host.on(n, func, args);
		return this;
	},
	unreg_event: function(n, func){
		this.host.unreg_event(n, func);
		return this;
	}
});

// object used to initialize the service setting
function ProcessInitiator(){
	var _t = null;
	var _a = [];
	var _ln = 0;
	this.bind = function(n){ 
		if (n in _a)
			throw new Error("[bjs-ce] - Process already initialized");
		_a[n] =  1;
		_a.push(n);
		_ln++;
	};
	this.unbind = function(n){
		// console.debug("unbind "+n);
		delete(_a[n]);	
		var idx = _a.indexOf(n);
		delete(_a[idx]);
		_ln--;
		// console.debug("leng : "+_a.length+ "  : "+idx);
		// console.debug("leng : "+_a.length+ "  : "+_t);
		
		if(_ln<=0)
		  resolv();
		
	};
	function resolv(){
		//  console.debug("resolv process start ::::::: ");
		if(_t)
			_t.apply(this);
	};
	this.then = function(fc){
		// console.debug("bind then ");
		if (_ln==0){
			fc.apply(this);
			return;
		}
		var q = this;
		if (!_t)
			_t = fc;
		else {
			var g = _t;
			_t = function(){
				g.apply(q);
				fc.apply(q);
			};
		}
	};
};

var ProcessStart = new ProcessInitiator();


(function(){
	//
	// get loading script uri
	// 
	var R = igk.system.createNS(_NS.getType().getFullName()+".R",{});
	ProcessStart.bind('loadAssets'); 
	var fc = function(){ 
		// console.debug("loading lang .... ");
		var asset = _NS.assetManager.getUri(""); 
		igk.system.io.loadLangRes(asset, null, function(d){		 
			igk.appendProperties(R, d);		
			// console.debug(R);
			ProcessStart.unbind("loadAssets");
		});
		// console.debug("LoadResources assets : "+uri +  " Lib: "+_libUri); 
	};	
	igk.ready(fc);

	// ProcessStart.unbind("loadAssets");
	return;
	// setTimeout(function(){
	// // try{
	// 	// console.debug("load language res");
	// igk.system.io.loadLangRes(uri, null, function(d){	
	// 	// console.debug("--------------------load resources");
	// 	// // console.debug(d);
	// 	// // console.debug(R);
	// 	igk.appendProperties(R, d);
	// 	ProcessStart.unbind('loadAssets');
	// }, function(){
	// 	ProcessStart.unbind('loadAssets');
	// });
	
	// // }catch(ex){
	// 	// console.debug('error loaded');
	// // }
	 
	
	// }, 500);
	 
	// });
	
})();


//-----------------------------------------------------------------------
// BASE
//-----------------------------------------------------------------------

igk.winui.initClassControl("igk-canvas-editor-app", function(){
	// console.debug("init canvas-editor-app");
	var _s = JSON.parse(this.getAttribute("igk:settings"));
	var _e = {	
		'--igk-canvas-editor-app_background': '#444'
	};
	this.setCss(_e);
	
	var q = this;
	if (igk.navigator.isIE()){
		if("--igk" in q.o.style){
			igk.appendProperties(q.o.style, {
				"--igk": _e
			});
		}else {
			igk.appendProperties(q.o.style["--igk"],_e);
		}
	}	
	// console.debug(q.o.style); 
	// initiate the application
	ProcessStart.then(function(){
		// console.debug(" -- start canvas initialize -- ");
		// wait for requirement before start application 	
		(new CancasEditorApp(q, _s)).initialize();
	});
});




})();

//--------------------------------------------------------------------------
// EIDTOR
//--------------------------------------------------------------------------
(function(){
	function editorBuild(){
		var ost = []; 
		var sr = 0; //sort require
		igk.appendProperties(this, {
				append: function(host, index){
					ost.push({host: host, index:index});
					sr =  1;
				},
				each: function(callback){
					if (sr){
						// console.debug("sorting...");
						sr = 0;
						ost.sort(function(a,b){
							// console.debug("ao : "+a.index+ " x  "+b.index);
							if(a.index ==b.index)
								return 0;
							if (a.index<b.index)
								return -1;
							return 1;
						});
					}
					for(var i = 0; i < ost.length; i++){
						callback.apply(ost[i].host);
					}
				}
		});
		
		
	};
	
	var tools={};
	var EDITOR = igk.system.createNS("igk.winui.cancasEditor.Editor", {
		getTools: function(n){
			if (!(n in tools)){
				tools[n] = new editorBuild();
			}
			return tools[n];
		},
		regTool: function(n, host, index){
			if (!(n in tools)){
				tools[n] = new editorBuild();
			}
			tools[n].append(host, index  || 10);
			// index = index || 10;
			
		},
		Tool: function(){
			igk.appendProperties(this, {
				attachTo: function(t){
					
				}
			});
		}
	});
	
	
	igk.appendProperties(EDITOR.Tool.prototype, { attachTo : function(t){
		
	}});
})();


//---------------------------------------------------------------------------
// UTILS - PATH
//---------------------------------------------------------------------------
(function(){
	
var C1 = 0.552285; //magic number
function IsArray(t){
	return typeof(t) == 'object' && t instanceof Array;
};

function getPoint(s){
	if (typeof(s) =='number')
		return {x: s, y:s};
	if (typeof(s) == 'object' && ('x' in s) && ('y' in s))
		return s;
	return {
		x: parseFloat(s),
		y: parseFloat(s)
	};
};
	
function appendEllipse(_path_, x, y , width, height){
	
	
	var rx = width / 2.0;
	var ry = height / 2.0;
	var cx = x + rx;
	var cy = y + ry;
	var C1 = 0.552285;
	//const float C2 = 0.552285f;
	/* origin */
	
	_path_.moveTo(cx + rx, cy);
	/* quadrant I */
	_path_.bezierCurveTo(
				   cx + rx,
				   cy - C1 * ry,
				   cx + C1 * rx,
				   cy - ry,
				   cx,
				   cy - ry);
	/* quadrant II */
	_path_.bezierCurveTo(
				   cx - C1 * rx, cy - ry,
				   cx - rx, cy - C1 * ry,
				   cx - rx, cy);
	/* quadrant III */
	_path_.bezierCurveTo(
				   cx - rx, cy + C1 * ry,
				   cx - C1 * rx, cy + ry,
				   cx, cy + ry);
	/* quadrant IV */
	_path_.bezierCurveTo(
				   cx + C1 * rx, cy + ry,
				   cx + rx, cy + C1 * ry,
				   cx + rx, cy);
	/* close the path */
	_path.closePath();
			
};

function renderEllipse(ctx, x, y, width, height){
	var rx = width / 2.0;
	var ry = height / 2.0;
	var cx = x + rx;
	var cy = y + ry;
	var C1 = 0.552285; //magic number
	//const float C2 = 0.552285f;
	/* origin */
	ctx.moveTo(cx + rx, cy);
	/* quadrant I */
	ctx.bezierCurveTo(
				   cx + rx,
				   cy - C1 * ry,
				   cx + C1 * rx,
				   cy - ry,
				   cx,
				   cy - ry);
	/* quadrant II */
	ctx.bezierCurveTo(
				   cx - C1 * rx, cy - ry,
				   cx - rx, cy - C1 * ry,
				   cx - rx, cy);
	/* quadrant III */
	ctx.bezierCurveTo(
				   cx - rx,
				   cy + C1 * ry,
				   cx - C1 * rx,
				   cy + ry,
				   cx, 
				   cy + ry
				   );
	/* quadrant IV */
	ctx.bezierCurveTo(
				   cx + C1 * rx, cy + ry,
				   cx + rx, cy + C1 * ry,
				   cx + rx, cy);
	/* close the path */

};

function roundRect(ctx, bound, radius){//// round with bezier curve
	if ('beginPath' in ctx)
	ctx.beginPath(); 
	var r = 0;
	var rx , ry, cx, cy;
	if (radius[0].x == radius[0].y){
		r = radius[0].x;
		ctx.moveTo(bound.x, bound.y + r);
		ctx.arcTo(bound.x, bound.y, bound.x + r, bound.y, r);
	}else{
		r = radius[0];
		rx = r.x;
		ry = r.y;
		cx = bound.x + rx;
		cy = bound.y + ry;		
		ctx.moveTo(bound.x, bound.y + r.y);
		// ctx.bezierCurveTo(
				   // cx - rx, 
				   // cy,
				   // cx - rx, 
				   // cy - C1 * ry,
				   // cx - C1 * rx, 
				   // cy - ry
				   // );
				   ctx.bezierCurveTo(
				   cx - rx, 
				   cy,
				   cx - rx, 
				   cy - ry,
				   cx , 
				   cy - ry
				   );

				   
	}
	
	
	if (radius[1].x == radius[1].y){
		r = radius[1].x;
		ctx.lineTo(bound.x + bound.width - r, bound.y);
		ctx.arcTo(bound.x + bound.width, bound.y, bound.x + bound.width, bound.y + r, r);
	}else{
		r = radius[1];
		rx = r.x;
		ry = r.y;
		cx = bound.x + bound.width - rx;
		cy = bound.y + ry;
		ctx.lineTo(bound.x + bound.width - rx, bound.y);
		ctx.bezierCurveTo(
			   cx,
			   cy - ry,
			   cx + rx,
			   cy - ry,
			   cx + rx,
			   cy 			   
			   );
	}
	if (radius[2].x == radius[2].y){
		r = radius[2].x;
		ctx.lineTo(bound.x + bound.width, bound.y + bound.height- r);
		ctx.arcTo(bound.x + bound.width, bound.y+bound.height, bound.x + bound.width-r, bound.y + bound.height, r);
	}else{
		r = radius[2];
		rx = r.x;
		ry = r.y;
		cx = bound.x + bound.width - rx;
		cy = bound.y + bound.height -ry;
		ctx.lineTo(bound.x + bound.width, bound.y + bound.height- r.y);
		ctx.bezierCurveTo(
				   cx + rx, 
				   cy,
				   cx + rx, 
				   cy + ry,
				   cx , 
				   cy + ry
		);
	}
	if (radius[3].x == radius[3].y){
		r = radius[3].x;
		ctx.lineTo(bound.x + r, bound.y + bound.height);
		ctx.arcTo(bound.x , bound.y + bound.height, bound.x , bound.y + bound.height - r, r);
	}else{
		r = radius[3];
		rx = r.x;
		ry = r.y;
		cx = bound.x + rx;
		cy = bound.y + bound.height -ry;
		
		ctx.lineTo(cx, cy+ry);
			ctx.bezierCurveTo(
				   cx,
				   cy + ry,
				   cx - rx,
				   cy + ry,
				   cx - rx, 
				   cy
				   );
				   
				    // cx - rx,
				   // cy + C1 * ry,
				   // cx - C1 * rx,
				   // cy + ry,
				   // cx, 
				   // cy + ry
	}
	
	if ('closePath' in ctx){
		 ctx.closePath();
	} 
	
};

function roundInnerRect(ctx, bound, radius){// inner with bezier curve
if ('beginPath' in ctx)
	ctx.beginPath(); 
	var r = 0;
	var rx , ry, cx, cy;
	if (radius[0].x == radius[0].y){
		r = radius[0].x;
		ctx.moveTo(bound.x, bound.y + r);
		ctx.arcTo(bound.x+r, bound.y+r, bound.x + r, bound.y, r);
	}else{
		r = radius[0];
		rx = r.x;
		ry = r.y;
		cx = bound.x + rx;
		cy = bound.y + ry;		
		ctx.moveTo(bound.x, bound.y + r.y);		
	    ctx.bezierCurveTo(
		   cx - rx, 
		   cy,
		   cx , 
		   cy ,
		   cx , 
		   cy - ry
	   );

				   
	}
	
	
	if (radius[1].x == radius[1].y){
		r = radius[1].x;
		ctx.lineTo(bound.x + bound.width - r, bound.y);
		ctx.arcTo(bound.x + bound.width-r, bound.y+r, bound.x + bound.width+r, bound.y + r, r);
	}else{
		r = radius[1];
		rx = r.x;
		ry = r.y;
		cx = bound.x + bound.width - rx;
		cy = bound.y + ry;
		ctx.lineTo(bound.x + bound.width - rx, bound.y);
		ctx.bezierCurveTo(
			   cx,
			   cy - ry,
			   cx,
			   cy,
			   cx + rx,
			   cy 			   
			   );
	}
	if (radius[2].x == radius[2].y){
		r = radius[2].x;
		ctx.lineTo(bound.x + bound.width, bound.y + bound.height- r);
		ctx.arcTo(bound.x + bound.width-r, bound.y+bound.height-r, bound.x + bound.width-r, bound.y + bound.height, r);
	}else{
		r = radius[2];
		rx = r.x;
		ry = r.y;
		cx = bound.x + bound.width - rx;
		cy = bound.y + bound.height -ry;
		ctx.lineTo(bound.x + bound.width, bound.y + bound.height- r.y);
		ctx.bezierCurveTo(
				   cx + rx, 
				   cy,
				   cx , 
				   cy ,
				   cx , 
				   cy + ry
		);
	}
	if (radius[3].x == radius[3].y){
		r = radius[3].x;
		ctx.lineTo(bound.x + r, bound.y + bound.height);
		ctx.arcTo(bound.x+r , bound.y + bound.height-r, bound.x , bound.y + bound.height - r, r);
	}else{
		r = radius[3];
		rx = r.x;
		ry = r.y;
		cx = bound.x + rx;
		cy = bound.y + bound.height -ry;
		
		ctx.lineTo(cx, cy+ry);
			ctx.bezierCurveTo(
				   cx,
				   cy + ry,
				   cx ,
				   cy ,
				   cx - rx, 
				   cy
				   );
				   
				    // cx - rx,
				   // cy + C1 * ry,
				   // cx - C1 * rx,
				   // cy + ry,
				   // cx, 
				   // cy + ry
	}
	
	if ('closePath' in ctx)
	ctx.closePath();	
};

function roundFlatRect(ctx, bound, radius){
	var r = bound;
	var tr = radius;
	ctx.moveTo(r.x, r.y + tr[0].y, tr[0].x, tr[0].y);
	ctx.lineTo(r.x+tr[0].x, r.y);			
	ctx.lineTo(r.x+r.width-tr[1].x, r.y);
	ctx.lineTo(r.x+r.width, r.y+tr[1].y);
	ctx.lineTo(r.x+r.width, r.y+r.height-tr[2].y);
	ctx.lineTo(r.x+r.width-tr[2].x, r.y+r.height);
	ctx.lineTo(r.x+tr[3].x, r.y+r.height);
	ctx.lineTo(r.x, r.y+r.height-tr[3].y);
	ctx.closePath();
};

function appendCurve(_path_, points, tangents, startindex, count, closed, __settings){
	if (count == 0)
		return;
	
// setting curve

function __update_bound(x,y){
	if (!__settings)
		return;
	var m_bound = __settings.bound;
	m_bound.x = Math.min(m_bound.x, x);
	m_bound.y = Math.min(m_bound.y, y);
	m_bound.width = Math.abs(Math.max(m_bound.x+m_bound.width, x) - m_bound.x);
	m_bound.height = Math.abs(Math.max(m_bound.y+m_bound.height, y) - m_bound.y);
	
	__settings.bound = m_bound;
}

function append_bezier(x1, y1, x2, y2, x3, y3){	
	_path_.bezierCurveTo(x1, y1, x2, y2, x3, y3);
};
function append(x, y, ptype, points,  compressed){
	__update_bound(x,y);
	
	if (( ptype == 0) || (points.length==0))
		_path_.moveTo(x, y);
	else {
		
		if (compressed){
			
			
			var d = points[points.length-1];
			
			if ((d.x == x) && (d.y == y))
				return;
			
		}		
		_path_.lineTo(x, y);
	}
};

function close_figure(){
	_path_.closePath();
};




var ptype = ((closed) ||  (points.length == 0)) ? 0 : 1; 
var i;
var x1, x2, y1, y2, x3, y3;
var j=0;

append(points[startindex].x, points[startindex].y , ptype, points, true);
for (i = startindex; i < startindex + count-1; i++)
{
	j = i + 1;
	x1 = points[i].x + tangents[i].x;
	y1 = points[i].y + tangents[i].y;
	x2 = points[j].x - tangents[j].x;
	y2 = points[j].y - tangents[j].y;
	x3 = points[j].x;
	y3 = points[j].y;
	append_bezier(x1, y1, x2, y2, x3, y3);
}
/* complete (close) the curve using the first point */
if (closed)
{
	x1 = points[i].x + tangents[i].x;
	y1 = points[i].y + tangents[i].y;
	x2 = points[0].x - tangents[0].x;
	y2 = points[0].y - tangents[0].y;
	x3 = points[0].x;
	y3 = points[0].y;
	append_bezier(x1, y1, x2, y2, x3, y3);
	close_figure();
}
			
};

function BuildPath(path, points, count, open, tension, __settings){	
	var ctangents = GetCurveTangent(1, points, points.length, tension, !open);
	appendCurve(path, points, ctangents, 0, points.length, open, __settings);
};

function GetCurveTangent(terms, points, count, tension, open){
			var coefficient = tension /3.0;
            var tangents = []; //igk.system.createArray(count); //new Vector2f[count];
			
			for(var i = 0; i < count; i++){
				tangents[i] = {x:0, y:0};
			}
            if (count <= 2)
                return tangents;
			var r = 0;
			var s = 0;
			
            for (var i = 0; i < count; i++)
            {
                r = i + 1;
                 s = i - 1;
                if (r >= count)
                {
                    if (!open)
                    r = 0;// count - 1;
                    else
                    r = count - 1;
                }
                if (open)
                {
                    if (s < 0)
                        s = 0;
                }
                else
                {
                    if (s < 0)
                        s += count;
                }
                tangents[i].x += (coefficient * (points[r].x - points[s].x));
                tangents[i].y += (coefficient * (points[r].y - points[s].y));
            }
            return tangents;
			
};
	
function _GetRadius(d){
	if (typeof(d)=='object')
	{
		return d;
	}
	return {x:d, y:d};
};


//export method
igk.system.createNS("igk.winui.cancasEditor.Utils",{
		IsArray : IsArray,
		getPoint: getPoint,
		Path: {
			BuildPath: BuildPath,
			appendEllipse: appendEllipse,
			renderEllipse: renderEllipse,
			roundRect: roundRect,
			roundInnerRect: roundInnerRect,
			roundFlatRect:roundFlatRect
		},
		getMaxRadius: function(r){
			if (IsArray(r)){
				var b = {x:0, y:0};
				for(var i = 0; i < r.length; i++){
					var g = _GetRadius(r[i]);
					if (i==0){
						b.x = g.x;
						b.y = g.y;
					}else{
						b.x = Math.max(b.x, g.x);
						b.y = Math.max(b.y, g.y);
					}
				}
				return b;
			}
			return {x: r, y: r};
		}
	});
})();


//---------------------------------------------------------------------------
// MECANISMS
//---------------------------------------------------------------------------
(function (){
	var editor = {};
	// drawable object on canvas editor and tools
	var CoreMathOperation =_NS.CoreMathOperation;
	var M = igk.system.createNS("igk.winui.cancasEditor.Tools", {
		
		Mecanism: function(){
			var _exports_ = null;
			igk.defineProperty(this, "tool", {get:function(){ return this.host.tool; }});
			igk.defineProperty(this, "name", {get:function(){
				if (this.getType){
					return this.getType();
				}
				return  "BaseMecanism"; 				
			}});
			
			igk.appendProperties(this, {
				registerEvents: function(){
					this.host.tool = this;
				},
				unregisterEvents: function(){
				},
				update:function(elem, endPos, type){ // update the element - @type: event type mousedown|mousemove|mouseup|touchmove|touchend|touchstart
				},
				getPoints: function(elem){//get point for definition snippets
					
				},
				startUpdateIndex: function(elem, index, inf){
					
				},
				updateIndex: function(elem, index, endPos){
					//update item index
				},
				registerKeyAction: function(actions){
					//console.debug("base mecanism action");
					var Key =_NS.Actions.Key;
					var M_ACT =_NS.actions.mecanismActions.drawin2D;
					actions[Key.Escape] = function(a){
							// console.debug("cancel edition");
							if (a.type == "keyup"){
								if (a.elem){
									this.cancelEdition();
								}else{
									this.goToDefaultMecanism();
								}
							}
						};
						
						actions[Key.Plus] = M_ACT.countPropertyUp;
						actions[Key.Minus] = M_ACT.countPropertyDown;
						actions[Key.Shift | Key.Plus] = M_ACT.tensionPropertyUp;
						actions[Key.Shift | Key.Minus] = M_ACT.tensionPropertyDown;
						actions[Key.Alt | Key.Plus] = M_ACT.strokeWidthPropertyUp;
						actions[Key.Alt | Key.Minus] = M_ACT.strokeWidthPropertyDown;

						actions[Key.Shift | Key.Div] = M_ACT.toogleFillMode;
						actions[Key.F] = M_ACT.toogleFillMode;
						actions[Key.Ctrl | Key.E] = M_ACT.editElement;
						
						
						
			
				}
			});
			
		}
		
		,registerEditorAttribute: function(name, prop){
			editor[name] = prop;
		},
		getEditorAttribute: function(name){
			if (name in editor){
				var c =  editor[name];
				if (typeof(c)=='string'){
					c=  igk.system.getNS(c) || igk.system.getNS(M.fullname+"."+c);
				}
				return c;
			}
			return null;
		},
		listTools: function(){ // list registrated tools
			var tab = [];
			for(var i in editor){
				tab.push(i);
			}
			return tab;
		}
	});
	var MS_BTN = igk.winui.mouseButton;

	
	var Tools = igk.system.createNS("igk.winui.cancasEditor.Tools", {});
	//reg
	// Tools.RectangleMecanism.prototype = M.Mecanism.prototype;
	
	igk.system.createClass(Tools, {name:'RectangleMecanism', parent: M.Mecanism}, 	function(){
			//M.Mecanism.apply(this);
			var _parent_= M.Mecanism.prototype;
			var _self = this;
			var _elem  = null;
			var _startpos = {};
			var _endpos = {};
			var _key_actions = {};
			var _state = 0;
			
			igk.defineProperty(this, "startPos", {get:function(){ return _startpos; }, set:function(v){ _startpos = v;}});
			igk.defineProperty(this, "endPos", {get:function(){ return _endpos; }, set: function(v){ _endpos=v;}});
			igk.defineProperty(this, "elem", {get:function(){ return _elem; }});
			igk.defineProperty(this, "state", {get:function(){ return _state; }, set: function(v){
				_state = v;
			}});
			
			// mouse capture fuunction 
			function _startCapture(){
				igk.winui.mouseCapture.setCapture(_self.host.canvas.o);
				igk.winui.cancasEditor.setCapture(_self.host.canvas.o);
			};
			function _freeCapture(){
				igk.winui.mouseCapture.releaseCapture();
				igk.winui.cancasEditor.releaseCapture();
			};
			this.startCapture = _startCapture;
			this.freeCapture = _freeCapture;
			
			this.cancelEdition = function(){
				this.host.Edit(null,null);
				_elem = null;
				this.host.refresh();
			};
			this.startEdition = function(elem){
				if (elem){
					this.host.Edit(null, this);
					_elem = elem;
					//
					//
					//
					_elem.updateTransformElement();
					//_elem.matrix.reset();
					this.host.Edit(_elem, this);//Edit(null,null);
					
				}
			};
			
			//var m_mscapture=0;
			function mouseDown(e){
			    // console.debug(e.type+":Button: "+e.buttons+ " : "+MS_BTN(e));
				e.loc = _self.host.getDeviceLocation(e.clientX, e.clientY);
				e.ms_btn = MS_BTN(e);
				_self.handleMouseDown(e);				
			};
			function mouseUp(e){
			 // console.debug(e.type+":Button: "+e.buttons+" x "+ e.button+ " = "+MS_BTN(e));
				var capture =_NS.getCapture();
				if ((capture != 0) && (capture != _self.host.canvas.o)){
					
					return;
				}
				
				_freeCapture();
				e.loc =  _self.host.getDeviceLocation(e.clientX, e.clientY);	
				e.ms_btn = MS_BTN(e);				
				_self.handleMouseUp(e);
			};
			function mouseMove(e){
				 // console.debug("mouse move: " + MS_BTN(e));
				if (_NS.getCapture() != _self.host.canvas.o)
					return;
				e.loc = _self.host.getDeviceLocation(e.clientX, e.clientY);
				e.ms_btn = MS_BTN(e);
				_self.handleMouseMove(e);				

			};
			function _stopContext(e){
				// console.debug("stop context "+e.type);
				e.preventDefault();
				e.stopPropagation();
				
				if (_self.host.contextMenu){
					_self.host.contextMenu.show();
				}
						
			};
			function _startCreation(x, y){
				var e ={
					x:x,
					y:y,
					hanle: false
				}; 
				_self.onCreate(e);
				
				if (e.handle)
					return;
				
				_self.host.Edit(null, _self);
				_elem = _self.createElement();
				if(_elem==null){
					// console.debug("failed to create element");
					return;
				}
				// console.debug("crate element "+_elem.getType());
				//_elem.index = _idx + 1;
				// console.debug("click left");
				var loc = $igk(_self.host.canvas).getScreenLocation();
				//console.debug(e);
				_startpos = _endpos= {
					x : x - loc.x,
					y : y - loc.y							
				};
			};
			function _updateCreation(x, y){
				if (_elem){
						//update size
				var loc = $igk(_self.host.canvas).getScreenLocation();				
				_endpos = {
					x : x - loc.x,
					y : y - loc.y					
				};				
				_self.update(_elem, _endpos);
				_self.host.refresh();
				}
			}
			var touchStartFlag = 0;
			var _touchCreation=null;
			var _longtouchTimeout = 0;
			var _longtouchDuration = 1000;
			function TouchCreation(th, callback){
				this.invoke = function(){
					callback.call(null, th);
					touchStartFlag = 0;
				};
				
			};
			function touchStart(e){
				 console.debug('touchstart');
				// if (!e.passive){
					// e.preventDefault();
					// e.stopPropagation();
				// }
				
				
				 
				
				//start drawing on move
				
				var th = e.touches;				 
				if ((th.length == 1 ) && (touchStartFlag==0)){ 
					touchStartFlag = 1;
					var e = th[0]; 
					e.loc = _self.host.getDeviceLocation(e.clientX, e.clientY);
					_startpos = _endpos = e.loc;
					
					_touchCreation = new TouchCreation(th, function(th){
					var e = th[0]; 
					e.loc = _self.host.getDeviceLocation(e.clientX, e.clientY);
					  
					_self.host.Edit(null, _self);
					_elem = _self.createElement();
					if(_elem==null){ 
						return;
					};
					_self.state = 1;
					_startpos = _endpos = e.loc;
					});
					_longtouchTimeout = setTimeout(cancelTouchDrawing, _longtouchDuration);
					
				}
				 
				
				
				
			};
			function cancelTouchDrawing(){
			 // console.debug("cancel touching");
				clearTimeout(_longtouchTimeout);
				_longtouchTimeout = 0;
				touchStartFlag = -1;
				_touchCreation = null;
				
				_self.goToDefaultMecanism();
			}
			function touchMove(e){
				 // console.debug(_startpos);
				if (touchStartFlag == -1)
					return;
				var th = e.touches;
				var loc = 0;
				if (th.length == 1){
					var e = th[0];
					loc = _self.host.getDeviceLocation(e.clientX, e.clientY);
					
					if (touchStartFlag==1){
						
						//no mobile define long touch cancel ignore - //
						var x = _startpos.x - loc.x ;
						var y = _startpos.y - loc.y ;
						
						if (Math.sqrt(x*x + y *y)<2){
							
							// console.debug("ign");
							return;
						}
						
						clearTimeout(_longtouchTimeout);
						_touchCreation.invoke();
					}
					
				 
					
				
						//console.debug("pression : "+th[0].force);
					
					
					if (_state == 1){
						
						if (_elem){
							//update size
							_endpos = loc;
							_self.update(_elem, _endpos);
							_self.host.refresh();
						}
					}
				
				}
				
			};
			function touchEnd(e){
				if (touchStartFlag == -1){
					touchStartFlag = 0;
					return;
				}
				// e.preventDefault();
				// e.stopPropagation();
				// console.debug("touchend ");
				var th = e.touches;
				if (_elem && (_state == 1)){
					if (th.length == 1){
						var e = th[0];
						var loc = _self.host.getDeviceLocation(e.clientX, e.clientY);
						if (_elem){
							//update size
							_endpos = loc;
							_self.update(_elem, _endpos);
							_self.host.refresh();
						}
					}
					_self.host.Edit(_elem, _self);
					
					
				}
				_state =0;
					
			};
			
			function __stopEdition(){
				if (_elem){
					_self.host.Edit(null, _self);
					_elem = null;
				}
			};
			function dblclick(e){
				e.loc = _self.host.getDeviceLocation(e.clientX, e.clientY);
				_self.onDblClick(e);
			};
			
			var keys_event = null;
			
			_self.isShift = function(){
				return keys_event ? keys_event.shiftKey : !1;				
			};
			_self.isCtrl = function(){
				return keys_event ? keys_event.ctrlKey : !1;				
			};
			
			function __handleKey(e){
				if (igk.winui.dialogs.isOpen())
					return;
				
				keys_event = e;
				var k =_NS.Actions.getKeyFromEvent(e);
			
				if (k in _key_actions){
					
					var ev ={
						type: e.type,
						key: k,
						host: _self.host,
						elem: _elem,
						handle:1
					};
					//console.debug("handle : "+ _key_actions[k].name);
					_key_actions[k].apply(_self, [ev]);
					
					if (ev.handle){
						e.preventDefault();
						e.stopPropagation();					
					}
				}
			};
			//because of bubbling the mecanism must start capture only on click down
			
			this.handleMouseDown = function(e){
				
				switch(e.ms_btn){
					case MS_BTN.Left: 
						var pos = e.loc;//_self.host.getDeviceLocation(e.clientX, e.clientY);
						// e.loc = pos;
						// var loc = $igk(_self.host.canvas).getScreenLocation();
						// //console.debug(e);
						// _startpos = _endpos = {
							// x : e.clientX - loc.x,
							// y : e.clientY - loc.y							
						// };
						
						_startpos = _endpos = pos;						
						_self.host.Edit(null, _self);
						_elem = _self.createElement();
						if(_elem==null){
							return;							
						}						
						_startCapture();
						
					break;
					case MS_BTN.Right:
						
					break;
				}
			};
			this.handleMouseUp=function(e){				
				switch(MS_BTN(e)){
					case MS_BTN.Left:						
						if (_elem){
							
							_self.update(_elem, e.loc, e.type);							 
							_self.host.refresh();
							_self.host.Edit(_elem, _self);							
						}
					break;
					case MS_BTN.Right:
						e.preventDefault();
						e.stopPropagation();
						if (_elem){	
							_self.host.Edit(null, _self);
							_elem = null;
						}else{
							// goto c
							//console.debug("go to default");
							_self.goToDefaultMecanism();
						}
						
						_self.host.refresh();
						
					break;
				}
			};
			
			this.handleMouseMove=function(e){
				switch(MS_BTN(e)){
					case MS_BTN.Left:
						// console.debug("canvas editor::::" + e.handle);
						//create element	this.host.add("rectangle");
						if (_elem){
						//update size
						_endpos = e.loc;
						_self.update(_elem, _endpos);
						_self.host.refresh();
						}
					break;
					case MS_BTN.Right:
					break;
				}
			};
			
			this.onDblClick = function(e){
				
			};
			this.onCreate = function(def){
					// handle this to create multiple element
			};
			this.goToDefaultMecanism = function(){
				if (this.getType().toLowerCase() == 'selection'){
					return !1;
				}	
				//	console.debug("go to default tool");
				igk.winui.cancasEditor.Actions.invoke("editor.selectool.selection");
				return !0;// this.host.tool = new _NS.Tools.Selection();
			};
			var regParent = this.registerEvents;
			this.registerEvents = function(){
				regParent.apply(this); 
				var s = this.host;

				
				if (s.canvas.istouchable()){
					s.canvas.on("touchstart", touchStart, {passive:1});	
					s.canvas.on("touchmove", touchMove, {passive:1});	
					s.canvas.on("touchend", touchEnd, {passive:1});						
				}
				else{				
					s.canvas.on("dblclick", dblclick);
					s.canvas.on("mousedown", mouseDown);
					s.canvas.on("mouseup", mouseUp);
					s.canvas.on("mousemove", mouseMove);
				}
				s.canvas.on("contextmenu", _stopContext);
				$igk(document).on("keyup keydown", __handleKey);//.on("keydown", __handleKey);
				
				s.on("currentLayerChanged", __stopEdition);	
				s.on("itemEndEdition", __delete_item);
				igk.winui.cancasEditor.Actions.bindEditor(s);
				_key_actions = {};
				this.registerKeyAction(_key_actions);				
				this.host.Edit(null, this);
			};
			var unregE = this.unregisterEvents;
			this.unregisterEvents = function(){
				if (unregE) unregE.apply(this); 
				var s = this.host;
				_key_actions = {};
				$igk(document).unreg_event("keyup keydown", __handleKey); // . 
				
				s.unreg_event("itemEndEdition", __delete_item);
				s.unreg_event("currentLayerChanged", __stopEdition);	
				
				s.canvas.unreg_event("mousedown", mouseDown);
				s.canvas.unreg_event("mouseup", mouseUp);
				s.canvas.unreg_event("mousemove", mouseMove);
				s.canvas.unreg_event("contextmenu", _stopContext);
				if (s.canvas.istouchable()){
					// s.canvas.unreg_event("igkTouchStart", touchStart);	
					// s.canvas.unreg_event("igkTouchMove", touchMove);	
					// s.canvas.unreg_event("igkTouchEnd", touchEnd);

					s.canvas.unreg_event("touchstart", touchStart);
					s.canvas.unreg_event("touchmove", touchMove);
					s.canvas.unreg_event("touchend", touchEnd);
				}
				
			};
			
			
			
			function __delete_item(e){	
				_self.onEndEdition(e);
			};
			
			this.onEndEdition = function(e){
				if (_elem == e.element && (_self.host.list.length==0)){
					_elem = null;
				}
			};
			// this.registerKeyAction = function(){
				// override for key handle on canvas
			// };
			this.createElement= function(q){
				return this.host.add("rectangle");
			};
			this.update = function(elem, endPos, type){		
					if (type=='mouseup' && (CoreMathOperation.GetDistance(endPos, _startpos)==0)){
							_elem.bound.x = endPos.x;
							_elem.bound.y= endPos.y;
							_elem.initialize();
					}else{			
					elem.bound = {
						x: Math.min(_startpos.x, endPos.x),
						y: Math.min(_startpos.y, endPos.y),
						width: Math.abs(_startpos.x- endPos.x),
						height: Math.abs(_startpos.y- endPos.y)
					};
				}
				elem.initialize();
			};
			this.updateIndex = function(elem, index, endPos){
				var b = elem.bound;
				var _s= this.startPos;
				var _e= this.endPos;
				switch(index){
					case 0:
					_s = endPos;
					break;
					case 1:
					_e = endPos;
					_s.y = this.endPos.y;
					break;
					case 2:
					if(this.isShift()){
						var d = Math.max(-b.x + endPos.x, -b.y + endPos.y);
						endPos.x =  b.x + d;
						endPos.y =  b.y + d;
					}
			
					_e = endPos;
					break;
					case 3:
					_e.y = this.startPos.y;
					_e.x = this.endPos.x;
					_s = endPos;
					break;
					
				}
				elem.bound = CoreMathOperation.GetBound(_s, _e);				
				elem.initialize();
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
			
			this.startUpdateIndex = function(elem, index, inf){
				//start update index;
				var b = elem.bound;
				this.startPos = {x:b.x, y:b.y};
				this.endPos = { x : elem.bound.x + elem.bound.width, 
				y: elem.bound.y + elem.bound.height}; 
			};
		}
	);
	
 
	// use to register rectangle mecanism as element attribute
	Tools.registerEditorAttribute("rectangle", "RectangleMecanism");
	
	


})();

//---------------------------------------------------------------------------
// ELEMENTS
//---------------------------------------------------------------------------
(function(){
	var drawingLayeredObject  = function(){
		var m_id='';
		var m_blendings = 0;
		 
		 
		 function getApp(){
			 var q =this["@container"];
			 
			 // console.debug("test App");
			 
			 // return null;
			 while( q){ 
				 if (q.__proto__.constructor.name == "CancasEditorApp"){
					 break;
				 }
				 q = q["@container"];
			 }
			 return q;
		 };
		igk.defineProperty(this, "id", {get: function(){return m_id; }, set: function(v){ m_id = v; }});
		this.dispatchEvent =  function(n, e){
			//event raise only of source application is defined
			var q = getApp.apply(this);			
			if (q){
				q.raise(n, e);
			};
		};
		
		this.Edit = function(engine, host){			
			engine.addGroup().
			addControlLabel("id", this.id);	
			
			
			//styling items
			if ('fill' in this){
				engine.addGroup().
				addControlLabel("fill", this.fill);		
			}
			if ('stroke' in this){
				engine.addGroup().
				addControlLabel("stroke", this.stroke);		
			}
			if ('strokeWidth' in this){
				engine.addGroup().
				addControlLabel("strokeWidth", this.strokeWidth);		
			}
			
			if ('opacity' in this){
				engine.addGroup().
				addControlLabel("opacity", this.opacity);		
			}
			if ('blendingMode' in this){
				if (!m_blendings){
					m_blendings =_NS.enums.blendings.getComboboxEnumValue();					
				}
				engine.addGroup().
				addCombobox("blendingMode", this.blendingMode, m_blendings );		
			}
			
		};
	
		this.contains = function(x, y, a){
			return !1;
		};
	};

	var IsArray = _NS.Utils.IsArray;
	
	
	var defp = 0;
	function readPoint(def){
	var o = '';
	var p = 0;
	var x = 0;
	var y = 0;
	var f = 0;
	var ch =0;
	// console.debug("readpoint "+defp);
	while(!f && (def.m< def.ln)){
		ch = def.v[def.m];
		if(/[a-zA-Z ]/.test(ch)){
			if (o.trim().length>0){
					if(p==0){
						x = parseFloat(o);
						o = '';
					}else {
						y = parseFloat(o);
						o = '';
						f = 1;
						def.m--;
						return {x:x, y:y}; 
					}
					p++;
			}
		}else {
		switch(ch){
			case ' ':
			case ',':
			case 'C':
			case 'c':
			case 'Q':
			case 'q':
			case 'l'://lineTo
			case 'L':
			case 'Z':
			case 'z':
				if (o.trim().length>0){
					if(p==0){
						x = parseFloat(o);
						o = '';
					}else {
						y = parseFloat(o);
						o = '';
						f = 1;
						def.m--;
						return {x:x, y:y}; 
					}
					p++;
				}
			break;
			case ".":
			default:
				if (/[0-9\.]/.test(ch)){
					o+= ch;
				}
				
			break;
		}
		
		}
		
		def.m++;
	}
	if(p==1 && (o.length>0)){
		// console.debug("extra data");
		y = parseFloat(o);
		o = '';
		f = 1;
	}
	return {x:x,y:y};
};
	
	//serializer definition
	var SERI = igk.system.createNS("igk.winui.cancasEditor.Serializer",{
		
		loadPathDef: function(v, callback){ // read svg path definition
//
// load to
//
// var m = 0;
 var ch = 0;
// var ln = v.length;
var post = 0;
var def = {
	m: 0,
	ln: v.length,
	v:v
};
var pts = [];
var epts = 0;
var m = 0;

while(def.m< def.ln){
	ch = def.v[def.m];
	switch(ch){
		case 'M':
			def.m++;
			pts.push(readPoint(def));
		
		//move to
		break;
		case 'C':
			m = ch;
			def.m++;
			pts.push(readPoint(def)); def.m++;
			pts.push(readPoint(def)); def.m++;
			pts.push(readPoint(def)); 
			
			callback(pts, m);
			pts = [];
			
			
		break;
		case 'Q':
			m = ch;
			def.m++;
			pts.push(readPoint(def)); def.m++;
			pts.push(readPoint(def)); 			
			callback(pts, m);
			pts = [];
			break;
		case 'L':
			m = ch;
			def.m++;
			pts.push(readPoint(def)); 
			callback(pts, m);
			pts = [];
			break;
				
		case 'z':
		case 'Z':
			//close segment
			callback(pts, ch);
			break;
	}
	def.m++;
};

}, loadDefPoint: function(v, callback){
						//
			// load to
			//
			// var m = 0;
			 var ch = 0;
			// var ln = v.length;
			var post = 0;
			var def = {
				m: 0,
				ln: v.length,
				v:v
			};
			var pts = [];
			var epts = 0;
			var m = 0;

			while(def.m< def.ln){
				ch = def.v[def.m];
				switch(ch){
					 
					case 'd':
						m = ch;
						def.m++;
						pts.push(readPoint(def)); def.m++;
						pts.push(readPoint(def)); def.m++;
						pts.push(readPoint(def)); 
						
						callback(pts, m);
						pts = []; 
					break; 
				}
				def.m++;
			}	
		},
		getAttrib: function(n, type, def){
			var e = {
				name:n ,	
				serializer: SERI[type+"Serializer"], 
				unserialize: SERI[type+"Unserializer"]
			};
			if (def)
				def["default"] = def;
			return e;
		},
		gradientDefinitionSerializer: function(v){
			var s = "";
			for(var i = 0; i < v.length; i++){
				if (i>0)
					s+=",";
				s += v[i].o+ " "+v[i].cl;
			}	
			return s;
		},
		boundSerializer: function(v){
			//function ceil(v, l){
			var ceil = _NS.CoreMathOperation.ceilBound;
			 
			if (IsArray(v)){
				var o = "";
				var g = 0;
				o = ceil[v];
				return o;
			}
			return ceil([v]);
		},
		boundUnserializer: function(v){
			if (typeof(v) == 'string')
			{
				var tab = v.split(' ');
				if (tab.length ==4){
					
				return {
						x: parseFloat(tab[0]),
						y: parseFloat(tab[1]),
						width: parseFloat(tab[2]),
						height: parseFloat(tab[3])
					};
				}
			}
			return {
				x:0,
				y:0,
				width:0,
				height:0
			};
		},
		vector2Serializer: function(v){
			var ceil = _NS.CoreMathOperation.ceil;
			if (IsArray(v)){
				var o = "";
				var g = 0;
				for(var c = 0; c < v.length; c++){
					if (c>0)
						o+=",";
					g = v[c];
					o += ceil(g.x)+ " "+ceil(g.y);
				}
				return o;
			}			
			return ceil(v.x)+ " "+ceil(v.y);	
		},
		vector2Unserializer: function(v){
			if (typeof(v)=='string'){
				var tab = v.split(' ');
				return {
					x: parseFloat( tab[0]),
					y: parseFloat(tab[1])
				};
			}
			return {
				x:0,
				y:0
			};
		},
		floatSerializer: function(v){
			var ceil = _NS.CoreMathOperation.ceil;
			
			if (IsArray(v)){
				var o = "";
				var g = 0;
				for(var c = 0; c < v.length; c++){
					if (c>0)
						o+=",";
					g = ceil(v[c]);
					o += g;
				}
				return o;
			}			
			return ceil(v);
		},
		spaceFloatSerializer : function(){
			if (IsArray(v)){
				var o = "";
				var g = 0;
				for(var c = 0; c < v.length; c++){
					if (c>0)
						o+=" ";
					g = v[c];
					o += g;
				}
				return o;
			}			
			return v;
		},
		radiusSerializer: function(v){
				var pts = 0;
				var ceil = _NS.CoreMathOperation.ceil;
			
				function getdata(pts){	
					if (typeof(pts)=="number")
						return ceil(pts);
				
					if (pts.x == pts.y){
						return ceil(pts.x);
					}else 
						return ceil(pts.x) + " "+ ceil(pts.y);
				};
				if (IsArray(v)){
					var o = "";
					
					for(var i = 0; i < v.length; i++){
						if (i> 0)
							o +=", ";
						pts = v[i];
						o += getdata(pts);
					}
					return o;
				}
				return getdata(v);
			},
			radiusUnSerializer : function(v){
				if (typeof(v) == 'string'){
					var h = v.split(',');
					if (h.length==1){
						return parseFloat(h[0]);
					}else{
						var tab = [];
						for(var j = 0; j < h.length; j++){
							var c = h[j].trim().split(' ');
							if (c.length==1){
								tab.push(parseFloat(c[0]));
							}else {
								tab.push({
									x:parseFloat(c[0]),
									y:parseFloat(c[1])
								});
							}
						}
						return tab;
					}
				}
				return 0;
			}
		
	});
	
	//matrix 2d operation
	function Matrix(e){
		var m_element = e || [1,0,0,1,0,0];
		
		igk.defineProperty(this, "element", {get:function(){
			return m_element;
		}});
	};
	
	//element prototype
	igk.appendProperties(Matrix.prototype, {
		reset: function(){
			var t = this.element;
			t[0] = t[3] = 1;
			t[1] = t[2] = t[4] = t[5]= 0;
			// this.element = [1,0,0,1,0,0];
		},
		getDet : function(){			
			var t = this.element;
			return t[0]*t[3] - (t[1] * t[2]);
		},
		isInvertible: function(){
			return this.getDet()!= 0;
		},
		invert: function(){
			var det = this.getDet();
			if (det==0)
				return null;
			var h = this.element;
			var t = [
				h[3]/det, -h[1]/det,
				-h[2]/det, h[0]/det,
				h[4], h[5]
			];
			this.element = t; 
		},
		isIdentity: function(){
			return ((this.element[0] == 1) && (this.element[0] == this.element[3])) && 
			((this.element[1] == 0) && (this.element[1] == this.element[2])) && 
			((this.element[4] == 0) && (this.element[4] == this.element[5]));
		},
		scale: function(ex, ey){
			// [ a , b, 0],
			// [ c , d, 0], 
			// [ h , m, 1],
			//multiply by a scale matrix
			//[ ex , 0, 0]
			//[ 0 , ey, 0]
			//[ 0 , 0,  1]
			//=
			// [ (a.ex) (b.ey) 0]
			// [ (c.ex) (d.ey) 0]
			// [ (h.ex) (m.dy) 1]
			this.element[0] *= ex; 
			this.element[2] *= ex; 
			this.element[4] *= ex;
			
			this.element[1] *= ey; 
			this.element[3] *= ey; 
			this.element[5] *= ey; 
		},
		translate: function(x, y){
			// [ a , b, 0],
			// [ c , d, 0], 
			// [ h , m, 1],
			//multiply by a translation matrix
			//[ 1 , 0, 0]
			//[ 0 , 1, 0]
			//[ dx , dy, 1]
			//=
			// [ (a) (b) 0]
			// [ (c) (d) 0]
			// [ (h+dx) (m+dy) 1]
			
			this.element[4] = (x + this.element[4]); 
			this.element[5] = (y + this.element[5]); 
		},
		rotate: function(angle){ //angle in degre
			//
			
			// [ a , b, 0],
			// [ c , d, 0], 
			// [ h , m, 1],
			//multiply by a translation matrix
			//[ 0.707, 0.707, 0]
			//[ -0.707 , 0.707, 0]
			//[ 0 , 0, 1]
			
			
			//=
			// [ (a1) (b1) 0]
			// [ (c1) (d1) 0]
			// [ (h1) (m1) 1]
			//=
			//[0 1]
			//[2 3]
			//[4 5]
			var theta =   angle * (Math.PI / 180.0);
			// console.debug("theta  "+ theta);
			var a1 = Math.cos(theta); //this.element[0];  //0.707;
			var b1 = Math.sin(theta); //this.element[1];//.707;
			var c1 = -b1;//Math.sin(theta);//this.element[2];//-0.707;
			var d1 = a1; //Math.cos(theta);//this.element[3];//0.707;
			var h1 = 0; //this.element[4];//0;// 0.707;
			var m1 = 0; //this.element[5];//;// .707;
			// var a1 = 0.707;
			
			var d = this.element.concat();
			this.element[0] = d[0]*a1 + d[1]*c1;
			this.element[1] = d[0]*b1 + d[1]*d1;
			
			this.element[2] = d[2]*a1 + d[3]*c1;
			this.element[3] = d[2]*b1 + d[3]*d1;
			
			
			this.element[4] = d[4]*a1 + d[5]*c1 + h1;
			this.element[5] = d[4]*b1 + d[5]*d1 + m1;
			
			// this.element[0] = d[0]*a1 + d[1]*c1;
			// this.element[0] = d[0]*a1 + d[1]*c1;
			// this.element[0] = d[0]*a1 + d[1]*c1;
			// this.element[0] = d[0]*a1 + d[1]*c1;
			// this.element[2] *= ex; 
			// this.element[4] *= ex;
			
			// this.element[1] *= ey; 
			// this.element[3] *= ey; 
			// this.element[5] *= ey; 
			
			
			// console.error("not implement");
		},
		rotateAt : function(angle, x, y){
			
		},
		transform: function(tab){
			this.copytransform( tab);
		},
		copytransform: function(tab){
			for(var i = 0; i< 6; i++){
				this.element[i] = tab[i];
 			}
		},
		multiply: function(matrix, append){ // multiply matrix object			
			this.mult(matrix.element, append);			
		},
		mult: function(element, append){
			var gt = element.concat();
			var n = this.element.concat();
			append = typeof(append) == 'undefined'? 1 : append;
			
			//mult append 
			if(!append==1){
				//prepen
				var s = n;
				n = gt;
				gt = s;
			}
			
			//mult matrix
			var tab = [];
            var k = 0;
            var  offsetx = 0;
            var  offsety = 0;
            var  v_som = 0;
            for (var k = 0; k < 4;)
            {
                for (var  i = 0; i < 2; i++)
                {//columns
                    v_som = 0.0;
                    for (var  j = 0; j < 2; j++)
                    {
                        offsety = (2 * j) + i;//calculate column index
                        v_som += gt[offsetx + j] * n[offsety];
                    }
                    this.element[k] = v_som;
                    k++;
                }
                offsetx +=2;
            }
            this.element[4] += element[4];			
            this.element[5] += element[5];
		 
		},
		toString: function(){
			return "Matrix2D["+this.element+"]";
		}		
	});
	
	igk.winui.cancasEditor.Matrix = Matrix;
	
	
	
	var ELEM = igk.system.createNS("igk.winui.cancasEditor.DrawingElements", {
		drawing2D: function(){// default drawing 2D element base
			if (this==window){
				throw ("must be an instance");
			}
			drawingLayeredObject.apply(this);
			//default element property
			this.fill = "#fff";
			this.stroke = "#000";	
			this.strokeWidth = 1;
			var _opts = {}; //internal options
			var matrix = new _NS.Matrix();
			var _visible = !0;
			var fillMode = ELEM.fillMode.evenodd;
			igk.defineProperty(this, "fillMode", {get: function(){
				return fillMode;
			},set: function(v){
				if (v in ELEM.fillMode){
					fillMode = v;
				}
			}});
	

			igk.defineProperty(this, "matrix", {get: function(){
				return matrix;
			}});
			
			igk.defineProperty(this, "visible", {get: function(){
				return _visible;
			}, set: function(v){
				if (typeof(v)=='boolean'){
					visible = v;
				}
			}});
			
			igk.defineProperty(this, "previous", {get: function(){
				return _opts["_prev"];
			}, set: function(v){
					_opts["_prev"]= v;
			}});
			
			
			
			igk.defineProperty(this, "next", {get: function(){
				return _opts["_nxt"];
			}, set: function(v){
					_opts["_nxt"]= v;
			}});
			
			this.updateTransformElement = function(){
				matrix.reset();
				this.initialize();
			};
			this.buildPath = function(path){
				//override this method to build next
			};
		},
		drawing2DContainer : function(){
			if (this==window){
				throw ("must be an instance");
			}
			drawingLayeredObject.apply(this);
			var m_elements = [];
			var m_transform = new Matrix();
			
			igk.defineProperty(this, "Elements", {get:function(){return m_elements; }});
			igk.defineProperty(this, "transform", {get:function(){return m_transform; }});
			
			
			this.clear = function(){ m_elements = []; };
			this.getElementCounts= function(){ return m_elements.length; };
			this.select=  function(x, y, a){
				var items = [];
				var r = m_elements.root;
				while(r){
					if (r.contains(x,y, a)){
						items.push(r);
					}
					r = r.next;
				}
				
				return items;
			};
		
			this.getElementById = function(id){
				for(var i = 0; i < m_elements.length; i++){
					if (m_elements[i].id == id){
						return m_elements[i];
					}					
				}
				return null;
			}
		},
		fillMode: {
			evenodd:'evenodd',
			nonzero:'nonzero'
		}
	});
	//element prototype
	igk.appendProperties(ELEM.drawing2D.prototype, {
		initialize: function(){}
	});
	function _getPrevious(root, cibling){
		var q = null;
		var p = root;
		while (p && (p!==cibling)){
			q = p;
			p = p.next;
		}
		return q;
	};
	//container prototype 
	igk.appendProperties(ELEM.drawing2DContainer.prototype, {
		add: function(i){
			if (i["@container"] == this){
				return this;
			}
			
			
			var e = this.Elements;
			e.push(i);
			if (e.item)
			{
				i.next = e.item.next; 
				e.item.next = i;
			}else {
				i.next = null;
				e.root = i;
				
			}
			e.item = i;
			i["@container"] = this;
			i["@index"] = e.length-1; //this;
		},
		moveOver:function(e){
			if (e['@container'] != this){
				console.error('failed to move');
				return;
			}
			return ELEM.drawing2DContainer.MoveOver(this.Elements, e);
		},
		moveTopOver:function(e){
			if (e['@container'] != this){
				console.error('failed to move');
				return;
			}
			return ELEM.drawing2DContainer.MoveTopOver(this.Elements, e);
		},
		moveBelow:function(e){
			if (e['@container'] != this){
				console.error('failed to move');
				return;
			}
			return ELEM.drawing2DContainer.MoveBelow(this.Elements, e);
		},
		moveBottomBelow:function(e){
			if (e['@container'] != this){
				console.error('failed to move');
				return;
			}
			return ELEM.drawing2DContainer.MoveBottomBelow(this.Elements, e);
		},
		remove: function(i,a){
			var e = this.Elements;
			var rm = 0;
			var sidex = 0;
			if (i== e.root){
				e.root = e.root.next;
				rm=1;
				e.length--;
			}else{
				//determine if element is present on the chain
				var q = e.root;
				var s = 0;
				while(q){
					s = q.next;
					if (s==i){
						q.next = s.next;
						rm=1;
						break;
					}
					q = s;
				}
			}
			if (rm){
				if (e.root==null){
					e.length = 0;
					e.item = null;
				}else{
					if (i==e.item){
						e.item = q;
					}
					e.length = 0;
					q = e.root;
					while(q){
						e.push(q);
						q = q.next;
					}
				
				}
			}
		},
		render: function(a){ // render all child element
			var _elements = this.Elements;		
			a.save();
			if (_elements){
				var _q = _elements.root;
				while(_q){
					_q.render(a);
					_q = _q.next;
				}
				// for(var i = 0; i < _elements.Length; i++){
					// _elements[i].render(a);
				// } 
			
			}
			a.restore();
		
		}
	});
	
	
	ELEM.drawing2DContainer.MoveOver = function(se, e){	
			if (!e.next || (se.indexOf(e)==-1))
				return !1;
			var A = e.previous || _getPrevious(se.root, e);
			var B = e;
			var C = e.next;
			var D = C.next;
			
			e.next = D;
			C.previous = A;
			C.next = e;
			if(A)
				A.next = C;
			e.previous = C;
			if(D)
				D.previous = e;
			
			if (e===se.root){
				se.root = e.previous;
			}
			// b.previous = e.previous || _getPrevious(se.root, e);
			return !0;
			
	};
	ELEM.drawing2DContainer.MoveBelow = function(se, e){	
		if (e===se.root)
			return !1;
		var p = e.previous || _getPrevious(se.root, e);
		return ELEM.drawing2DContainer.MoveOver(se, p);	
	};
	ELEM.drawing2DContainer.MoveTopOver = function(se, e){
			if (!se.root || !e.next)
				return !1;
			var p = e.previous || _getPrevious(se.root, e);
			var B = e.next;
			B.previous = p;
			if (p){
				p.next = B;
			}
			
			
			if (se.root === e){
				se.root = e.next;
			}
			
			
			var q =e.next;
			while(q && q.next){
				q = q.next;
			}
			
			if (q)
				q.next = e;
			e.previous = q;
			e.next = null;
			
			return !0;
	};
	
	ELEM.drawing2DContainer.MoveBottomBelow = function(se, e){
		if((se.indexOf(e)==-1) || (e=== se.root))
			return !1;
		var p = e.previous || _getPrevious(se.root, e);
		
		if (p){
		p.next = e.next;
		if (e.next)
			e.next.previous = p;
		}
		se.root.previous = e;
		e.next = se.root;
		e.previous = null;
		se.root = e;		
		return !0;
	};
	
	var IsArray =_NS.Utils.IsArray;
	var CoreMathOperation =_NS.CoreMathOperation;
	
	
	//init basic element
	
	//rectangle
	igk.system.createClass(ELEM, {name:"rectangle", parent: ELEM.drawing2D},  function(){
			// ELEM.drawing2D.apply(this);
			var bound; 
			var strokeWidth = 1;
			bound = {x:0, y:0, width: 100, height: 100};	// or array		
			
			igk.prependChain(this, "updateTransformElement", function(){				
				bound = CoreMathOperation.TransformBound(bound, this.matrix);				
				this.matrix.reset();
			});
			// this.exports = [{name:'bound', serializer: SERI.boundSerializer }];
			igk.defineProperty(this, "bound", {
				get: function(){return bound; },
				set: function(v){ 
					if (!v)
						return;
					bound = v; 
				}
			});
		 
			igk.defineProperty(this, "strokeWidth", {
					get: function(){return strokeWidth; },
				set: function(v){ 
					if (!v)
						return;
					strokeWidth = v; 
				}
			});
			
			this.contains = function(x, y, a){
				if ('path' in this){
					var p = this.path;
					a.save();
					a.setTransform(this.matrix);
					var v = a.isPointInPath(p, x, y);
					a.restore();
					return v;
				}
				
				var b = this.bound;
				if (!b)
					return !1;
				var m = this.matrix;
				if (m && !m.isIdentity()){
					a.save();
					var path = new Path2D();
					
					a.setTransform(m);
					path.rect(b.x, b.y, b.width, b.height);
					var c = a.isPointInPath(path, x, y);					
					a.restore();
					return c;
				}
				
				return ((x >= b.x) && (x <= (b.x+b.width))) && 
					((y>= b.y) && (y<=(b.y+b.height)));
			};
			
			this.render = function(o){
				o.save();				
				o.fill = this.fill;
				o.stroke = this.stroke;
				o.strokeWidth = strokeWidth;
				
				o.setTransform(this.matrix);
				if (IsArray(bound)){
					var p =new Path2D();
					var c = 0;
					for(var i = 0; i < bound.length; i ++){
						c = bound[i];
						p.rect(c.x, c.y , c.width, c.height);
					}
					
					o.fillPath(p, ELEM.fillMode.evenodd);
					o.drawPath(p, ELEM.fillMode.evenodd);	
					
				}else{				
					o.fillRect(bound.x, bound.y , bound.width, bound.height);
					o.drawRect(bound.x, bound.y , bound.width, bound.height);
				}
				o.restore();
			};
	});
		
	
	
	
	//export properties model
	function elementExport(){
		var t = ["id"];
		return t;
	}
	function getStrokeAndFillExport(){
		return 	[
		{name:"stroke", "default":"#000"},
		{name:"strokeWidth", "default":1}, 
		{name:"fill", "default":"#fff"}
		];
	};
	function getMatrixExport(){
		return 	[
		{name:"matrix", "default":null, serializer: function(v){
			if(v.isIdentity())
				return null;
			var d =  "";
			var g = v.element;
			for(var i = 0; i< g.length; i++){
				if(i>0)
					d+=" ";
				d+= Math.ceil(g[i], 2);
			}
			return d;
		}, resolv: function(item, v, n){
			var g = v.split(' ');
			var j = 0;
			var t = item.matrix.element;
			for(var i = 0; i< g.length && (j < 6); i++){
				if (g[i].trim()=="")
					continue;
				t[j] = parseFloat(g[i], 2);
				j++;
			}
		}}
		];
	};
	var EXPORTS = igk.system.createNS("igk.winui.cancasEditor.Exports", {	
		rectangle: function(){
			var t = elementExport();
			t  = t.concat(getStrokeAndFillExport()).concat([
			{name:'bound', serializer: SERI.boundSerializer, unserialize : SERI.boundUnserializer},			
			]).concat(getMatrixExport());
			return t;
		},
		circle: function(){
			var t = elementExport().concat(getStrokeAndFillExport()).concat([
			{name:'center', serializer: SERI.vector2Serializer , unserialize : SERI.vector2Unserializer},			
			{name:'radius', serializer: SERI.radiusSerializer,  unserialize : SERI.radiusUnSerializer},
			{name:'fillMode', 'default':ELEM.fillMode.evenodd}			
			]).concat(getMatrixExport());
			return t;
		},
		getExports: function(n){
			if (!EXPORTS.__data__)
				EXPORTS.__data__ = {};
			if (n in EXPORTS.__data__){
				return EXPORTS.__data__[n];
			}
			if (n in EXPORTS){
				EXPORTS.__data__[n] =  EXPORTS[n].apply();
				return EXPORTS.__data__[n];
			}
			return null;
		},
		initExport: elementExport,
		matrixExport: getMatrixExport,
		initItemApp: function(a, b){ // default initialize application mecanism
			if ('oninitApp' in b){
				b.oninitApp(a);
				return;
			}
			var nn = b.getType(); 
			switch(nn){
				case 'document':
					a.document = document;
				break;
				case 'layer':
					//console.debug("update layer");
					a.layer = b;
					break;
				default:
					
					break;
			}
		},
		getStrokeAndFillExport : getStrokeAndFillExport,
		register: function(n, t){			
			if (n in EXPORTS){
				return !1;
			}
			EXPORTS[n] = t;
			return 1;
		}
		
	}); // store export item properties
	
	
	
})();

//---------------------------------------------------------------------------
// ACTIONS
//---------------------------------------------------------------------------
(function(){
	
	var actions = {};
	var shortcut = {};
	var editor = null;
	var menuActions = {};
	var m_openExtensions = [];
	var editorMenu = [];
	
	function getOpenExtension(){
		var s = "";
		var a = 0;
		var E =_NS.encoder;
		for(var i in E){
			if (typeof(E[i].decode) != 'function')
				continue;
			if(a)
				s+=",";
			s+="."+i;
			a = 1;
		}
		return s+",.jpeg, .jpg, .png, .svg"; 
	};
	
	function regOpenExtension(extension){
		m_openExtension.push(extension);
	};
	

	
	//menu item object
	// @n: name of the menu
	// @li: cibling node
	// @editor: application used to initialize the editor
	// @c: callback to call on click
	// @nodes: list of names[key, node]
	function menuItem(n, li, editor, c, nodes){
		var editorMenuIndex = editorMenu.indexOf(editor);
		var menuKey = '';
		if (editorMenuIndex ==-1){
			
			editorMenu.push(editor);
			editorMenuIndex = editorMenu.length - 1;
			menuKey = "menu"+editorMenuIndex;
			editorMenu[menuKey]	= {};
		}else{
			menuKey = "menu"+editorMenuIndex;
		}
		this.name = n;
		this.editor = editor;
		this.callback = c;
		var self = this;
		var R =_NS.R;
		
		this.action = menuActions[n];
		
		// var MENUACTION = regMenuAction
		
		this.click = function(e){ 
		if (e.type == "touchend"){
			var selected = editorMenu[menuKey].selectedLi;
			if (selected== li)
				return;
			if (selected)
				selected.rmClass("igk-show");
			if (!li.supportClass("igk-show")){
				// console.debug("add class");
				li.addClass("igk-show");
				editorMenu[menuKey].selectedLi = li;
			}
			// console.debug("support child ?"+self.name+" "+ (nodes[self.name].ul==0));
			
		}
			// console.debug(self.name);
			// InvokeAction(self.name, self
			e.preventDefault();
			e.stopPropagation();
			
			
			var tab =_NS.Actions.getMenuActions();
			var _invoke = 1;
			if (self.name in tab){
				var fc = tab[self.name];
				if ('@menuHost' in  fc){
					if (!fc['@menuHost'].enable){
						_invoke = 0;
					}
				}
				if (fc){
					if(typeof(fc) != 'function'){
						fc = fc.callback || null;
					}
				}
				
				if (_invoke){
					if (fc)
						fc.apply(self.editor, [self.editor, self]);
					
					var sub = $igk(this).select("^.submenu").first();
					if (sub){
						// console.debug("subparent found");
						sub.addClass("igk-hide").timeOut(500, function(){
							sub.rmClass("igk-hide");
						});
					}
					if (self.callback){
						self.callback.apply(this);
					};
				
				
				}
			}
		
		};
		// set text of menu item
		li.add("a").on("touchOrClick", this.click).selectable(false).setHtml( R[n] || n);
		
		
	};

	var _lastkey = 0;
	var AC = igk.system.createNS("igk.winui.cancasEditor.Actions", {
			menuItem : menuItem,
			defDebugAction: function(func, initialize, prop){
				var idx = -1;
				if(_lastkey){
					idx = menuActions[_lastkey].index + 1;
				}
				
				var e =  {
					index: idx,
					callback: func,
					initialize: initialize || function(a){
						return !0 && a.settings.isDebug;
				}};
				if(prop){
					igk.appendProperties(e, prop);
				}
				
				return e;
				
			},
			regActions: function(key, name,  func){//register shortcut action
				actions[name] = func;
				shortcut[key] = name;
			},
			regMenuAction: function(key, func){
				//register menu action
				//@identifier key string
				//@func mixed* callback or object with
				// -callback : the function callback
				// -initialize: initialize the menu for must return true if menu is available an visible
				// 
				menuActions[key] = func;
				_lastkey = key;
			},
			bindEditor: function(e){
				editor = e;
			},
			getMenuActions: function(filter){
				if (filter){
					var tab = {};
					var n = 0;
					var gex = new RegExp("[ ,]*"+filter+"[ ,]*");
					for(var i in menuActions){
						n = menuActions[i];
						if (n.filter && gex.test(n.filter)){
							tab[i] = n;
						}
					}
					return tab;
				}
				return menuActions;
			},
			invoke: function(n){
				if (n in actions){
					var d = {handle:1, name:n};
					actions[n].apply(null, [editor, d]);
				}
			},
			initMenuList: initMenuList,
			sortMenu: sortMenu
	});

	//  
	// initialize menu items 
	// @items : items list to initialize
	// @ul : root node used to initialize the menu
	// @editor: application that request the menu
	// @menuItem : class use to init menuitem
	// @callback : callback to call menu
	function initMenuList(items, ul, nodes, editor,  menuItem, callback){
			var p = ul;
			nodes = nodes || {};
			var n = 0;
			var tn = 0;
			var li=0; //li
			var item = 0;
			var sn = 0;
			var R = igk.system.createNS(_NS.getType().getFullName()+".R",{});
			
		//console.debug(items);
		//var tabindex = 201;
		var action = 0;
		var menuhost = 0; //menu host service
		var init_callback = [];
		for(var i = 0; i < items.length; i++){
			menuhost = 0;
			n = items[i];
			action = menuActions[n] || 0;
			
			// if (n == "file.export.toXml"){
				
			// }
			
			if (n in nodes){
				console.debug(n + " menuItem is already registered");
				continue;
			};
			
			
			
			
			if ('initialize' in action){
				if (!action["@menuHost"]){
				menuhost = new MenuHost(n);				
				if (!action.initialize(editor, n, menuhost))
				{
					continue;
				}
				action["@menuHost"] = menuhost;
				if (menuhost.initialize)
					init_callback.push(menuhost.initialize);
				}
			}
			
			tn = n.split(".");								
			if (tn.length == 1){
				p = ul;
			}else{
				sn = "";
				for(var j = 0; j < tn.length-1; j++){
					if (j>0)
						sn += ".";
					sn += tn[j];
					if (sn in nodes){
						if (!nodes[sn].ul){
							nodes[sn].ul = nodes[sn].li.add("ul").addClass("submenu sub_"+(j+1));
							//console.debug("register click for : "+sn);
							//nodes[sn].li.on("touchOrClick", menuClickEventHandler(nodes[sn].li, sn, nodes));
						}
						p = nodes[sn].ul;
					}else{
					
						if (!p){
							if (j == 0){
							
								li = ul.add("li");
								item = new menuItem(sn,li,  editor, callback, nodes);
							}
							
							console.debug("failed "+sn);
							continue;
						}else{
							li = p.add("li");
							item = new menuItem(sn, li, editor, callback, nodes);
							// li.add("a").on("click", item.click).setHtml(R[sn] || sn);
							nodes[sn] = {li:li, ul:0};
							p = li.add("ul").addClass("submenu sub_"+(j+1));
							nodes[sn] = {li:li, ul: p};
						}
						// console.debug("not define "+sn);
						// continue;
					}
				}
			}
			if (action && action.separatorBefore){
				li = p.add("li");	
				li.add("span").addClass("hr before").add("hr");
			}
			li = p.add("li");
			
			
			// console.debug(action.type);
			if (action.type)
			li.addClass(action.type);
		
			nodes[items[i]] = {li:li, ul:0};
			item = new menuItem(n, li, editor, callback, nodes);		
			
			if (menuhost){
				menuhost.li = li;
				menuhost.menuItem =item;
			}
			
			
			if (action && action.separatorAfter){
				li = p.add("li");	
				li.add("span").addClass("hr after").add("hr");
			}
			
		}

		// li position absolute
		// ul.select(".submenu").each_all(function(){
			// // console.debug("submenu ");
			// //manage submenu presentation
			// console.debug("offsetheight : "+this.o.offsetHeight);
			// this.setCss({
				// // overflow:'hidden',
				// // overflowY:'auto',
				// // overflowX:'hide',
				// border:'1px solid black',
				// maxHeight:'200px'
			// });
			
		// });
		if (init_callback.length>0){
			setTimeout(__loadingComplete(init_callback), 500);
		}
	};
	function __loadingComplete(init_callback){
		return function (){
			for(var i = 0; i < init_callback.length; i++){
				init_callback[i].call();
			}
		};
	}
	function MenuHost(n){
		var _v=1;//visible = 1;
		var _e=1;//enable = 1;
		igk.defineProperty(this, 'visible', {
			get:function(){
				return _v;
			},set:function(v){
				_v = v;
				if (!v)
					this.li.addClass('igk-hide');
				else	
					this.li.rmClass('igk-hide')
			}
		});
		igk.defineProperty(this, 'enable', {
			get:function(){
				return _v;
			},set:function(v){
				_v = v;
				if (!v)
					this.li.addClass('igk-disable');
				else	
					this.li.rmClass('igk-disable')
			}
		});
		
	};
		
		
	function sortMenu(tab){
		return function (a,b){
			var idx = 0;
			var idy = 0;
			var lna = a.split('.').length;
			var lnb = b.split('.').length;
			if (lna == lnb){
					
				idx = ((a in tab)? tab[a].index : null) || 0;
				idy = ((b in tab)? tab[b].index : null) || 0; //tab[b].index || 0;
				
				//if (a == "layer"){
					//console.debug("compared ::::"+b+ " "+idy);
				//}
				//
				if (idx == idy){
						return a.localeCompare(b);
					}
					if (idx < idy)
						return -1;
					return 1;
				
				
			}else {
				if (lna<lnb){
					return -1;
				}else{
					return 1;
				}
			}
			// console.debug(a);
			return a.localeCompare(b);
		};
	};
	
	
	function __getkey(e){
		// for key press and key up
		var v = 0;
		var c = e.keyCode;
		if (e.shiftKey || (e.key=='Shift')){
			v |= Key.Shift;
			// c =c & ~16;
		}
		if (e.ctrlKey || (e.key == 'Control')){
			v |= Key.Ctrl;
			// c = c & ~17;
		}
		if (e.altKey || (e.key =='Alt')){
			v |= Key.Alt;
			// c = c & ~18;
		}
		v |=  c;
		return v;
	};
	
	var handle_action =  0;
	
	$igk(document).on("keyup", function(e){
		//console.debug(e.type);		
		// e.shiftKey 
		// SHIFT | DELETE | 13
		if (handle_action){ // handle action from keyDown to keyUp
			
			var c = handle_action;
			// var d = {handle:1, name:c};
			if (c.name in actions){
				c.target = c.target || e.target;
				c.handle = 1;
				actions[c.name].apply(null, [editor, c]);
				if (c.handle){
					e.preventDefault();
					e.stopPropagation();
				}
			}else{
				editor.sendMessage("no action found for "+c.name);
			}
			handle_action = 0;
			return;
		}
		
		var v = __getkey(e);
		
		// console.debug("check if in shortcut ? "+v + " : "+( v in shortcut));
		if (v in shortcut){
			
			var c = shortcut[v];
			var d = {handle:1, name:c, shortcut:v, target:e.target};
			actions[c].apply(null, [editor, d]);

			if (d.handle){
				e.preventDefault();
				e.stopPropagation();
			}
		}
		
	}).on("keydown", function(e){
		//stop key handle if is registrated on shortcut
	
		var v = __getkey(e);
		if (v in shortcut){
			
			handle_action = {name:shortcut[v], key:v, target:e.target};			
			// e.preventDefault();
			// e.stopPropagation();
		}else{
			handle_action = 0;
		}
		
	});
	
	
	var Key  = {
		None: 0x0,
		Shift : 0x00F10000,
		Ctrl:   0x00F20000,
		Alt: 0x00F40000		
	};
	//letter
	for(var i = 0; i < 26; i++){
		Key[String.fromCharCode(65+i)] = 65+i; 
	}
	//numpad keys
	Key["Mult"] =  106;//"*".charCodeAt(0);
	Key["Plus"] = 107;//"+".charCodeAt(0);
	Key["Minus"] = 109;//"-".charCodeAt(0);
	Key["Dot"] = 110;//"/".charCodeAt(0);
	Key["Div"] = 111;//"/".charCodeAt(0);
	Key["NumLock"] = 140; //"/".charCodeA111111);
	for(var i = 0; i < 10; i++){
		Key["NumPad"+i] = 96 +i;
	}
	Key["Backspace"] = 8;
	Key["Enter"] = 13;
	Key["Escape"] = 27;
	//direction
	Key["Left"] = 37;
	Key["Up"] = 38;
	Key["Right"] = 39;
	Key["Down"] = 40;	
	Key["Delete"]=46;
	

	Key.IsNumber = function(v){ // is number key board
		return (v >=96) && (v<=105);
	};
	Key.IsControl = function(v){// is control keyboard
		return v < 48;
	};
	Key.IsModifier=function(v){ //value is modifier
		return ((Key.Ctrl & v) == Key.Ctrl) ||
		((Key.Alt & v) == Key.Alt) ||
		((Key.Shift & v) == Key.Shift);
	};
	Key.IsControlModifier=function(v){
		return (v & Key.Ctrl) == Key.Ctrl;
	};
	
	
	
	igk.defineProperty(igk.winui.cancasEditor.Actions, "Key", {get: function(){ return Key; }});
	igk.winui.cancasEditor.Actions.getKeyFromEvent = __getkey;
	
	AC.regActions(Key.Ctrl | Key.C, "editor.copy", function(a,e){
		if (e.target && e.target.tagName && (e.target.tagName.toLowerCase() == "input")){
			e.handle =0;
			return;
		}
		// console.debug("editor copy ");
		// console.debug(e.target);
	});
	AC.regActions(Key.Ctrl | Key.V, "editor.paste", function(a,e){
		if (e.target && e.target.tagName && (e.target.tagName.toLowerCase() == "input")){
			e.handle =0;
			return;
		}
		// console.debug("editor paste ");
		// console.debug(e.target);
		// console.debug(e);
		// e.handle = 0;
		// console.debug("editor paste");
		
		// alert("paste");
	});
	
	AC.regActions(Key.Ctrl | Key.A, "editor.selectall",  function(a, e){
		alert("select all ");
	});
	
	AC.regActions(Key.Ctrl | Key.A, "editor.deleteall",  function(a, e){
		a.clear();
		a.refresh();
	});
	
	
	AC.regActions(Key.Shift | Key.Delete, "editor.clear",  function(a){
		a.clear();
		a.refresh();
	});
	
	
	//element tool shortcut
	
	
	
	AC.regActions(Key.Alt | Key.Shift  | Key.R, "editor.selectool.rectangle",  function(a){			
		a.tool = new _NS.Tools.RectangleMecanism();
	});
	AC.regActions(Key.Alt | Key.Shift  | Key.P, "editor.selectool.polygon",  function(a){			
		a.tool = new _NS.Tools.PolygonMecanism();
	});
	
	// console.debug("out : "+(Key.Alt | Key.Shift  | Key.C));
	

	
	AC.regMenuAction("file", {index:-10});
	AC.regMenuAction("edit", {index:1});
	AC.regMenuAction("view", {index:2});
	AC.regMenuAction("tools", {index:3});
	AC.regMenuAction("settings", {index:4});
	AC.regMenuAction("window", {index:5});
	AC.regMenuAction("document", {index:10});
	AC.regMenuAction("layer", {index:20});
	AC.regMenuAction("help", {index:1000});
	AC.regMenuAction("file.export", {index: 100});
	
	AC.regMenuAction("file.export.toXml", {callback:function(a){
		a.saveToXML();
	}, index:10});
	AC.regMenuAction("file.export.toSvg", {callback: function(a){
		a.exportTo("svg");
	}, index:20});
	
	if (window.FileReader){
	AC.regMenuAction("file.import", { callback: function(a){
		var s = getOpenExtension();
		igk.system.io.pickfile(null, {
			"accept": s,
			"complete": function(file){
				if (file){
					// console.debug("try to open"+file.name);
					// console.debug(file);
					// console.debug(file.name);
					
					if (!FileReader){
						//console.debug("no File Reader");
						return ;
					}
					
					var fr = new FileReader();
					fr.onload= function(e){
						var img = igk.createNode("img");						
						a.addAsset(img);
						img.o.onload = function(){
							var b = a.createElement("image");
					
							b.src = img.o;
							if (a.document){
								var l = a.createElement("layer");
								l.add(b);
								a.add(l);
								l.setDocument(a.document);
								a.layer = l;
							}else{
							
								if (a.layer){
									a.layer.add(b);
								}else{
									a.addImageDocument(b);
								}
							}
							a.refresh();
						};
						img.o.src = e.target.result;
						
					};
					
					fr.readAsDataURL(file);
				}
			}
		});
	}, index:-15});
	
	
	AC.regMenuAction("file.open", { callback: function(a){
		var s = getOpenExtension();
		if (s)
			s = ","+s;
		igk.system.io.pickfile(null, {
			"accept":".xml,.svg,.gkds,.mp4"+s,
			"complete": function(file){
				if (file){
					// console.debug("try to open"+file.name);
					// console.debug(file);
					// console.debug(file.name);
					
					
					var ext = igk.system.io.getExtension(file.name);
					// console.debug(ext);
					if (ext in _NS.encoder){
						igk.winui.cancasEditor.encoder[ext].decode(file, a).then(function(){
							a.title = file.name;
						}).error(function(){
							console.error("failed to open file : "+file.name);
						});
						return;
					}
					
					
					if (!FileReader){
						//console.debug("no File Reader");
						return ;
					}
					
					var fr = new FileReader();
					fr.onload= function(e){
						var img = igk.createNode("img");						
						a.addAsset(img);
						img.o.onload = function(){
							var b = a.createElement("image");
							b.src = img.o;	
							a.clear();							
							a.addImageDocument(b);
							a.resetFitAreaZoom();
							a.title = file.name;
							a.refresh();
						};
						img.o.src = e.target.result;
						
					};					
					fr.readAsDataURL(file);
				}
			}
		});
	}, index:-20});
	
	// file open must with file require that we click can't work by shortcut
	// AC.regActions(Key.Ctrl | Key.O, "editor.open", function(){
		// console.debug("invoke file open");
		// var d = igk.createNode("div");
		// d.on("click", function(){
			// console.debug("force click");
			// AC.invoke("file.open");
		// });
		
		
		// d.click();
		// console.debug("invoke file open");
	// });
	
	
	AC.regMenuAction("file.share", { callback: function(a){
		//export the current view
		var data = a.canvas.o.toDataURL('image/png');
		var uri = igk.system.io.baseUri()+"/share";
		igk.ajx.post(uri, data, null);
	}, index:50});
	
	
	AC.regMenuAction("file.share.copyDataURL", { callback: function(a){
		//export the current view
		var data = a.canvas.o.toDataURL('image/png');
		var i = igk.dom.body().add("input");
		i.setAttribute("type", "text");
		i.o.value = data;		
		i.o.select();
        document.execCommand('copy');
		i.remove();
		
	}, index:-10});
	
	
	AC.regMenuAction("file.new", { callback: function(a){
		document.body.focus();
		a.clear();
		var doc = a.add("document");
		var layer = a.createElement("layer");
		layer.setDocument(doc);
		
	
		a.document = doc;
		a.layer = layer;
		a.resetFitAreaZoom();
		a.refresh();
	}, index:-100});
	AC.regMenuAction("file.save", {
		index:-90,
		callback: function(a){
			_NS.gui.notify.Show(a, "filesave not implement");
		}
	});
	AC.regMenuAction("file.print", { 
	separatorBefore:1,
	separatorAfter:1,
	callback: 
	function(a){
		
		var frm = igk.createNode("iframe");
		var is_chrome = igk.navigator.isChrome();
		
		var canvas = igk.createNode("canvas");
		var ctx = canvas.o.getContext("2d");
		var W = (a.document? a.document.width:null)|| a.matrix.d.docWidth;
		var H = (a.document? a.document.height:null)|| a.matrix.d.docHeight;
		var _title	= (a.document? a.document.title :null) || 'CancasEditorProject';
			
		canvas.setCss({
			"display":"block", 
			"lineHeight":0,
			"width": W+"px",
			"height": H+"px"
		});
		//in chrome require canvas to be added to render propertly
		$igk(document.body).add(canvas);
		canvas.o.width = W;
		canvas.o.height = H;
		
		
		var o = new _NS.primitive(ctx);
		o.clearScene();
		o.context = "print";
		o.getDocumentSize = function(){
			return {
				w:W,
				h:H
			};
		};
		
		for(var i= 0; i < a.list.length; i++){
			a.list[i].render(o);
		}
	
	
	    var uri = canvas.o.toDataURL('image/png');
		
		
		frm.on("load", function(){
			var doc = frm.o.contentWindow.document;
			var dv = igk.createNode("div");
			
			// for firefox need to use document write
			
			// for chrome new for time out to allow picture
			
			dv.add("h1").setHtml(_title); //"cancasEditor - Project");
			dv.add("img").on("load", function(){
				// console.debug("ready image ready");
			}).setCss({
				"width":'100%',
				"height":'auto',
				"border":"1px solid black"
			}).setAttribute("src", uri)
			.setAttribute("width", W)
			.setAttribute("height", H);
			doc.body.append(dv.o);// = .write(dv.getHtml());			
		
		// chrome require element to be add
		if(is_chrome){
				doc.body.append(dv.o);
				setTimeout(function() {
					frm.o.contentWindow.print();			
					frm.remove();
					canvas.remove();
				}, 250);
		}
		else {
			doc.write(dv.getHtml());
			frm.o.contentWindow.print();			
			frm.remove();
			canvas.remove();
		}
		
		
		});
		//frm.o.src = uri;
		//frm.o.href = uri;
		
		igk.dom.body().add(frm);
		
		// document.body.focus();
		// a.clear();
		// var d = igk.createNode("canvas");
		// d.setHtml("document to print");
		// var ctx = d.o.getContext("2d");
		
		// var uri = d.o.toDataURL('image/png');
		// igk.winui.print(uri).then(function(wnd){
	
		// $igk(wnd).on("beforeprint", function(){
			// console.debug("before print");	
			// console.debug("bakj ");
			// wnd.document.body.onafterprint = function(){
				// console.debug("finist print");
				// wnd.close();
			// };
			// console.debug(wnd.document.body);
			// $igk(wnd.document.body).on("afterprint", function(){
				// console.debug("body after print");
				// wnd.close();
			// });
		// }).on("afterprint", function(){
			// console.debug("on after print");
			// wnd.close();
		// });
		// wnd.print();
		
		// });
		
	}, 
	index:20});
	
	if (document.referrer && (document.referrer != document.location)){
		AC.regMenuAction("file.quit", {
			separatorBefore:1,
			index: 0x0FFF,
			callback: function(a){
				var uri = document.referrer ;
				var _f = document.createElement("form");
				_f.action = uri;
				_f.method = "GET";
				document.body.appendChild(_f);
				_f.submit();
				// igk.navto(document.referrer);
				// document.location = document.referrer;
			}
		}); 
	}
	
	AC.regMenuAction("help.about", { callback: function(a){
		//show about dialog
		igk.ajx.get(igk.system.io.baseUri()+"/about");	 
	}, index:0});
	
	
	AC.regMenuAction("settings.packages", {callback:function(a){
		alert("search for php package extensions and install it on you canvas editor environment ");
	}});
	
	
	AC.regMenuAction("settings.plugins", {callback:function(a){
		alert("search for plugins JS plugins and install it on your environment canvas editor ");
	}});
	
	
	
	AC.regMenuAction("settings.settings", {callback:function(a){
		alert("configure your settings will come soon ");
		var GUI =_NS.gui;
		
		igk.ajx.get(a.setting.appUri+"/settings", null, function(){
			if(this.isReady()){
				var q = xhr.responseXML;
				
				dialog = GUI.dialog.showDialog(R.title_settings, q);
			}
		})
	}});
	
}


})();






//---------------------------------------------------------------
// update canvas definition for custom rendering
//---------------------------------------------------------------
(function(){
	var nodraw = 0;
	function customPathSegment(path){ 
		this.render = function(ctx, fillrule){
			nodraw = 1; 
			path.render(ctx, fillrule);
			nodraw = 0;
		};
	};
	function moveToSegment(x, y){
		this.render = function(ctx){
			ctx.moveTo(x, y);
		};
	};
	function lineToSegment(x, y){
		this.render = function(ctx){
			ctx.lineTo(x, y);
		}
	};
	function lineSegment(){
		this.startPoint = {x:0, y:0};
		this.endPoint = {x:0, y:0};
		
		this.render  = function(ctx){
			ctx.lineTo(
			this.startPoint.x,
			this.startPoint.y,
			this.endPoint.x,
			this.endPoint.y);
		};
	};
	function ellipseSegment(cx, cy, rx, ry,angle1, angle2, angle3){
		this.render  = function(ctx){
			//ry *= 2;
			// console.debug("render ellipse "+this.start);
			
			var PATH =_NS.Utils.Path;
			if (ctx.ellipse){
				// console.debug("render ......mmmmmmmmd");
				ctx.ellipse(cx, cy, rx, ry,angle1, angle2, angle3);
			}
			else{
				// ctx.moveTo(cx, cy+ry);
				// ctx.quadraticCurveTo(cx+rx, cy+ry, cx+rx,cy);
				// ctx.quadraticCurveTo(cx+rx, cy-ry, cx,cy-ry);
				// ctx.quadraticCurveTo(cx-rx, cy-ry, cx-rx,cy);
				// ctx.quadraticCurveTo(cx-rx, cy+ry, cx,cy+ry);
				// console.debug("render ......");
				PATH.renderEllipse(ctx, cx-rx, cy-ry, rx*2, ry*2);
			}
		};
	};
	function arcSegment(cx, cy, rx, ry,angle1, angle2, angle3){
		this.render  = function(ctx){
			ctx.arc(cx, cy, rx, ry,angle1, angle2, angle3);
		};
	};
	function arcToSegment(x1, y1, x2, y2, r){
		this.render  = function(ctx){
			ctx.arcTo(x1, y1, x2, y2, r);
		};
	};
	function bezierSegment(c1x, c1y, c2x, c2y, x, y){
		
		this.render  = function(ctx){
			ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
		};
		
	};
	function quadricSegment(c1x, c1y, x, y){
		
		this.render  = function(ctx){
			ctx.quadraticCurveTo(c1x, c1y, x, y);
		};
		
	};
	function rectSegment(x, y, w, h){
		this.render  = function(ctx){
			ctx.rect(x,y , w, h);
		};
	}; 
		
	if (!window.Path2D){
			
		
		window.Path2D = function(){
			this.pathContain = function(ctx, x, y, fillrule){
				nodraw = 1;
				this.render(ctx);
				nodraw = 0;
				return ctx.isPointInPath(x, y, fillrule);
			};
			igk.defineProperty(this, 'custom', {
				get: function(){
					return 1;
				}
			});
			igk.defineProperty(this, 'count', {
				get: function(){
					return segments.length;
				}
			});
			var segments = [];			
			igk.appendProperties(this, {
				render: function(ctx, fillrule, fill, stroke){ 
				if (!nodraw)
						ctx.beginPath(); //important because clear rect only consider graphics path
					
					var s = 0;
					for(var i = 0; i < segments.length; i++){ 
						//segments[i].child = 1;
						if (s){
							//start a new graphics
							s= 0;
							//
							segments[i].start = 1;
						}else{
							segments[i].start = 0;
						}
						segments[i].render(ctx, fillrule);
						if (segments[i].close){ 
							ctx.closePath();
							s = 1;
						}
					}
					if (!nodraw){
						// console.debug("fill rule : "+fillrule);
						ctx.fill(fillrule);
						ctx.stroke(fillrule);
					}
					
				},
				push: function(c){
					segments.push(c);
				},
				clear: function(c){
					segments = [];
				},
				closePath:function(){
					if (segments.length>0)
						segments[segments.length-1].close = 1;
				}
			});
		};
		//initialize path 2D object
		igk.appendProperties(Path2D.prototype, {
			moveTo: function(x, y){
				this.push(new moveToSegment(x,y));
			},
			arcTo: function(x1, y1, x2, y2, r){
				this.push(new arcToSegment(x1, y1, x2, y2, r));
			},
			lineTo: function(x, y){
				this.push(new lineToSegment(x,y));
			},
			bezierCurveTo: function(c1x, c1y, c2x, c2y, x, y){
				this.push(new bezierSegment(c1x, c1y, c2x, c2y, x, y));
			},
			quadraticCurveTo: function(c1x, c1y, x, y){
				this.push(new quadricSegment(c1x, c1y, x, y));
			},
			arc:function(cx, cy, rx, ry,angle1, angle2, angle3){
				this.push(new arcSegment(cx, cy, rx, ry,angle1, angle2, angle3)); 
			},
			
			ellipse: function(cx, cy, rx, ry,angle1, angle2, angle3){
				this.push(new ellipseSegment(cx, cy, rx, ry,angle1, angle2, angle3)); 
			},
			rect: function(x,y,w,h){				
				this.push(new rectSegment(x,y,w,h)); 
			}
			
		});
	}
	//for edge support
	if (!Path2D.prototype.addPath){
		//console.debug("add path failed ... IE");
		Path2D.prototype.addPath = function(path){
			
			if (this.custom){ 
				this.push(new customPathSegment(path));
				return;
			}
			var n = "pathlist";
			if (!this[n])
				this[n] = [];				
			this[n].push(path);
		};
	}
	//for oldf firefox 
	if (!Path2D.prototype.ellipse){//custom ellipse base
		Path2D.prototype.ellipse = function(cx, cy, rx, ry,angle1, angle2, angle3){
			var PATH =_NS.Utils.Path;
			PATH.renderEllipse(this, cx-rx, cy-ry, rx*2, ry*2);
		};
	};
	
	
})();


})();