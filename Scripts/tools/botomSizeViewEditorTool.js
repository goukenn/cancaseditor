(function(){

//bottom zoom editor layer tool


function bottomSizeEditorTool(){
	igk.winui.cancasEditor.Editor.Tool.apply(this);
	var lb = igk.createNode("span").addClass("b-size").setCss({
		paddingLeft: "4px",
		paddingRight: "4px",
		cursor: 'pointer'
	});
	lb.addClass("dispn");
	lb.setHtml(" 0 x 0 ");
	
	
	this.attachTo  = function(t, editor){
		this.host = t;
		this.editor =editor;
		this.host.add(lb);
		
		editor.on("currentDocumentChanged", function(e){
			// console.debug("size "+e.zoom);
			var d = e.current;
			if (d){
				// d.on("sizeChanged")
				lb.setHtml( d.width +" x "+ d.height); //: "+Math.ceil(e.zoom*100)+"%");
				lb.rmClass("dispn");
			}else{
				lb.setHtml("");
				lb.addClass("dispn");
			}
		});
	};
};

igk.winui.cancasEditor.Editor.regTool("Bottom", new bottomSizeEditorTool(), 4);
})();