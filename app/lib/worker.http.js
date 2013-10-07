var http = {
  _request_id: 0,
  _q: {}
};

http.request = function(config) {
  var id = ++http._request_id;
  postMessage({
    type: 'http',
    id: id,
    config: config
  });

  http._q[id] = {
    success: function(cb_) {
      http._q[id]._success_cb = cb_;
    },
    error: function(cb_) {
      http._q[id]._error_cb = cb_;
    }
  };

  return http._q[id];
};

http.cb_ = function(evt) {
  if(evt.data.type === 'http') {
    if(http._q[evt.data.id]) {
      if(evt.data.error && http._q[evt.data.id]._error_cb) {
        http._q[evt.data.id]._error_cb(
          evt.data.response,
          evt.data.status);
      }
      if(evt.data.success && http._q[evt.data.id]._success_cb) {
        http._q[evt.data.id]._success_cb(
          evt.data.response,
          evt.data.status);
      }
    }
    delete http._q[evt.data.id];
  }
};

http._request_id = 0;

http._isFunction = function(value) {
  return typeof value == 'function';
}

http._isArray = function(value) {
  return toString.apply(value) == '[object Array]';
}

http._forEach = function(obj, iterator, context) {
  var key;
  if(obj) {
    if(http._isFunction(obj)){
      for (key in obj) {
        if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key);
        }
      }
    } 
    else if(obj.forEach && obj.forEach !== http._forEach) {
      obj.forEach(iterator, context);
    } 
    else if(http._isArray(obj)) {
      for(key = 0; key < obj.length; key++)
        iterator.call(context, obj[key], key);
    } 
    else {
      for(key in obj) {
        if(obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key);
        }
      }
    }
  }
  return obj;
}

http._extend = function(dst) {
  http._forEach(arguments, function(obj){
    if (obj !== dst) {
      http._forEach(obj, function(value, key){
        dst[key] = value;
      });
    }
  });
  return dst;
};


http._createShortMethods = function(names) {
  http._forEach(arguments, function(name) {
    http[name] = function(url, config) {
      return http.request(http._extend(config || {}, {
        method: name,
        url: url
      }));
    };
  });
};

http._createShortMethodsWithData = function(name) {
  http._forEach(arguments, function(name) {
    http[name] = function(url, data, config) {
      return http.request(http._extend(config || {}, {
        method: name,
        url: url,
        data: data
      }));
    };
  });
};

http._createShortMethods('get', 'delete', 'head', 'jsonp');
http._createShortMethodsWithData('post', 'put');

