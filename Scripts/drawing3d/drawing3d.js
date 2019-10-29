(function(){
    var _NS = igk.system.require('igk.winui.cancasEditor');
    var ACTIONS = _NS.Actions;
    ACTIONS.regMenuAction("tools.drawing3d", {
		index:80,
		callback:function(){ 
        },
        initialize:  function(a, key, menuHost){   
            menuHost.initialize=function(){		
                menuHost.enable = false;
            };
            return true;
        }
    });

    //,
    // initialize:  function(a, key, menuHost){  	
    //         menuHost.enable = false;
    //     return true;
    // }});


})();