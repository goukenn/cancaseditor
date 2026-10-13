"use strict";
(function () {
    const _NS_S = ((typeof(APP_ENTRY_NAMESPACE) > 'u') ? null :  APP_ENTRY_NAMESPACE) || 'igk.winui.cancasEditor';
    //menu management
    const _NS = igk.system.createNS(_NS_S, {});
    const AC = igk.system.createNS(_NS_S + '.Actions', {});
    const { Key } = AC;
    // AC.regMenuAction('edit.undo', function (a, e) {
    //     throw new _NS.exceptions.Error('Not implement');
    // });
    // AC.regMenuAction('edit.redo', function (a, e) {
    //     throw new _NS.exceptions.Error('Not implement');
    // }); 
    // fit the current document in the window
    AC.regMenuAction('view.zoom.fit', function (a, e) {
        a.resetFitAreaZoom();
    });
    // 100% zoom
    AC.regMenuAction('view.zoom.actualsize', function (a, e) {
        a.actualSize();
    });
    /**
     * group selected element 
     */
    AC.regMenuAction('edit.group', function (a, e) {
        throw new _NS.exceptions.Error('Not implement');
    });
    const bactions = {
        'edit.group': function (a, e) {
            throw new _NS.exceptions.Error('Not implement');
        },
        'edit.ungroup': function (a, e) {
            throw new _NS.exceptions.Error('Not implement');
        },
    }; 
    AC.regMenuActions(bactions); 
})();