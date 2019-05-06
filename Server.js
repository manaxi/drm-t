#!/usr/bin/env node

(function() {
  'use strict';

  const WEBSERVER_DEFAULT_PORT = 8120;
  let port = process.env.PORT || WEBSERVER_DEFAULT_PORT;

  let secretManagement = require('./SecretManagement');
  secretManagement.tryLoadSecrets();

  const https = require('https');
  var fs = require('fs');

  let express = require('express');
  let app = express();
  const auth = require('./auth');
  app.use(auth);
  // We disable etag as it causes API calls to be cached even with Cache-Control: no-cache.
  app.disable('etag');

  // At /, we serve the website folder as static resources.
  app.use(express.static(__dirname + '/Website'));

  // At /api/catalog is the catalog API that provides data for the frontend.
  let catalogApi = require('./CatalogApi');
  app.use('/api/catalog', catalogApi.createRouter());

  // At /api/authorization is the authorization service.
  let authorizationServiceApi = require('./AuthorizationServiceApi');
  app.use('/api/authorization', authorizationServiceApi.createRouter());

  https
    .createServer(
      {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem'),
        passphrase: 'kalifas'
      },
      app
    )
    .listen(3000, function() {
      console.log(
        'Example app listening on port 3000! Go to https://localhost:3000/'
      );
    });

  console.log('Press Control+C to shut down the application.');
})();
