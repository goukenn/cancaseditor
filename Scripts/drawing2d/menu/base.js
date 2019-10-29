"use strict";

(function(){

var ACTIONS = igk.winui.cancasEditor.Actions;

ACTIONS.regMenuAction("tools.rectangle", {index:3, callback:function(){
	ACTIONS.invoke("editor.selectool.rectangle");
}});

})();