// Module B (example)

var namespace = namespace || {};

(function($, window, document, undefined) {

    'use strict';

    namespace.ModuleB = function() {
        this.talk = function(text){
            console.log('I am ' + text);
        };
    };

})(jQuery, window, document);