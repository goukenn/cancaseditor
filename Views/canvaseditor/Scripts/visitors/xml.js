
"use strict";

(function(){

    //visitor private functions
    var visitor = {

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
		// console.debug("datae : "+igk.system.Date.format(Date.now(), "Y:m:d"));
	//throw ("b");
	
    igk.system.createNS("igk.winui.canvasEditor.visitors", {
        xml: function(list, inf){
			var EXPORTS = igk.winui.canvasEditor.Exports;
			var ELEM = igk.winui.canvasEditor.DrawingElements;

            var e = $igk(igk.dom.createXMLDocument("gkds").documentElement); 
			e.setAttribute("app", "canvasEditor");
			e.setAttribute("app-version", "1.0");
			e.setAttribute("xmlns:igk", "https://www.igkdev.com/schema");
			e.setAttribute("xmlns", "https://schema.igkdev.com/canvaseditor/2018");
            e.addComment("gkds file:  generate with canvasEditor App");
            e.addComment("Author: C.A.D. BONDJE DOUE");
            e.addComment("App: CanvasEditor");
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
							g.setAttribute(name, __getValue(v)); //c[tab[m]]));
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
           
			var d = igk.createNode("div");
			d.add(e);
		   return d.o.innerHTML; //e.render();
        }
    });



})();