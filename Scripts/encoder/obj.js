"use strict";

(function(){
//obj decoder : from blender

var G = igk.system.createNS("igk.winui.cancasEditor.encoder", {
"obj":function(){

}
});


var _P = igk.system.promiseCall; 

G.obj.decode = function(file, a){
	
	var P = new _P();
	if (typeof(FileReader) != 'function')
		return P;
	igk.ajx.bindHeader({
		"Content-Type":"text/plain;charset=utf-8"
	}); 
	var uri =  URL.createObjectURL(file);
	//console.debug(uri);
	igk.ajx.get(uri, null, function(xhr){
		if (this.isReady()){
			var txt = xhr.responseText;
			var o = loadObjFile(txt);
			console.debug(o);
			if(o && o.objects.length>0){
				if (a.tool.loadObjFile)
					a.tool.loadObjFile(o);
				else{
					
				}
				a.refresh();
				
			}
			P.resolve();
		}
	});
	return P;
	
};


function loadObjFile(s){
	// var s = `# Blender v2.79 (sub 0) OBJ File: 'def.blend'
// # www.blender.org
// mtllib untitled2.mtl
// o Cube
// v -0.819298 -1.730250 4.019055
// v -0.819298 -1.730250 6.019055
// v -2.819298 -1.730250 6.019055
// v -2.819298 -1.730250 4.019055
// v -0.819298 0.269750 4.019056
// v -0.819299 0.269750 6.019056
// v -2.819299 0.269750 6.019055
// v -2.819298 0.269750 4.019055
// vn 0.0000 -1.0000 0.0000
// vn 0.0000 1.0000 0.0000
// vn 1.0000 0.0000 0.0000
// vn 0.0000 -0.0000 1.0000
// vn -1.0000 -0.0000 -0.0000
// vn 0.0000 0.0000 -1.0000
// usemtl Material
// s off
// f 1//1 2//1 3//1 4//1
// f 5//2 8//2 7//2 6//2
// f 1//3 5//3 6//3 2//3
// f 2//4 6//4 7//4 3//4
// f 3//5 7//5 8//5 4//5
// f 5//6 1//6 4//6 8//6
// o Cube.001
// v 1.482385 -1.754515 -0.883337
// v 1.482385 -1.754515 1.116663
// v -0.517615 -1.754515 1.116662
// v -0.517614 -1.754515 -0.883338
// v 1.482386 0.245485 -0.883337
// v 1.482385 0.245485 1.116663
// v -0.517615 0.245485 1.116662
// v -0.517615 0.245485 -0.883337
// vn 0.0000 -1.0000 0.0000
// vn 0.0000 1.0000 0.0000
// vn 1.0000 0.0000 0.0000
// vn -0.0000 -0.0000 1.0000
// vn -1.0000 -0.0000 -0.0000
// vn 0.0000 0.0000 -1.0000
// usemtl Material.001
// s off
// f 9//7 10//7 11//7 12//7
// f 13//8 16//8 15//8 14//8
// f 9//9 13//9 14//9 10//9
// f 10//10 14//10 15//10 11//10
// f 11//11 15//11 16//11 12//11
// f 13//12 9//12 12//12 16//12
// `;
// console.debug(s);
	var o = {
		materials: [],
		objects: []
	};
	
	var lines  = s.split("\n");
	var line ='';
	var p = null;
	var facecount = 0;
	var indicecount = 0;
	var offsetface = 0;
	var offsetindice =0;
	for(var i = 0; i < lines.length; i++){
		line = lines[i].trim();
		if (line.startsWith('#')) // comment line
			continue;
			
		var cmd  = readCommand(line);
		// console.debug(cmd);
		switch(cmd){
			case 'o':
				if (!o.objects)
					o.objects = [];
				p = {
					vertices: [],
					normals: [],
					indices: [],
					id: line.split(' ').slice(1).join(' ').trim()
					
				};
				offsetface = facecount;
				offsetindice = indicecount;
				o.objects.push(p);
				break;
			case 's':
				break;
			case 'f':
				var indices = [];
				
				line.split(' ').slice(1).join(' ').trim().replace(/([0-9]+)\/\/([0-9]+)/g, function(v, o, t){
					// console.debug("index : "+ o);
					// console.debug("face : "+ o);
					indices.push(o - offsetindice-1);
				}) ;
				
				p.indices.push(indices);
				facecount++;
				break;
			case 'usemtl': // use material
				if (p){
					p.material = line.split(' ').slice(1).join(' ').trim();
				}
				break;
			case 'v': // vertext definition
				indicecount++;
				if (p){
					var pts = [];
					line.substr(1).split(' ').forEach(function(v){
						v = v.trim();
						if (v.length==0)
							return;
						pts.push(parseFloat(v));
					});
					p.vertices.push(pts);// = p.vertices.concat(pts);
				}break;
			case 'vn':
				if (p){
					var pts = [];
					line.substr(2).split(' ').forEach(function(v){
						v = v.trim();
						if (v.length==0)
							return;
						pts.push(parseFloat(v));
					});
					p.normals.push(pts);// = p.vertices.concat(pts);
				}
				break;
			case 'mtllib': //use material 
					o.materials.push(line.split(' ').slice(1).join(' ').trim());
				break;
		}
		
	}
	
	
	return o;
	
};

function readCommand(l){
	var s = '';
	l.replace(/^[^ ]+/, function(m){
		s = m;
	});
	return s;
}


// console.debug("sss: ");
// console.debug(loadObjFile(
// `# Blender v2.79 (sub 0) OBJ File: 'def.blend'
// # www.blender.org
// mtllib untitled2.mtl
// o Cube
// v -0.819298 -1.730250 4.019055
// v -0.819298 -1.730250 6.019055
// v -2.819298 -1.730250 6.019055
// v -2.819298 -1.730250 4.019055
// v -0.819298 0.269750 4.019056
// v -0.819299 0.269750 6.019056
// v -2.819299 0.269750 6.019055
// v -2.819298 0.269750 4.019055
// vn 0.0000 -1.0000 0.0000
// vn 0.0000 1.0000 0.0000
// vn 1.0000 0.0000 0.0000
// vn 0.0000 -0.0000 1.0000
// vn -1.0000 -0.0000 -0.0000
// vn 0.0000 0.0000 -1.0000
// usemtl Material
// s off
// f 1//1 2//1 3//1 4//1
// f 5//2 8//2 7//2 6//2
// f 1//3 5//3 6//3 2//3
// f 2//4 6//4 7//4 3//4
// f 3//5 7//5 8//5 4//5
// f 5//6 1//6 4//6 8//6
// o Cube.001
// v 1.482385 -1.754515 -0.883337
// v 1.482385 -1.754515 1.116663
// v -0.517615 -1.754515 1.116662
// v -0.517614 -1.754515 -0.883338
// v 1.482386 0.245485 -0.883337
// v 1.482385 0.245485 1.116663
// v -0.517615 0.245485 1.116662
// v -0.517615 0.245485 -0.883337
// vn 0.0000 -1.0000 0.0000
// vn 0.0000 1.0000 0.0000
// vn 1.0000 0.0000 0.0000
// vn -0.0000 -0.0000 1.0000
// vn -1.0000 -0.0000 -0.0000
// vn 0.0000 0.0000 -1.0000
// usemtl Material.001
// s off
// f 9//7 10//7 11//7 12//7
// f 13//8 16//8 15//8 14//8
// f 9//9 13//9 14//9 10//9
// f 10//10 14//10 15//10 11//10
// f 11//11 15//11 16//11 12//11
// f 13//12 9//12 12//12 16//12
// `
// ));



igk.system.createNS("igk.blender.utils", {
	
	openObjFile : loadObjFile
	
});

})();