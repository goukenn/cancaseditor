'use strict';
(function(){
    const _NAME_= 'CancasEditorError';
    // create class
    /**
     * cancas error exception 
     * @class
     */
    function cancasError(message){
        Error.prototype.constructor.apply(this, [message]);
        Object.defineProperty(this, 'name', {value: _NAME_, enumerable:false, configurable:true, isreadonly:true}); 
        Object.defineProperty(this, 'message', {value: message, enumerable:false, configurable:true, isreadonly:true}); 
    } 
    // + | maintain chaing of cancas - will response with instanceof operator 
    cancasError.prototype = Error.prototype; 
    igk.system.createNS('igk.winui.cancasEditor.exceptions', {
        Error: cancasError,
        Exception: cancasError,
    });
})();