// desc: export as svg visitor


"use strict";



(function(){
	var _NS = igk.winui.cancasEditor;
	
	function svgDefPoint(pts){
		var s = "";
		for( var i = 0; i < pts.length ; i++){
			if (i>0)
				s+=" ";
			s+=Math.ceil(pts[i].x, 2)+","+Math.ceil(pts[i].y,2);
		}
		return s;
		
	};
	function svgbindSetting(p){
		
		p.setAttribute("id", this.id);
		if ('stroke' in this){
			p.setAttribute("stroke", this.stroke);
		}
		if ('fill' in this){
			p.setAttribute("fill", this.fill);
		}		
		if ('strokeWidth' in this){
			p.setAttribute("stroke-width", this.strokeWidth);
		}
		if ('matrix' in this){
			var mat = this.matrix;
			if (!mat.isIdentity()){
				p.setAttribute("transform", getMatrixDefinition(mat));
			}
		}
		// console.debug(this);

	};
	function getMatrixDefinition(m){
		return "matrix("+ m.element.join(" ")+")";
	};
	
	function segmentToSvgString(segments){
		var s = "";
		segments.each_all(function(){
				s+= this.getDef(ms==0);
				ms=1;
		});
		return s;
	};

	function SegmentRenderingVisitor(){
		//console debug new segment rendering
		var m_def = '';
		var m_dx = null;
		function __d(){
			//recuperation du context de visit
			if (!m_dx)
				m_dx= new  _NS.drawing2d.segments.drawingContext();
			return m_dx;
		};

		igk.appendProperties(this, {
			getDef:function(){
				var s = m_def || '';
				if (m_dx){
					s += m_dx.getDef();
				}
				return s;
			},
			clearDef:function(){
				m_def ='';
				m_dx = null;
			},
			save:function(){

			},
			restore:function(){

			},
			setTransform:function(m){
				if (_NS.Utils.IsArray(m)){

				}
			},
			drawRect:function(x,y,w,h){ 
				var dx = new  _NS.drawing2d.segments.drawingContext();
				dx.moveTo(x,y);
				dx.lineTo(x+w, y);
				dx.lineTo(x+w, y+h);
				dx.lineTo(x, y+h);
				dx.close();				
			},
			fillPath:function(path){

			},
			drawPath:function(path){
				console.debug('draw path');
			},
			fillRect:function(x,y,w,h){
				//console.debug("fill rect");
			},
			moveTo: function(x, y){ 
				__d().moveTo(x,y);
			},
			arcTo: function(x1,y2,x2,y3, radius){
				__d().arcTo(x1,y2,x2,y3, radius);
			},
			bezierCurveTo: function(cx1, cy1, cx2,cy2, x, y){
				__d().bezierCurveTo(cx1, cy1, cx2,cy2, x, y);
			},
			lineTo: function(x,y){
				__d().lineTo(x, y);
			},
			closePath: function(){
				if(m_dx){
					m_dx.close =1;
					m_def+= m_dx.getDef();
					m_def = null;
				}
			}



		});
	};
	

	// igk.system.createNS("demo", {
		// segmentRendering: function(){
			// var def , rc = new igk.winui.cancasEditor.DrawingElements.rectangle ();
			// rc.bound = {x:10, y:10, width:100, height: 50};
			// def = new SegmentRenderingVisitor();
			// rc.render(def);
			// console.debug("rectangle: "+def.getDef());

			// def.clearDef();
			// rc = new igk.winui.cancasEditor.DrawingElements.roundrect();
			// rc.bound = {x:10, y:10, width:100, height: 50};
			// rc.initialize();
			
			// rc.buildPath(def);
			// console.debug("roundrect : "+ def.getDef());

		// }
	// });

	// igk.ready(function(){
		// demo.segmentRendering();
	// });

	function _generateSvgPath(name, n){
		var p = n.add("path");
		svgbindSetting.apply(this, [p]);
		sgRendering = sgRendering || new SegmentRenderingVisitor();
		sgRendering.clearDef();
		this.buildPath(sgRendering);
		p.setAttributes({
			d: sgRendering.getDef()
		});
	};
var sgRendering = 0;
var visitor ={
	'bezier': function(name, n){
		var p = n.add("path");
		svgbindSetting.apply(this, [p]);
		var s = "";
		var ms = 0;
		this.bezierSegment.each_all(function(){
				s+= this.getDef(ms==0);
				ms=1;
		});
		
		if (this.close){
			s+="Z";
		}
		p.setAttribute("d", s);
		return p;
	},
	'rectangle':function(name, n){
		var b = this.bound , p = n.add("rect");
		svgbindSetting.apply(this, [p]);		
		p.setAttribute("x", b.x);
		p.setAttribute("y", b.y);
		p.setAttribute("width", b.width);
		p.setAttribute("height", b.height); 
	},
	'roundrect':function(name, n){
		_generateSvgPath.apply(this, [name, n]);
		// var p = n.add("path");
		// svgbindSetting.apply(this, [p]);
		// sgRendering = sgRendering || new SegmentRenderingVisitor();
		// sgRendering.clearDef();
		// this.buildPath(sgRendering);
		// p.setAttributes({
		// 	d: sgRendering.getDef()
		// });
	},
	'plume': function(name, n){
		var p = n.add("path");
		svgbindSetting.apply(this, [p]);
		var s = "";
		
		var start = !0;
		var cur = 0;
		var inC = 0;
		var outC = 0;
		var prevX = 0;
		var prevY = 0;
	
		this.segments.each_all(function(){
				// if(!ms){
					// s+="M"+Math.ceil(this.item.point.x,2)+ " "+Math.ceil(this.item.point.y,2);
				// }else{
					// s+="C";
					// s+= svgDefPoint([this.item.handleIn, this.item.handleOut]);
				// }
				
				
				var i = this.item;
		if (start){
			s+="M"+svgDefPoint([i.point]);
			start = !1;
		}else{
			inC = {
					x: i.point.x + (i.point.x - i.handleIn.x),
					y: i.point.y + (i.point.y - i.handleIn.y)
				};
			if ((inC.x == i.point.x) && 
			   (inC.y == i.point.y) && 
			   (outC.x == prevX) && 
			   (outC.y == prevY))
					s+="L"+svgDefPoint([i.point]);
			
			else {
				cur = i.point;
				s+="C";
				s+= svgDefPoint([
				outC, 
				inC, 
				cur]);
			}
			
		}
		prevX = i.point.x;
		prevY = i.point.y;
		
		outC = {
			x: i.point.x + (i.point.x - i.handleOut.x),
			y: i.point.y + (i.point.y - i.handleOut.y)
		};
		
		
		
		});
		
		if (this.close){
			s+="Z";
		}
		p.setAttribute("d", s);
		return p;
	},
	'document': function(name, e){
		var W = this.width;
		var H = this.height;
		e.setAttribute("viewBox", "0 0 "+W+" "+H);
		e.setAttribute("width", W);
		e.setAttribute("height", H);
		e.setAttribute("id", this.id);
	},
	'layer': function(name, e){
		var p = e.add("g");
		svgbindSetting.apply(this, [p]);		
		return p;
	},
	'circle': function(name, n){
		
		var r = this.radius;
		var c = this.center;
		
		if (!_NS.Utils.IsArray(r)){

		
			if ((typeof(r)=='object') && ('x' in r) && ('y' in r)){
				if (r.x == r.y){
					r = parseFloat(r.x);
				}
			}
		}


		var p  = 0;
		if (typeof(r)=='number' ){			
		
			p = n.add("circle");
			svgbindSetting.apply(this, [p]);
		
			p.setAttribute("cx", c.x);
			p.setAttribute("cy", c.y);
			p.setAttribute("r", r);
			return;
		}
		
		if (_NS.Utils.IsArray(r)){	
			var PATH  = _NS.Utils.Path;
			var pg = n.add('path');
			svgbindSetting.apply(this, [pg]);
			var d = "";
			var x, y, crx, cry;
			
			//joint path
			for(var i = 0; i < r.length; i++){
				var cr = r[i];
				// p = g.add("circle");
				// p.setAttribute("cx", c.x);
				// p.setAttribute("cy", c.y);
				// p.setAttribute("r", cr);
				
				
				//create circle with bezier curve sergement and get the definition
				if (typeof(cr)=='number'){
					x = c.x - cr;
					y = c.y - cr;
					crx  = cr *2;
					cry  = cr *2;
				}else{
					x = c.x - cr.x;
					y = c.y - cr.y;
					crx = cr.x * 2;
					cry = cr.y * 2;
				}
				var g = new _NS.drawing2d.segments.drawingContext();
				PATH.renderEllipse(g, x, y, crx, cry);
				g.close();
				d += g.getDef();
				
			}
			//joint path
			//segment = new Segment ;
			pg.setAttribute("d", d);
		}
	}
};


	function __getValue(d){
		if (!d)
			return null;
		
		switch(typeof(d)){
			case 'Array':
			case 'object':
				return JSON.stringify(d);
		}
		return d;
	};
	
igk.system.createNS("igk.winui.cancasEditor.visitors", {
	svg: function(list, inf){
		var EXPORTS = igk.winui.cancasEditor.Exports;
		var ELEM = igk.winui.cancasEditor.DrawingElements;
			var e = $igk(igk.dom.createXMLDocument("svg").documentElement); 
            e.addComment("svg file:  generate with cancasEditor App");
            e.addComment("Author: C.A.D. BONDJE DOUE");
            e.addComment("App: CancasEditor");
            e.addComment("Version: 1.0");
            e.addComment("Date: "+igk.system.Date.format(Date.now(), "d/m/Y"));
			
			e.setAttribute("version", "1.1");
			e.setAttribute("xmlns", "http://www.w3.org/2000/svg");
			e.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
			e.setAttribute("xmlns:igk", "https://schema.igkdev.com/cancaseditor/2018");
			//document
			var W = inf.width || 100;
			var H = inf.height || 100;
			
			//size definition
			e.setAttribute("viewBox", "0 0 "+W+" "+H);
			e.setAttribute("width", W);
			e.setAttribute("height", H);
			
			// stroke
			e.setAttribute("fill", "black");
			e.setAttribute("stroke", "transparent");
			
			var glist = [{list:list, host: e}];
			var q = 0;
			while(q = glist.pop())
			{			
				for(var i = 0; i < q.list.length; i++){

                var c = q.list[i];
                var n = c.getType();
				var host = q.host;
				var g  = null;
                if (n in visitor){
                    g = visitor[n].apply(c, [n, host]) || host;
                }else{
					_generateSvgPath.apply(c, [n, host]);

					// var tab = c.exports || EXPORTS.getExports(n) || [];					
					// g =  host.add(n);
					// var name = "";					
					
					// for(var m = 0; m < tab.length; m++){	
					// 	var s = tab[m];
					// 	var v = null;
					// 	var attr = 1;
					// 	if (typeof(s)=='object'){
							
					// 		name = s.name;
					// 		if ('generate' in s){
					// 			v = s.generate(c);
					// 		}
					// 		else 
					// 			v = c[name];

							
					// 		if (s['default'] == v){
					// 			continue;
					// 		} 
							
					// 		if (s.serializer){
					// 			v = s.serializer(v);								
					// 		}
					// 		if (s.serializeAs == 'element'){
					// 			attr=0;
					// 		}
							
					// 	}else{
					// 		v = c[tab[m]];
					// 		name = tab[m];
					// 	}
					// 	if (attr){
					// 		g.setAttribute(name, __getValue(v)); //c[tab[m]]));
					// 	}else{
					// 		g.setHtml(v);
					// 	}
					// }
				}

				
				
				if (igk.system.isInherit(c, ELEM.drawing2DContainer))
				{
						// console.debug("load instance .....");
						var childs = c.Elements;
						if (childs && childs.length>0){
							glist.push({host:g, list: childs});
						}
					}
				}
			}
			
			inf.mimetype="application/xml+svg";
			inf.name = "project.svg"; 
			
			var d = igk.createNode("div");
			d.add(e);
			
			return "<?xml version=\"1.0\" standalone=\"no\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n"+
					d.o.innerHTML;
	}
});

})();