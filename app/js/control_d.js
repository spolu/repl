/*
 * Repl: control_d.js
 *
 * Copyright (c) Nitrogram 2013. All rights reserved.
 *
 * @author: spolu
 *
 * @log:
 * 20131002 spolu    Creation
 */
'use strict'

//
// ### ControlBarCtrl
// `control` directive controller
//
angular.module('repl.directives').controller('ControlCtrl',
  function($scope, $rootScope, $timeout, _state) {
    /**************************************************************************/
    /* ACCESSORS                                                              */
    /**************************************************************************/
    $scope.current = function() {
      return _state.current() + 1;
    };
    $scope.state = function() {
      return _state.get();
    };

    /**************************************************************************/
    /* ACTIONS                                                                */
    /**************************************************************************/
    $scope.run = function() {
      _state.run();
    };
    $scope.select = function(s) {
      _state.select(s.id);
    };

    /**************************************************************************/
    /* IMPORT                                                                 */
    /**************************************************************************/
    $scope.import = function() {
      $rootScope.$broadcast('import');
      $scope.mode = 'json';
      $scope.importing = true;
    };

    $scope.submit = function() {
      $rootScope.$broadcast('submit');
      $scope.importing = false;
    };

    $scope.csv = function() {
      $rootScope.$broadcast('csv');
      $scope.mode = 'csv';
    };
    $scope.json = function() {
      $rootScope.$broadcast('json');
      $scope.mode = 'json';
    };

    /**************************************************************************/
    /* DOWNLOAD                                                               */
    /**************************************************************************/
    $scope.download = function() {
      $rootScope.$broadcast('download');
    };

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
angular.module('repl.directives').directive('control', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'partials/control_d.html',
    controller: 'ControlCtrl'
  };
});
