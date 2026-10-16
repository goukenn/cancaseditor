"use strict";
(function () {
	//extends canvas editor with cache functionality
	// console.log("cancas editor script .... caches skip from cache.");
	// return;
	var _NS = igk.system.createNS("igk.winui.cancasEditor", {
		caches: function () {
		}
	});
	var caches = new _NS.caches();
	var src = igk.getParentScript();
	if (window.location.protocol != "https:") {
		return;
	}
	if (window.caches) {
		_NS.initApplication(function (a) {
			igk.publisher.register("sys://module/loaded", function (e) {
				// console.debug("module loaded ...");
				var t = e.target;
				var src = t.getAttribute("src");
				if (!window.caches && !src) {
					return;
				}
				var uri = new igk.system.io.URL(src);
				window.caches.open(a.settings.appCacheName).then(function (cache) {
					cache.match(uri.request).then(function (rep) {
						if (!rep) {
							igk.ajx.bindExtraData({ responseType: 'blob' });
							igk.ajx.get(uri.request, null, function (xhr) {
								if (this.isReady()) {
									cache.put(uri.request, new Response(new Blob([xhr.response], { type: 'text/javascript; charset=utf8', size: xhr.response.length })));
								}
							});
						}
					});
				});
			});
			igk.ready(function () {
				window.caches.open(a.settings.appCacheName).then(function (cache) {
					let _check = false;
					//return;
					igk.dom.html().qselect("head link, head script").each_all(function () {
						var _t = this.o.tagName.toLowerCase();
						var _src = '';
						var _k = _t == 'script' ? 'src' : 'href';
						var _mime = _t == 'script' ? 'text/javascript' : 'text/css';
						_src = this.getAttribute(_k);
						if (_src == null)
							return;
						// console.debug("try to cache : "+_src);
						if ('rel' in this.o) {
							var mimes = {
								'icon': 'image/x-icon',
								'shortcut icon': 'image/x-icon',
								'stylesheet': 'text/css',
								'canonical': 'text/css'
							};
							switch (this.o.rel) {
								case 'icon':
									_mime = 'image/x-icon';
									break;
								case 'stylesheet':
									_mime = 'text/css';
									break;
								case 'manifest':
									_mime = 'text/json';
									break;
								case 'canonical':
									return;
								case 'shortcut icon':
									_mime = this.o.type || mimes[this.o.rel];
									break;
								default:
									break;
							}
						}
						var _uri = new igk.system.io.URL(_src);
						if ((_uri.request.length == 0) || /canvas-app\.sw\.js$/.test(_uri.request)) {
							return;
						} 
						// + |
						// + | just store cache data 
						// + |
						if (src.o != this.o){ 
							// console.debug("cache "+_uri.request);
							// cache.put(_uri.request, 
							cache.match(_uri.request).then(function (rep) {
								if (!rep) {
									// console.debug("requesting:  "+_uri.request);
									igk.ajx.bindExtraData({ responseType: 'blob' });
									if (!_check){ 
										// fetch('/assets/_prj_/igk_default/Views/cancaseditor/Scripts/views/color.js', {type:"octet-stream"}).then((rep)=>{
										// 	console.log("response ", rep.headers.entries()['content-type'])
										// 	if(rep.ok && (rep.headers.entries['content-type']=='application/javascript')){
										// 		return rep.body;
										// 	}
										// 	return rep.body;
										// }).then((data)=>{
										// 	console.log("data " , data);
										// });
										_check = true;
									}
									// igk.ajx.get(_uri.request, null, function (xhr) {
									// 	if (this.isReady()) {
									// 		cache.put(_uri.request, new Response(xhr.response)); //new Blob([xhr.response], {type:_mime+'; charset=utf8', size:xhr.response.length})));
									// 	}
									// });
								}
							});
						}
					});
				});//end caching
			});//end ready
		});//end initApplication
	}
})();