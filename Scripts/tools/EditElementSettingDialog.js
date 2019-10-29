"use strict";


(function(){
//filter Editor Tool
var _NS = igk.winui.cancasEditor;
var AC = _NS.Actions;
var R = _NS.R; //.Actions;
var Key = AC.Key;
var CT = igk.system.convert;
 

var GUI = igk.system.createNS(_NS.getType().getFullName()+".tools",{});
var liveprop = null;
function reset(frm, a, e){
	// console.debug("reset");
	for(var i in liveprop){
		frm.engine.getItem(i).val(liveprop[i]);
	}
	update(frm, a, e);
};

function update(frm, a, e, id){
	// console.debug("upadate value");
	
	if (id){
		e[id] = frm.engine.getItem(id).val();
		// console.debug(frm.engine.getItem(id).val());
	}
	else
	{
		var t = frm.engine.getFields();
		for(var h in t){
			e[h] = t[h].val();
		}
	}
	e.initialize();
	a.refresh();
};



GUI.EditElementSettingDialog = function(a, e, R){
	var d = igk.createNode("div");
	var frm = d.add("form");
	var engine = igk.winui.engine.getEngine("bmc", frm, R);
	e.Edit(engine, a);
	var t = frm.engine.getFields(); 
	for(var h in t){
			t[h].on("keyup change", function(evt){
			update(frm, a, e, evt.target.id);
		});
	};
	
	
	var bar = frm.add("div").addClass("igk-action-bar");
	bar.add("input").setAttributes({
		"type":"button",
		"value": R.btn_reset,
		"class":"igk-btn"
	}).on("click", function(){
		reset(frm, a, e);
	});
	
	
	var t = frm.engine.getFields();
	liveprop = {};
	for(var h in t){
		liveprop[h] = t[h].val();
	};
	
	
	this.control  = d;
};




var AC = igk.winui.cancasEditor.Actions;
var Key = AC.Key;


AC.regMenuAction("edit.properties", { separatorBefore:1, callback: function(a){
	//show about dialog
	if (a.tool.elem){
		a.editElement(a.tool.elem);
	}
}, index:500});




})();