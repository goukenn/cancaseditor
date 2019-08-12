"use strict";
(function(){

//color Editor Tool
var AC = igk.winui.cancasEditor.Actions;
var Key = AC.Key;
var initc = 0;

function bottomColorEditorTool(){
	// console.debug("init "+initc);
	initc++;
	
	igk.winui.cancasEditor.Editor.Tool.apply(this);
	var lb = igk.createNode("span").addClass("colortool").setCss({
		paddingLeft: "4px",
		paddingRight: "4px",
		cursor: 'pointer'
	});
	
	lb.setHtml("");
	var self = this;
	var fill = lb.add("span").addClass("btn fill").setHtml(" ");
	var stroke = lb.add("span").addClass("btn stroke").setHtml(" ");
	
	var svg = igk.createNode("svg").setAttributes({
		"xmlns":"http://www.w3.org/2000/svg",
		"width":16,
		"height":16,
		"version":"1.1",
		"viewBox":"0 0 16 16"});
	
	svg.add("rect").setAttributes({
		x:0,
		y:0,
		width:16,
		height:16,
		fill: 'black'
	});
	
	
	fill.setCss({
		background:
		// "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGlkPSJMYXllckRvY3VtZW50XzM3OTA3NzQ2IiB2aWV3Qm94PSIwIDAgMTYgMTYiIGZpbGw9IiUyM0ZGRiIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCgk8cmVjdCBpZD0iUmVjdGFuZ2xlXzQyNDQ2Mzk5IiB4PSIxIiB5PSIxIiB3aWR0aD0iMTQiIGhlaWdodD0iMTMiIGZpbGw9IiUyM0ZGNTMwMCIgc3Ryb2tlPSIlMjMwMDgzRkYiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIwIiBzdHJva2Utd2lkdGg9IjEiIC8+DQo8L3N2Zz4=')"
		// "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGlkPSJMYXllckRvY3VtZW50XzM3OTA3NzQ2IiB2aWV3Qm94PSIwIDAgMTYgMTYiIGZpbGw9IiNGRkYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+DQoJPHJlY3QgaWQ9IlJlY3RhbmdsZV80MjQ0NjM5OSIgeD0iMCIgeT0iMCIgd2lkdGg9IjE0IiBoZWlnaHQ9IjEzIiBmaWxsPSIjRkY1MzAwIiBzdHJva2U9IiMwMDgzRkYiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIwIiBzdHJva2Utd2lkdGg9IjEiIC8+DQo8L3N2Zz4=')"
		"url('data:image/svg+xml;base64,"+window.btoa(svg.render())+"')"
		});
	
	fill.on("click", function(){
		var e = self.editor.element;
		if (e && e.fill){
			e.fill = "red";
			self.editor.refresh();
		}
		
	}).on("dblclick", function(){
		//
		AC.invoke("editor.editfill");
		var e = self.editor.element;
		if (e && e.fill){
			fill.styledef = e.fill;
		}
	});
	
	stroke.on("click", function(){
		var e = self.editor.element;
		if (e && e.fill){
			e.stroke = "red";
			self.editor.refresh();
		}
		
	}).on("dblclick", function(){
		//
		AC.invoke("editor.editstroke");
		var e = self.editor.element;
		if (e && e.fill){
			fill.styledef = e.fill;
		}
	});;
	
	
	this.attachTo  = function(t, editor){
		this.host = t;
		this.editor =editor;
		t.add(lb);
		
	};
}

// register for bottom tool
igk.winui.cancasEditor.Editor.regTool("Bottom", new bottomColorEditorTool(), 1);
})();