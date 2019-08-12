(function(){
//math function 
var _NS  = igk.system.createNS("igk.winui.cancasEditor", {});
var _Math = igk.system.createNS(_NS.fullname+".math",{});


_Math.vector2 = function(obx, oby){
	
	this.x = 0;
	this.y = 0;
	if(typeof(obx) == 'object')
		{
		this.x = obx.x || this.x;
		this.y = obx.y || this.y;
		}
};

})();