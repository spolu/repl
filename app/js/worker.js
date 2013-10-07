var console = {
  log: function(msg) {
    postMessage({
      type: 'log',
      message: msg
    });
  }
};

importScripts('../lib/async.js');
importScripts('../lib/worker.http.js');

onmessage = function(evt) {
  if(evt.data.type === 'run') {
    var id = evt.data.state.id;
    var code = evt.data.state.code;
    var json = evt.data.state.json; // cloned by worker

    var f = eval(code);
    if(typeof f !== 'function') {
      throw new Error('Returned value not a function: ' + (typeof f));
    }

    f(json, function(json) {
      postMessage({
        type: 'result',
        id: id,
        json: json
      });
    });
  }
  if(evt.data.type === 'http') {
    http.cb_(evt);
  }
};
