"use strict";
(function(){
    //visitor private functions
    var visitor = {
    };
	function __getValue(d){
		if (d === 0)
			return 0;
		if (!d)
			return null;
		switch(typeof(d)){
			case 'Array':
			case 'object':
				return JSON.stringify(d);
		}
		return d;
	};
		// console.debug("datae : "+igk.system.Date.format(Date.now(), "Y:m:d"));
	//throw ("b");
    igk.system.createNS("igk.winui.cancasEditor.visitors", {
        xml: function(list, inf){
			var EXPORTS = igk.winui.cancasEditor.Exports;
			var ELEM = igk.winui.cancasEditor.DrawingElements;
            var e = $igk(igk.dom.createXMLDocument("gkds").documentElement); 
			e.setAttribute("app", "cancasEditor");
			e.setAttribute("app-version", "1.0");
			e.setAttribute("xmlns:igk", "https://www.igkdev.com/schema");
			e.setAttribute("xmlns", "https://schema.igkdev.com/cancaseditor/2018");
            e.addComment("gkds file:  generate with cancasEditor App");
            e.addComment("Author: C.A.D. BONDJE DOUE");
            e.addComment("App: CancasEditor");
            e.addComment("Version: 1.0");
            e.addComment("Date: "+igk.system.Date.format(Date.now(), "d/m/Y"));
			var glist = [{list:list, host: e}];
			var q = 0;
			while(q = glist.pop())
			{			
				for(var i = 0; i < q.list.length; i++){
                var c = q.list[i];
                var n = c.getType();
				var host = q.host;
                if (n in visitor){
                    visitor[n].apply(c, [n]);
                }else{
					var tab = c.exports || EXPORTS.getExports(n) || [];					
					var g  = host.add(n);
					var name = "";					
					for(var m = 0; m < tab.length; m++){	
						var s = tab[m];
						var v = null;
						var attr = 1;
						if (typeof(s)=='object'){
							name = s.name;
							if ('generate' in s){
								v = s.generate(c);
							}
							else 
								v = c[name];
							if (s['default'] == v){
								continue;
							} 
							if (s.serializer){
								v = s.serializer(v);
								if((name=='matrix') && (v==null))	
									continue;
							}
							if (s.serializeAs == 'element'){
								attr=0;
							}
						}else{
							v = c[tab[m]];
							name = tab[m];
						}
						if (attr){
							// no value: no attribute (setAttribute(name, null) would write the text "null")
							v = __getValue(v);
							if (v !== null && v !== undefined){
								g.setAttribute(name, v);
							}
						}else{
							g.setHtml(v);
						}
					}
					if (igk.system.isInherit(c, ELEM.drawing2DContainer))
					{
						// console.debug("load instance .....");
						var childs = c.Elements;
						if (childs && childs.length>0){
							glist.push({host:g, list: childs});
						}
					}
					// else{
						// console.debug(n + " not an instance of drawing2DContainer");
					// }
				}
				}
			}
			// the brushes used by the elements are embedded: the document still renders without the user library
			var B = igk.winui.cancasEditor.brushes;
			if (B) {
				var used = B.usedIds(list);
				if (used.length > 0) {
					var bs = e.add("brushes");
					used.forEach(function (id) {
						var br = bs.add("brush");
						br.setAttribute("id", id);
						br.setAttribute("data", JSON.stringify(B.get(id)));
					});
				}
			}
			// prototype links between documents (by document id)
			var app = igk.winui.cancasEditor.app;
			if (app && app.list === list && app.links && app.links.length > 0) {
				var ls = e.add("links");
				app.links.forEach(function (l) {
					var n = ls.add("link");
					n.setAttribute("from", l.from.id);
					n.setAttribute("to", l.to.id);
					n.setAttribute("color", l.color);
					if (l.label) {
						n.setAttribute("label", l.label);
					}
				});
			}
			var d = igk.createNode("div");
			d.add(e);
		   return d.o.innerHTML; //e.render();
        }
    });
})();