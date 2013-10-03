/*
 * Repl: viewer_d.js
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
// ### ViewerCtrl
// `viewer` directive controller
//
angular.module('repl.directives').controller('ViewerCtrl',
  function($scope, $timeout, _state) {
    var editor = ace.edit("viewer");
    editor.setTheme("ace/theme/github");
    editor.getSession().setMode("ace/mode/json");
    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    editor.setReadOnly(true);
    editor.setHighlightActiveLine(false);

    $scope.str = 'undefined';

    var update = function() {
      $scope.str = JSON.stringify(_state.get(_state.current()).json, null, 2);
      editor.setValue($scope.str);
      editor.clearSelection();
    };

    $scope.$on('update', update);

    $scope.$on('import', function() {
      $scope.importing = true;
      editor.setTheme("ace/theme/monokai");
      editor.setReadOnly(false);
    });

    $scope.$on('submit', function() {
      $scope.importing = false;
      editor.setTheme("ace/theme/github");
      editor.setReadOnly(true);
      try {
        var json = JSON.parse(editor.getValue());
        _state.import(json);
      }
      catch(err) {
        /* We revert */
        update();
      }
    });

    /* Initial update. */
    update();
  });

//
// ## viewer
//
// Directive representing the data viewer
//
// ```
// @=json    {object} the current json 
// ```
//
angular.module('repl.directives').directive('viewer', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: '/partials/viewer_d.html',
    controller: 'ViewerCtrl'
  };
});
