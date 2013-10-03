/*
 * Repl: proxy.js
 *
 * Copyright (c) Stanislas Polu 2013. All rights reserved.
 *
 * @author:  spolu
 *
 * @log:
 * 20131003 spolu    Creation
 */
var querystring = require('querystring');
var http = require('http');
var https = require('https');
var util = require('util');
var factory = require('../lib/common.js').factory;


/******************************************************************************/
/*                                  ROUTES                                    */
/******************************************************************************/
//
// ### GET /proxy/http_get
//
exports.http_get = function(req, res, next) {
  var url = req.param('url');

  factory.log().out('PROXY [HTTP GET]: ' + url);

  http.get(url, function(r) {
    res.status(r.statusCode);
    res.set(r.headers);
    r.setEncoding('utf8');
    var buf = '';
    r.on('data', function(chunk) {
      buf += chunk;
    });
    r.on('end', function() {
      res.send(buf);
    });
  }).on('error', function(err) {
    res.send(500, err.name);
  });
};

//
// ### GET /proxy/https_get
//
exports.https_get = function(req, res, next) {
  var url = req.param('url');

  factory.log().out('PROXY [HTTPS GET]: ' + url);

  https.get(url, function(r) {
    res.status(r.statusCode);
    res.set(r.headers);
    r.setEncoding('utf8');
    var buf = '';
    r.on('data', function(chunk) {
      buf += chunk;
    });
    r.on('end', function() {
      res.send(buf);
    });
  }).on('error', function(err) {
    res.send(500, err.name);
  });
};


