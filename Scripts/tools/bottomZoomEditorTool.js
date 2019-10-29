(function(){

//bottom zoom editor layer tool


function bottomZoomEditorTool(){
	igk.winui.cancasEditor.Editor.Tool.apply(this);
	var lb = igk.createNode("span").addClass("b-zoom").setCss({
		paddingLeft: "4px",
		paddingRight: "4px",
		cursor: 'pointer'
	});
	
	lb.setHtml("zoom : 100%");
	
	
	this.attachTo  = function(t, editor){
		this.host = t;
		this.editor =editor;
		this.host.add(lb);
		
		editor.on("zoomChanged", function(e){
			//console.debug("zoomchanged "+e.zoom);
			lb.setHtml("zoom : "+Math.ceil(e.zoom*100)+"%");
		});
	};
};

igk.winui.cancasEditor.Editor.regTool("Bottom", new bottomZoomEditorTool(), 3);
})();