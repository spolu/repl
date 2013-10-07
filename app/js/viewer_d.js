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

    /**************************************************************************/
    /* BASE UPDATE                                                            */
    /**************************************************************************/
    $scope.str = 'undefined';

    var update = function() {
      $scope.str = JSON.stringify(_state.get(_state.current()).json, null, 2);
      editor.setValue($scope.str);
      editor.clearSelection();
    };

    $scope.$on('update', update);

    /**************************************************************************/
    /* IMPORT                                                                 */
    /**************************************************************************/
    $scope.importing = false;

    $scope.$on('import', function() {
      $scope.importing = true;
      editor.setTheme("ace/theme/monokai");
      editor.setReadOnly(false);

      editor.getSession().setMode("ace/mode/json");
      $scope.mode = 'json';
      editor.setValue('[]');
    });

    $scope.$on('csv', function() {
      editor.getSession().setMode("ace/mode/text");
      $scope.mode = 'csv';
      editor.setValue('');
    });
    $scope.$on('json', function() {
      editor.getSession().setMode("ace/mode/json");
      $scope.mode = 'json';
      editor.setValue('[]');
    });

    var import_json = function(str) {
      try {
        var json = JSON.parse(str);
        _state.import(json);
      }
      catch(err) {
        /* We revert */
        update();
      }
    };

    var import_csv = function(str) {
      try {
        var lines = str.split('\n');
        var header = lines.shift().split(',');
        var json = [];
        lines.forEach(function(l) {
          var values = l.split(',');
          var tmp = {};
          values.forEach(function(v, i) {
            tmp[header[i].trim() || ('field_' + i)] = v.trim();
          });
          json.push(tmp);
        });
        _state.import(json);
      }
      catch(err) {
        /* We revert */
        update();
      }
    };

    $scope.$on('submit', function() {
      $scope.importing = false;
      editor.getSession().setMode("ace/mode/json");
      editor.setTheme("ace/theme/github");
      editor.setReadOnly(true);
      if($scope.mode === 'json') {
        import_json(editor.getValue());
      }
      if($scope.mode === 'csv') {
        import_csv(editor.getValue());
      }
      $scope.mode = 'json';
    });

    /**************************************************************************/
    /* DOWNLOAD                                                               */
    /**************************************************************************/
    var json2csv = function(obj) {
      var array = typeof obj != 'object' ? JSON.parse(obj) : obj;

      var str = '';
      var line = '';

      var head = array[0];
      for(var index in array[0]) {
        var value = index + "";
        line += '"' + value.replace(/"/g, '""') + '",';
      }
      line = line.slice(0, -1);
      str += line + '\r\n';

      for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
          var value = array[i][index] + "";
          line += '"' + value.replace(/"/g, '""') + '",';
        }
        line = line.slice(0, -1);
        str += line + '\r\n';
      }
      return str;
    };

    $scope.$on('download', function() {
      var uri = "data:text/csv;charset=utf-8," + 
        escape(json2csv(editor.getValue()));

      var downloadLink = document.createElement("a");
      downloadLink.href = uri;
      downloadLink.download = "repl_download.csv";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });

    /**************************************************************************/
    /* INITIALIZATION                                                         */
    /**************************************************************************/
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
    templateUrl: 'partials/viewer_d.html',
    controller: 'ViewerCtrl'
  };
});
