(function(){
//define blending modes

var BLENDING = {
	"source-over":1,
	"source-in":1,
	"source-out":1,
	"source-atop":1,
	"destination-over":1,
	"destination-in":1,
	"destination-out":1,
	"destination-atop":1,
	"lighter":1,
	"copy":1,
	"xor":1,
	"multiply":1,
	"screen":1,
	"overlay":1,
	"darken":1,
	"lighten":1,
	"color-dodge":1,
	"color-burn":1,
	"hard-light":1,
	"soft-light":1,
	"difference":1,
	"exclusion":1,
	"hue":1,
	"saturation":1,
	"color":1,
	"luminosity":1
};

var L = igk.system.createNS("igk.winui.cancasEditor.enums", {
	blendings: null
} );


L.blendings = igk.defineEnum(null, BLENDING);


})();