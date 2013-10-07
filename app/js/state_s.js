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
    initial_code += '  /* Example code. Clik "Run" to execute. */\n';
    initial_code += '  $.push({\n';
    initial_code += '    foo: \'hello\',\n';
    initial_code += '    bar: \'world\'\n';
    initial_code += '  });\n';
    initial_code += '  return cb_($);\n';
    initial_code += '});';


    var state = [{
      id: 0,
      code: initial_code,
      json: [],
      dirty: true,
      error: null
    }];
    var current = 0;

    var worker = null;

    return {
      /************************************************************************/
      /* ACCESSORS                                                            */
      /************************************************************************/
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
      code: function(code) {
        state[current].code = code;
      },
      /************************************************************************/
      /* MOVES                                                                */
      /************************************************************************/
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
      /************************************************************************/
      /* IMPORT                                                               */
      /************************************************************************/
      import: function(json) {
        state[0].json = json;
        state.forEach(function(s) {
          s.dirty = true;
          s.error = null;
        });
        current = 0;
        $rootScope.$broadcast('update');
      },
      /************************************************************************/
      /* RUN                                                                  */
      /************************************************************************/
      running: function() {
        return (worker !== null);
      },
      run: function() {
        if(worker) {
          worker.terminate();
          worker = null;
          $rootScope.$broadcast('update');
        }

        worker = new Worker('js/worker.js');

        var run = {
          handlers: {},
          cid: -1,
          tasks: []
        };

        worker.onmessage = function(evt) {
          if(evt.data.type === 'log') {
            if(console && console.log)
              console.log(evt.data.message);
          }
          if(evt.data.type === 'result') {
            if(run.handlers[run.cid]) {
              if(run.cid !== evt.data.id) {
                throw new Error('Handler Mismatch ' + 
                                run.cid + ' ' + evt.data.id);
              }
              run.handlers[run.cid](null, evt.data.json);
            }
          }
          if(evt.data.type === 'http') {
            $rootScope.$apply(function() {
              if(console && console.log)
                console.log(evt.data.config.method + ' ' + evt.data.config.url);
              var q = $http(evt.data.config);
              q.success(function(data, status) {
                worker.postMessage({
                  type: 'http',
                  id: evt.data.id,
                  success: true,
                  response: data,
                  status: status
                });
              });
              q.error(function(data, status) {
                worker.postMessage({
                  type: 'http',
                  id: evt.data.id,
                  error: true,
                  response: data,
                  status: status
                });
              });
            });
          }
        };
        worker.onerror = function(evt) {
          if(console && console.log)
            console.log('ERROR [l.' + evt.lineno + ']: ' + evt.message);
          if(run.handlers[run.cid]) {
            run.handlers[run.cid](evt);
          }
        };

        state.forEach(function(s, id) {
          run.tasks.push(function(cb_) {
            if(!s.dirty) {
              if(console && console.log)
                console.log('Skipping: ' + id);
              return cb_();
            }
            else {
              if(console && console.log)
                console.log('Running: ' + id);
              run.cid = id;
              run.handlers[id] = function(err, json) {
                if(err) {
                  $rootScope.$apply(function() {
                    state[id].error = {
                      message: err.message,
                      lineno: err.lineno
                    };
                    state[id].dirty = true;
                    current = id;
                  });
                  return cb_(err);
                }
                else {
                  $rootScope.$apply(function() {
                    state[id].error = null;
                    state[id].dirty = false;
                    if(state[id+1]) {
                      state[id+1].json = json;
                    }
                    else {
                      state[id+1] = {
                        id: id+1,
                        code: def_code,
                        json: json,
                        dirty: true,
                        error: null
                      }
                    }
                    //current = id + 1;
                  });
                  $rootScope.$broadcast('update');
                  return cb_();
                }
              };

              worker.postMessage({
                type: 'run',
                state: s
              });
            }
          });
        });

        $timeout(function() {
          async.series(run.tasks, function(err) {
            delete run.handlers;
            delete run.tasks;
            $rootScope.$apply(function() {
              worker.terminate();
              worker = null;
            });
            if(!err) {
              console.log('Done!');
              console.log(state);
            }
            $rootScope.$broadcast('update');
          });
        });
      }
    };
});
