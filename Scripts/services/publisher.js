"uses strict";
(function(){
	var _NS = igk.system.require('igk.winui.cancasEditor.services'); 
	var publisher = function(a){
		// console.debug("create a publisher :::::::::::::::::::::::::::::::::::::::::::::::");
		var _elist = {};//event list
		var _q = igk.createNode("div");
		
		igk.appendProperties(this, {
			publish: function(n, e){ // dispatch associated event
				// console.debug("publish : "+n);
				_q.raiseEvent(n,e);
			},
			on: function(n, c, p){// register event callback
				// console.debug("on register "+n);
				if(!(n in _elist)){
					//register event list
					_q.addEvent(n, {});
					_elist[n] = n;
				}
				_q.on(n, c, p);
			},
			unreg: function(n,c){
				_q.unreg_event(n,c);
			}
		});
	};
	
	//export publisher
	igk.defineProperty(_NS, 'publisher', {
		get: function(){
			return publisher;
		}
	});

})();
