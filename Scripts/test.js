// (function(){

//     var _NS = igk.system.createNS("igk.winui.cancasEditor", {});

//     igk.system.createNS("test",{
//         exportSvg: function(){
//             var e = {
//                 mimetype: 'text/plain',
//                 name : 'project.txt'
//             };
//             var editor = _NS.getEditors()[0]; 
//             var gs = editor.getDocumentSize();
//             e.width = gs.w;
//             e.height = gs.h; 
//             var c =_NS.visitors["svg"].apply(null, [editor.list, e]);

//             console.debug(c);

//     }});
// })();
