(function(){
//mp4 decoder
var _P = igk.system.promiseCall; 
// console.debug("encoder....");
var G = igk.system.createNS("igk.winui.cancasEditor.encoder", {
"gkds":function(){

}
});


G.gkds.decode = function(file, a){
	var P = _P();
	
	var uri = URL.createObjectURL(file);
	igk.ajx.bindHeader({"Content-Type":"text/xml"});
	igk.ajx.get(uri, null, function(xhr){
		if (this.isReady()){
			// var txt =  xhr.responseText;
			// console.debug(txt);
			// console.debug(xhr.responseXML);
			// return;
			//force to reducte the content to child - and add close tag fo element
			var  q = igk.createNode("dummy");
			var txt = igk.html.closeEmptyTag(xhr.responseText) ;// $igk(xhr.responseXML.firstElementChild).o.outerHTML;
			// console.debug(txt);
			 q.setHtml(txt);//$igk(xhr.responseXML.firstElementChild).getHtml());
			
			// console.debug(q.o.namespaceURI);
			
			// return;
			
			var gkds = q.select("gkds").first();
			if (!gkds){
				console.error("not a valid gkds file");
				return;
			}
			var doc = [];
			var s = 0; // start
			
			// console.debug(gkds.getHtml());
			
			gkds.qselect("documents > layerDocument").each_all(function(){
				// console.debug("load document");
				var W = this.getAttribute("width");
				var H = this.getAttribute("height");
				
				var _doc = a.createElement("document");
				_doc.setSize(W, H);
				if (!s){
					a.clear();
					a.add(_doc);
					a.document = _doc;
						s = 1;
				};
				
				_loadGkdsDocument(_doc, this, a);				
			});
			
			a.refresh();
			P.resolv();
		}
	});
	// console.debug(obj.o.src);
	
	
	return P;

};
//convert value receive from gkds file
// n the name of the attribute
// v the value read
// t the -ce- node;
function getValue(n, v, t){
	if (!v)
		return null;
	
	if (n in this.parser){
		return this.parser[n](n, v, t);
	}
	return v;
};


function loadAttribute(doc, attr, exportattr){
	attr = $igk(attr);
	var g = attr.o.attributes;
	doc.id = attr.getAttribute('id'); //[t'id'];
	
	
	if (exportattr){
		var p = 0;
		for(var j=0; j < exportattr.length; j++){
			p = exportattr[j];
			if (typeof(p)=='string'){
				p = {
					name:p,
					target:p
				};
			}
			var v = getValue.apply(this, [p.name, attr.getAttribute(p.name), doc]) || p.gkDefault || null;
			doc[p.target] = v; //p.resolv(attr.getAttribute(p.name);
		}
	}
};


function _loadGkdsDocument(doc, gkdsdocument, a, converter){
	converter = converter || new GkdsConverter();
	loadAttribute.apply(converter, [doc, gkdsdocument]);	
	_loadChilds(doc, gkdsdocument, a, converter);
	
};


function _loadChilds(t, e, a, converter){
	// t : -ce- node
	// e : -gkds- node
	// a : -canvas apps-
	// c : -converter-
	e = $igk(e);
	// console.debug("the ::::::::::::::::::::::::");
	// console.debug(e.getHtml());
	for(var i = 0; i < e.getChildCount(); i++){
		
		var c = e.o.childNodes[i];
		if (c.nodeType != 1)
			continue;
		
		var n = c.tagName.toLowerCase();
		// console.debug("loading:::::: "+n + " " +i);
		if (n in converter){
			converter[n](c, t, a);
		}else{
			converter.open(c, t, a);
		}	
		
	}
};



function getExport(l){
	var EXPORTS =  igk.winui.cancasEditor.Exports;
	var n = l.getType();
	var g = EXPORTS.getExports(n);
	
	if (g){
		var _export = [];
		// attribute converters
		// console.debug(g);
		
		return _export;
		
	}
	return null;
};
var CONV = igk.system.convert;

function GkdsParser(){
	function getColor(v){ // form gdks color system : argb
		var cl = "#000";
		var v = v.trim();
		if (/^#/.test(v) || /^rgb(a){0,1}\(/.test(v)){
			cl= igk.system.colorFromString(v).toString();
			console.debug(cl);
		}else{
			//linear definition 
			var d ={};
			var t = v.split(";");
			for(var i = 0; i < t.length; i++){
				var n = t[i].split(":");
				d[n[0].toLowerCase()] = n[1];
			}
			if (d && d.type){		
				
				switch(d.type){
					case "Solid":
					break;
				}
				
				
				//read definition 
				
				var o = {
					colors: d.colors.split(' ') 
				};
				if ('width' in d){
					o.strokeWidth = d.width;
				}
				if  ('dashstyle' in d){
					o.dashstyle = d.dashstyle;
				}
				if ('linejoin' in d){
					o.join = d.linjoin;
				}
				return o;
				
			}
			cl = v;
		}
		return cl;
	};
	
	this.bounds = function(name, v, t){
		// console.debug("try to parse "+name);
		var t = v.split(";");
		return {
			x:CONV.parseToInt(t[0]),
			y:CONV.parseToInt(t[1]),
			width:CONV.parseToInt(t[2]),
			height: CONV.parseToInt(t[3])
		};
	};
	
	this.fillbrush = function(name, v, t){
		v = getColor(v);
		if (typeof(v) == "object"){
			
			
			var g = igk.system.colorFromString(v.colors[0]).toString();
			return g; 				
		}
		return v;
	};
	this.strokebrush = function(name, v, t){
		//color definition
	    v = getColor(v);
		if (typeof(v) == "object"){
			if (v.strokeWidth)
				t.strokeWidth = v.strokeWidth;
			
			
			if (v.colors.length == 1){
				var g = igk.system.colorFromString(v.colors[0]).toString();
				return g; 
			}
			
		}
		
		return v;
	};
	this.startpoint = function(name, v, t){
		return null;
	};
	this.endpoint = function(name, v, t){
		return null;
	};
	this.center = function(name, v, t){
		
	};
	this.angle = function(name, v, t){
		
	};
	this.sweepangle = function(name, v, t){
		
	};
	this.points = function(name, v, t){
		
	};
};

function GkdsConverter(){
	
	this.parser = new GkdsParser();
	
		igk.appendProperties(this, {
			open: function(n, parent, a){
				// -n- node to converter
				// -parent- ce node
				// a- 
			},
			layer: function(n, parent, a){
				var l = a.add("layer");
				if(!a.layer)
					a.layer = l;
				loadAttribute.apply(this, [l, n, getExport(l)]); //id attribute -- 
				_loadChilds(l, n, a, this);
			},
			rectangle: function(n, parent, a){
				// console.debug('load rectangle');
				var l = a.add("rectangle");				
				loadAttribute.apply(this,[l, n , [
					{name:'fillbrush', target:'fill'}, 
					{name:'strokebrush', target:'stroke'}, 
					{name:'bounds','target':'bound'} 
				]]);
				
				// console.debug("id : "+l.id);
				// console.debug("bound : ");
				// console.debug(l.bound);
				// console.debug(l.fill);
				// console.debug(l.stroke);				
				// console.debug("layer length");
				// console.debug(parent.length);
				
				// parent.add(l);
			},
			circle: function(n, parent, a){
				
			},
			path: function(n, parent, a){
				
			},
			line: function(n, parent, a){
				
			},			
		});

};


})();