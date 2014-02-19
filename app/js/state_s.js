/*
 * Repl: state_s.js
 *
 * Copyright (c) Nitrogram 2013. All rights reserved.
 *
 * @author:  spolu
 *
 * @log:
 * 20131002 spolu    Creation
 */
'use strict'

/* Repl State Service */

//
// ### _state
// Service storing code and data state
//
angular.module('repl.services').
  factory('_state', function($rootScope, $http, $timeout) {

    var def_code = '';
    def_code += '(function($, cb_) {\n';
    def_code += '  /* Your code. */\n';
    def_code += '  \n';
    def_code += '  return cb_($);\n';
    def_code += '});';

    var initial_code = '';
    initial_code += '(function($, cb_) {\n';
    initial_code += '  /* Example code. Click "Run" to execute. */\n';
    initial_code += '  $.push({\n';
    initial_code += '    foo: \'hello\',\n';
    initial_code += '    bar: \'world\'\n';
    initial_code += '  });\n';
    initial_code += '  return cb_($);\n';
    initial_code += '});';

    var state = [{
      code: initial_code,
      json: []
    }];
    var current = 0;

    return {
      initial: function() {
        return state[0];
      },
      current: function() {
        return current;
      },
      get: function(i) {
        if(typeof i === 'undefined') {
          return state;
        }
        if(i>= 0 && i < state.length) {
          return state[i];
        }
        return null;
      },
      next: function() {
        if(current < state.length - 1)
          current++;
        $rootScope.$broadcast('update');
      },
      prev: function() {
        if(current > 0)
          current--;
        $rootScope.$broadcast('update');
      },
      code: function(code) {
        state[current].code = code;
      },
      import: function(json) {
        state = [{
          code: def_code,
          json: json
        }];
        current = 0;
        $rootScope.$broadcast('update');
      },
      run: function() {
        /* Parse the code. */
        var f = eval(state[current].code);
        if(typeof f !== 'function') {
          throw new Error('returned value not a function');
        }
        /* Copy the object entirely. */
        var json = JSON.parse(JSON.stringify(state[current].json));

        /* Execute and transition. */
        $timeout(function() {
          f(json, function(json) {
            $timeout(function() {
              $rootScope.$apply(function() {
                state = state.slice(0, ++current);
                state.push({
                  code: def_code,
                  json: json
                });
              });
              $rootScope.$broadcast('update');
            });
          });
        });

      }
    };
});
