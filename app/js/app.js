/*
 * Repl: app.js 
 *
 * (c) Copyright Stanislas Polu 2013. All rights reserved.
 *
 * @author: spolu
 *
 * @log:
 * 20131002 spolu  Creation
 */

'use strict';

//
// ## App Module
//
angular.module('repl', ['repl.services', 
                        'repl.directives', 
                        'repl.filters']);

//
// ###  TopCtrl
// Initializations goes here as well as global objects
//
function TopCtrl($scope, $location, $rootScope, $window, $timeout, _state) {

  document.onkeydown = function(evt) {
    //console.log(evt.keyCode);
    
    /* Ctrl-R: Run */
    if(evt.keyCode === 82 &&
       (evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {
      $scope.$apply(function() {
        _state.run();
      });
      return false;
    }
  };
};

angular.module('repl.directives', []);
angular.module('repl.filters', []);
angular.module('repl.services', []);

