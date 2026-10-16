// author: C.A.D. BONDJE DOUE
// file: DocumentContainer.js
// @date: 20241229 09:59:45
// @desc: define auto document container
'use strict'; 
(function(_NS){ 
    /**
     * store cancas editor document list 
     */
    class DocumentContainer{   
        #m_list 
        #m_defs;
        /**
         * document project name
         */
        name;
        constructor(){
            this.#m_list = [];
        }
        clear(){
            this.#m_list.length = 0;
        }
        add(document){
            this.#m_list.push(document)
        }
        forEach(callback){
            return this.#m_list.forEach(callback);
        }
        get defs(){
            return this.#m_defs;
        }
    }
    const P = igk.system.createNS(_NS+".drawing2d",{}); 
    igk.appendProperties(P, { 
        DocumentContainer 
    }); 
})('igk.winui.cancasEditor');