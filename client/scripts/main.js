// Script loader

var namespace = namespace || {};

(function($, window, document, undefined) {

    'use strict';
  
    // Initialise app 
    var myApp = new namespace.MyApp({ 'something' : 'here' });

    // Use functionality from module b
    myApp.moduleB.talk('Looking for a city');
  
})(jQuery, window, document);