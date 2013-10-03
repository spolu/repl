#!/usr/bin/env node
/*
 * Repl: repl.js
 *
 * (c) Copyright Stanislas Polu 2013. All rights reserved.
 *
 * @author: spolu
 *
 * @log:
 * 20131002 spolu   Creation
 */

/* Module dependencies */
var express = require('express');
var http = require('http');
var common = require('./lib/common.js');

var factory = common.factory;
var app = express();

//
// ### init
//
factory.log().out('Starting...');
(function() {

  /* PROXY */
  app.get( '/proxy/http_get',          require('./routes/proxy.js').http_get);
  app.get( '/proxy/https_get',         require('./routes/proxy.js').https_get);

  /* App Configuration */
  app.configure(function() {
    app.use('/', express.static(__dirname + '/app'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
  });

  var http_srv = http.createServer(app).listen(3000, '127.0.0.1');
  console.error('HTTP Server started on `http://127.0.0.1:3000`');
})();

