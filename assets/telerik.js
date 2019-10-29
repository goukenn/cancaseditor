//
// file: igkdev telerik utility namespace for graphical interface
// author: C.A.D BONDJE DOUE
// creation : 08/07/2019

"use strict";

(function(){
    
    var telerik = window.Telerik || (window.Telerik = {});
    if (telerik._initialize){
        return;
    }
    telerik._initialize = 1;
    var _bindcss=0;
    // ipb.Telerik = {};
    function css_resolv(property, v){
        var tb = ["-webkit-", "-moz-", "-ms-", "-o-", ""];
        var s = "";
        for(var i = 0; i < tb.length; i++){
            if (i>0);
                s+=";";
            s += tb[0]+property+":"+v;
        }
        return s+";";
    };
    function each(t, c){
        if (! (t instanceof Array)){
            t = Array(t);
        }

        for(var i = 0; i < t.length ; i++){
            c.apply(t[i]);
        }
    }
    var _dialogs = [];
    //dialog box
    telerik.Dialog = function(){
        if (!_bindcss){
            var s = document.createElement('style');

            var _t = [
            ":root{ --telerik-dialogbox-background-color: indigo; }",
            ".telerik-dialogbox{ display:table; z-index: 100; top:0px; left:0px; position:fixed; width:100%; height: 100%;}",
            ".telerik-dialogbox > div{display:table-cell; vertical-align:middle; text-align:center;}",
            ".telerik-dialogbox .dialog{display:inline-block; "+
            css_resolv("user-select", "none")
            +
            "-moz-user-select:none; z-index: 10; background-color: #fefefe; border-radius: 4px;"+
            " box-shadow: #222 0 4px 24px; padding: 10px;"+
            " text-align:left; min-width: 320px; min-height:48px; }",
            ".telerik-dialogbox > div:before{content:' ';z-index:-10; top:0px; left:0px;background-color:aqua; background-color:var(--telerik-dialogbox-background-color, indigo); opacity:0.3; position:fixed; width:100%; height:100%; }",
            ".telerik-dialogbox .dialog .h-content > div:not(.action){padding:10px 0px;}"
            ];
            
            
            s.innerText = _t.join(' ');
            document.head.appendChild(s);
            _bindcss = 1;

            if ($igk){ 
                $igk(document).on("keyup", function(e){
                    if (_dialogs && (_dialogs.length> 0) && _listener){
                        _listener.keyup(_dialogs[_dialogs.length-1], e);
                    }
                });
            } 
        }
        var dial = document.createElement("div");
        var _cell = document.createElement("div");
        var _box = document.createElement("div");
        var _hbar = document.createElement("div");
        var _cbar = document.createElement("div");
        var _listener = null;
        var q = this;

        _dialogs.push(q);
        _box .setAttribute('class', 'telerik-dialogbox');
        //_box.style.display ="none"; 
    
        dial.setAttribute('class', 'dialog');
        _hbar.setAttribute('class', 'h-bar');
        _cbar.setAttribute('class', 'h-content');

        dial.appendChild(_hbar);
        dial.appendChild(_cbar);

        _cell.appendChild(dial);
        _box.appendChild(_cell);

       
        //stop background scrolling
        _box.addEventListener("wheel", function(e){                
            e.preventDefault();
            e.stopPropagation();
        });
        dial.addEventListener("click", function(e){
            var _l = _listener ;
            if (_l && ('click' in _l)){
                _l.click(q, e);
            }
        });
        this.appendClass = function(cl){
            var m = dial.className;
            var exp = "($|[\\s]?)(" + cl + "){1}($|[\\s]+)";
			var rg = new RegExp(exp, "g");
            if (rg.test(m))return;
            dial.className = [m, cl].join(" ");
        };
        this.setTitle = function(n){
            _hbar.innerHTML =  n;
        };
        this.setContent = function(n){
            _cbar.innerHTML = n;
        };
        this.setListener = function(l){
            if (l == null)
                l= new DialogListener();
            _listener = l;
        };
        this.show = function(){
            document.body.appendChild(_box);
        };
        this.hide = function(){
            _box.style.display='none';
        };
        this.close = function(){
            if (this.listener){
                this.listener.close(this);
            }
            if (_box.parentNode){
                _box.parentNode.removeChild(_box);
            }
        };
        this.querySelector = function(f){
            return _box.querySelector(f);
        };
    };


    telerik.confirm=function(n, p){
        // n : id for the dialog
        // p : properties
        // call sample : Telerik.confirm('about', {title:'About', content:'the html content data: '})
        var _dialog = new telerik.Dialog();
        _dialog.id = n;
        var _c = p.content || " ";
        _c= "<div>"+_c+"</div><div class='action'>";
        _c+= "<input type='button' class='confirm' />";
        _c+= "<input type='button' class='cancel' />";
        _c+= "</div>";
        
        
        _dialog.appendClass("confirm");
        _dialog.setTitle(p.title || " ");
        _dialog.setContent(_c);
        _dialog.setListener(p.listener || null);

        // console.debug(_dialog.querySelector("input.confirm"));

        each(_dialog.querySelector("input.confirm"), function(){
            this.value = telerik.R.__("Confirm");
            this.focus();
            // console.debug("bind config.....................");
        });
        each(_dialog.querySelector("input.cancel"), function(){
            this.value = telerik.R.__("Cancel");
        });

        _dialog.show();
    };

    telerik.showDialog = function(n, m){
        var _dialog = new telerik.Dialog();
        _dialog.id = n;
        _dialog.setContent(m);
        _dialog.setListener(null);
        _dialog.show();
    };

    // for loading resources 
    telerik.R = {
        __: function(n){
            if (n in telerik.R){
                return telerik.R.n;
            }
            return n;
        }
    };
})();


function DialogListener(){ 
    // this.click = function(t, e){
    //     t.close();
    // };
    this.keyup = function(t, e){
        if (e.keyCode == 27){
            t.close();
        }
    };
   

}

// Telerik.confirm("baseic", {
//     title: "demonstration",
//     content:'Welcome to IGKDEV\'s - Balafon CancasEditorg',
//     listener: new DialogListener()
// });