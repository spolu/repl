/*
 * Repl: editor_d.js
 *
 * Copyright (c) Stanislas Polu 2013. All rights reserved.
 *
 * @author: spolu
 *
 * @log:
 * 20131002 spolu    Creation
 */
'use strict'

//
// ### EditorCtrl
// `editor` directive controller
//
angular.module('repl.directives').controller('EditorCtrl',
  function($scope, $timeout, _state) {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    editor.setHighlightActiveLine(false);

    $scope.code = '';

    var update = function() {
      $scope.code = _state.get(_state.current()).code;
      if($scope.code !== editor.getValue()) {
        editor.setValue($scope.code);
      };
    };

    editor.getSession().on('change', function(e) {
      $timeout(function() {
        if($scope.code !== editor.getValue()) {
          $scope.$apply(function() {
            $scope.code = editor.getValue();
            _state.code($scope.code);
          });
        }
      });
    });
    
    $scope.$on('update', update);

    $scope.$on('import', function() {
      $scope.importing = true;
    });
    $scope.$on('submit', function() {
      $scope.importing = false;
    });

    /* Initial update. */
    update();
  });

//
// ## editor
//
// Directive representing the data editor
//
// ```
// @=data    {object} the current data 
// ```
//
angular.module('repl.directives').directive('editor', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: '/partials/editor_d.html',
    controller: 'EditorCtrl'
  };
});
