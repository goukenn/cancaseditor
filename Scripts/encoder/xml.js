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
/**
 * load a gkds xml document string in the editor
 * @param {string} xml document source
 * @param {*} a editor
 * @returns {boolean} false when the source is not a cancasEditor document
 */
G.xml.decodeString = function(xml, a){
	var  q = igk.createNode("dummy");
	var txt = igk.html.closeEmptyTag(xml) ;
	q.setHtml(txt);
	var gkds = q.select("gkds").first();
	if (!gkds || (gkds.getAttribute("app")!="cancasEditor")){
		return false;
	}
	// brushes embedded in the document (referenced by "brush:<id>" fills)
	if (_NS.brushes){
		gkds.qselect("brush").each_all(function(){
			try{
				_NS.brushes.embed(JSON.parse(this.getAttribute("data")));
			}
			catch(e){
				console.warn("[cancasEditor] invalid embedded brush", e);
			}
		});
	}
	var doc = [];
	var s = 0; // start
	try{
		gkds.qselect("document").each_all(function(){
			var W = this.getAttribute("width");
			var H = this.getAttribute("height");
			var _doc = a.createElement("document");
			_doc.setSize(Number(W), Number(H));
			// other document properties
			["id", "fill", "stroke", "title", "x", "y"].forEach((n) => {
				var v = this.getAttribute(n);
				if (v !== null && v !== undefined) {
					_doc[n] = v;
				}
			});
			if (!s){
				a["@loading"] = 1;
				a.clear();
				s = 1;
			} else {
				a.layer = null; // the next document is added to the scene, not to the last loaded layer
			}
			a.add(_doc);
			a.document = _doc;
			doc.push(_doc);
			_loadItems(_doc, this, a);
		});
		if (doc.length > 1){
			// the first document is the current one
			a.document = doc[0];
			var ly = doc[0].getLayers();
			a.layer = ly.length > 0 ? ly[ly.length - 1] : null;
		}
		if (doc.length == 0)
		{
			a.clear();
			var dummyList = new function(){
				this.initialize=function(){
				};
			};
			_loadItems(dummyList, gkds , a);
		}
	}
	finally{
		delete(a["@loading"]);
	}
	a.refresh();
	return true;
};
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
			if (!G.xml.decodeString(xhr.responseText, a)){
				P.error({msg: _NS.R.err_gkds_file_error});
				return;
			}
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
	// attribute names are lower cased by the html parser: compare without case
	var ln = n.toLowerCase();
	for(var j = 0; j < g.length; j++){
		if ((typeof(g[j])=='string') && (g[j].toLowerCase()==ln)){
			g[k][n] = function(v){return v;};
			return v;
		}
		if ((typeof(g[j])=='object') && (g[j].name.toLowerCase() == ln)){
			if (g[j].resolv){
				//priority to resolution
				g[k][n] = null; 
				g[kr][n] = g[j].resolv;
				g[j].resolv(item, v, n); // the export definition names it resolv
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
	if (!g){
		// element without export definition: nothing can be loaded
		return;
	}
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
		if ((v === 'null') || (v === 'undefined')){
			// written by an earlier version for an empty value: use the default
			continue;
		}
		//if deserialize request special attribute.
		// console.debug(n);
		 _tv = Unserialize(n, v, g);
		 if( (typeof(_tv) !='undefined') || !(n in g['@_resolv'])){
			try{
				o[g.__attribs__(n)]  = _tv;
			}
			catch(e){
				// read only or invalid property: keep the default value instead of aborting the whole load
				console.warn("[cancasEditor] attribute '"+n+"' of "+o.getType()+" not loaded: "+e.message);
			}
		}
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
				q.t.initialize && q.t.initialize(); // the element, not its export definition
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
				if (nn == "layer"){
					// a layer is added to the document, not to the previously loaded layer
					a.layer = null;
				}
				var b = null;
				if ((nn == "group") || ((q.t.getType) && (q.t.getType() == "group"))){
					// a group takes its own children (the current layer of the editor stays the same)
					b = a.createElement(nn);
					b && q.t.add(b);
				} else {
					b = a.add(nn);
				}
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