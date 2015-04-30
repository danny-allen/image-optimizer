// Main Application

var namespace = namespace || {};

(function($, window, document, undefined) {

    'use strict';

    /**
     * MyApp constructor
     */
    namespace.MyApp = function(options){

        // Default Settings
        this.settings = {
            something: 'something'
        };

        $.extend(this.settings, options);

        this._init();
    };

    namespace.MyApp.prototype._init = function() {
        console.log('initialising!');

        // Attach modules
        namespace.MyApp.prototype.moduleA = new namespace.ModuleA();
        namespace.MyApp.prototype.moduleB = new namespace.ModuleB();

    };

})(jQuery, window, document);