"use strict";

// date : 28/11/2018
// author: C.A.D.  BONDJE DOUE
// version : 1.0
// desc: represent xml decoder 
// partof : cancasEditor 

(function(){


// console.debug("encoder....");
// promise
var _P = igk.system.promiseCall; 
var _NS = igk.winui.cancasEditor;

var G = igk.system.createNS("igk.winui.cancasEditor.encoder", {
"xml":function(){

}
});


G.xml.decode = function(file, a){
	var P = _P();
	
	// if (typeof(FileReader) != 'function')
		// return P;
	// if (typeof(URL) != 'function')
		// return P;
	
	var uri =  URL.createObjectURL(file);

	
	igk.ajx.bindHeader({
		"Content-type":"text/xml"
	});
	igk.ajx.get(uri, null, function(xhr){
		
		if(this.isReady()){
			var  q = igk.createNode("dummy");
			var txt = igk.html.closeEmptyTag(xhr.responseText) ;
			
			q.setHtml(txt);
			
			var gkds = q.select("gkds").first();
			if (!gkds || (gkds.getAttribute("app")!="cancasEditor")){
				P.error({msg: _NS.R.err_gkds_file_error});
				return;
			}
			var doc = [];
			var s = 0; // start
			
			// console.debug(gkds.getHtml());
			
			gkds.qselect("document").each_all(function(){
				// console.debug("load document gkds app document");
				var W = this.getAttribute("width");
				var H = this.getAttribute("height");
				
				var _doc = a.createElement("document");
				_doc.setSize(W, H);
				if (!s){
					a["@loading"] = 1;
					a.clear();
					a.add(_doc);
					a.document = _doc;
						s = 1;
				};
				doc.push(_doc);
				
				_loadItems(_doc, this, a);				
			});
			
			

			if (doc.length == 0)
			{
				
				// console.debug("no document registered");			 
				a.clear();
				var dummyList = new function(){
					this.initialize=function(){
						
					};
				};
				_loadItems(dummyList, gkds , a);	
				delete(a["@loading"]); 				
				// console.debug("loaded item "+ a);
				// console.debug(a.list.item);
			}			
			delete(a["@loading"]); 
			a.refresh();
			P.resolve();
			//a.title = file.name;
			
	}else {
		// console.debug(xhr.readyState);
		// console.debug(xhr.status);
		if (xhr.readyState == 4){
			P.failed();
		}
	}
});
	

	return P;
};


var EXPORTS =  igk.winui.cancasEditor.Exports;

function BaseSerie(item)
{
	
	return function (n, v, g){
	if (n in g){
		//no serialise
		return v;
	};
	//attach unserialize list
	var k = "@_unseri";
	var kr = "@_resolv";
	if (!g[k]){
		g[k] = {};
	};
	if (!g[kr]){
		g[kr] = {};
	};
	if (n in g[kr]){
		g[kr][n](item, v);
		return;
	}
	
	if (n in g[k]){
		var fc = g[k][n];
		if (typeof(fc) == 'function'){
			return fc.apply(item, [v, n]);
		}else{
			console.error("not a function "+n);
		}
		return null;
	}

	// found the properties with the name 
	for(var j = 0; j < g.length; j++){
		if (g[j]==n){
			g[k][n] = function(v){return v;};
			return v;
		}
		if ((typeof(g[j])=='object') && (g[j].name == n)){
			
			if (g[j].resolv){
				//priority to resolution
				g[k][n] = null; 
				g[kr][n] = g[j].resolv;
				g[j].resolve(item, v);
				return;
			}
			if (g[j].unserialize){
				g[k][n] = g[j].unserialize;
			}
			else 
				g[k][n] = function(v){return v;};
			var fc = g[k][n];
			if (typeof(fc)!='function'){
				console.error("not a function");
				continue;
			}
			return fc.apply(item, [v, n]);
		}			
	}
	return v;	
}

};

function loadAttributes(o, attr, a){
	var g = EXPORTS.getExports(o.getType());
	if (!g.__attribs__){
		//load attributes list
		g.__attribs__ = (function(){
			var names = {};
			
			for(var j = 0; j < g.length; j++){
				var s = g[j];
				
				if (typeof(s)=='string')
					names[s.toLowerCase()] = s;
				else {
					names[s.name.toLowerCase()] = s.name;
				}
			}
			
			return function(n){
				return names[n.toLowerCase()];
			}
		})();
	}
	// console.debug(g);
	
	var Unserialize = BaseSerie(o);
	var _tv= null;
		
	for(var i = 0; i < attr.length; i++){
		var n = attr[i].name;
		var v = attr[i].value;
		
		
		
		//if deserialize request special attribute.
		// console.debug(n);
		
		 _tv = Unserialize(n, v, g);
		 if( (typeof(_tv) !='undefined') || !(n in g['@_resolv']))
			o[g.__attribs__(n)]  = _tv;
		
	}
}

function _loadItems(o, src, a, exports){
	
	src = $igk(src);
	var tq = [{o: src.o, t: o }];
	var q = 0;
	var mExports = exports || EXPORTS;
	var tn = ''; //tag name
	while(q = tq.pop())
	{
		tn = q.o.tagName.toLowerCase();
		// element handle child unserialize
		var g = mExports.getExports(tn);
		if (q.o.childNodes.length>0){			
			if (g && ('unserialize' in g)){
				g.unserialize.apply(q.t, [ { "src": q.o, "a":a }] );
				g.initialize();
				continue;
			}
			// else{
				// if (!g){ // not a valid drawing element
					// console.debug("failed to get export for "+q.o.tagName);
					// continue;
				// }
			// }
			var childs = q.o.childNodes;
			var cln = childs.length;
			
			for(var i = 0;  i < cln; i++){
				var gsrc = childs[i];
				if(gsrc.nodeType != 1){
					continue;		
				}
				var nn = gsrc.tagName.toLowerCase(); //child name
				// console.debug("load : "+nn);
				var b = a.add(nn);
			
			
				if (b!=null){	
					//initialize special item
					mExports.initItemApp(a, b);
					
			
			
				//load definition properties
					loadAttributes( b, gsrc.attributes, a);
			
					//load attribute
					tq.push({
						o: gsrc,
						t: b, 
						p: q,
						//exta
						tn: tn, // parent tag
						index: i,
						g : i==0?g:null, // parent export
						host: q.t
					});
				}
			}
		}

	
		
		// console.debug("initialize "+tn + " tn : "+q.tn + " index : "+q.index);
		if (q.p){
			q.t.initialize();		
		}
		if (((cln==0) || (q.index == 0)) && ('loadingComplete' in q.g)){
			q.g.loadingComplete(q.host, a);
		}
	}
	
};


})();