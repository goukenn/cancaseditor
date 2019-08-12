"use strict";


(function(){
var visitor ={
	
	
};

function CancasVisitor(){
	this.msrc = "";
};

igk.appendProperties(CancasVisitor.prototype, {
	addComment: function(m){
		this.msrc += "// "+m+"\n";
	},
	addText: function(m){
		this.msrc += m+"\n";
	},
	add:function(){
		
	},
	render : function(){
		return this.msrc;
	}
});
igk.system.createNS("igk.winui.cancasEditor.visitors", {
	canvas: function(list, inf){
		var EXPORTS = igk.winui.cancasEditor.Exports;
		var ELEM = igk.winui.cancasEditor.DrawingElements;
			var e = new CancasVisitor();
            e.addComment("svg file:  generate with cancasEditor App");
            e.addComment("Author: C.A.D. BONDJE DOUE");
            e.addComment("App: CancasEditor");
            e.addComment("Version: 1.0");
            e.addComment("Date: "+igk.system.Date.format(Date.now(), "d/m/Y"));
			
			e.addText("var ctx = 0;");
			
			var glist = [{list:list, host: e}];
			var q  = 0;
			while(q = glist.pop())
			{			
				for(var i = 0; i < q.list.length; i++){

                var c = q.list[i];
                var n = c.getType();
				var host = q.host;
				e.addComment(n +" "+c.id);
				
                if (n in visitor){
                    visitor[c].apply(c, [n]);
                }else{
					var tab = c.exports || EXPORTS.getExports(n) || [];					
					var g  = host.add(n);
					var name = "";					
					
					// for(var m = 0; m < tab.length; m++){	
						// var s = tab[m];
						// var v = null;
						// var attr = 1;
						// if (typeof(s)=='object'){
							
							// name = s.name;
							// v = c[name];							
							// if (s['default'] == v){
								// continue;
							// } 
							
							// if (s.serializer){
								// v = s.serializer(v);								
							// }
							// if (s.serializeAs == 'element'){
								// attr=0;
							// }
							
						// }else{
							// v = c[tab[m]];
							// name = tab[m];
						// }
						// if (attr){
							// g.setAttribute(name, __getValue(v)); //c[tab[m]]));
						// }else{
							// g.setHtml(v);
						// }
					// }

					// if (igk.system.isInherit(c, ELEM.drawing2DContainer))
					// {
						// var childs = c.Elements;
						// if (childs && childs.length>0){
							// glist.push({host:g, list: childs});
						// }
					// }
				}

				}
			} 
			inf.mimetype = "text/javascript";
			inf.ext = ".js";
			inf.name = "export.js";
			
			return e.render();
	}
});


var ACTIONS = igk.winui.cancasEditor.Actions;
var Key = ACTIONS.Key;
ACTIONS.regMenuAction("file.export.toCancasExpression", {index:10, callback:function(a){
	a.exportTo("canvas");
}});


})();