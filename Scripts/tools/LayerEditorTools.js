(function(){

//register layer tool


function LayerEditorTool(){
	igk.winui.cancasEditor.Editor.Tool.apply(this);
	var lb = igk.createNode("span").addClass("layertool").setCss({
		paddingLeft: "4px",
		paddingRight: "4px",
		cursor: 'pointer'
	});
	
	lb.setHtml("");
	var self = this;
	var doc = lb.add("span").setHtml("scene");
	var sp = lb.add("span").setHtml(" &gt; ");
	var ly = lb.add("span").setHtml("layer").setCss({
		position:'relative'
	});
	ly.title = ly.add("span");
	//lb.setHtml("<span>document:  </span><span> &gt; </span> <span>layers: (0) </span>");
	var lyv = ly.add('ul').addClass('layerview dispn posab').setCss({
		bottom: '100%',
		width:'auto',
		left:'0px',
		zIndex:'10',
		backgroundColor:'#444'
	});
	lyv.setHtml("");
	// lyv.add("li").setHtml("layer 1");
	// lyv.add("li").setHtml("layer 2");
	// lyv.add("li").setHtml("layer 3");
	var selectedLi = 0;
	var _visible = 0;
	function _select(li, layer){
		
		
		return function(){
			if (selectedLi != li){
				selectedLi.rmClass("igk-active");
				self.editor.layer = layer;
				selectedLi = li;
			}
		};
	}
	ly.on("click",function(e){
		if (!_visible && self.editor.document){
		var layers = self.editor.document.getLayers();
		//init layers
		lyv.setHtml("");
		for(var i = 0; i < layers.length; i++){
			var li = lyv.add("li").setHtml(layers[i].id);
			if (layers[i] == self.editor.layer){
				li.addClass("igk-active");
				selectedLi = li;
			}
			li.on("click", _select(li, layers[i]));
		}		
		lyv.toggleClass("dispn");
		_visible = 1;
		e.preventDefault();
		e.stopPropagation();
		}
	});
	this.attachTo  = function(t, editor){
		this.host = t;
		this.editor =editor;
		this.host.add(lb);
		
		editor.on("currentLayerChanged", function(){
			var s = "";
			if (editor.layer)
				s = " : "+editor.layer.id;
			ly.title.setHtml(s);
			}).on("click", function(){
				if (_visible){
					// console.debug("hide....");
					lyv.toggleClass("dispn");
					_visible = 0;
				}
			});
	}
}

igk.winui.cancasEditor.Editor.regTool("Bottom", new LayerEditorTool());
})();