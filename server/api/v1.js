/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

let _ = require('lodash');

let authentication = require('modules/authentication');
let yaml = require('js-yaml');
let swaggerTools = require('swagger-tools');
let fs = require('fs');
let defaultErrorHandler = require('./error-handler/defaultErrorHandler');
let apiSpec = yaml.safeLoad(fs.readFileSync('api/swagger.yaml', 'utf8'));
let authorization = require('modules/authorization');

const API_BASE_PATH = apiSpec.basePath;

let swaggerOptions = {
  controllers: [
    require('path').resolve('api/controllers')
  ]
};

function loggedInAuthorization(req, res, next) {
  if (req.user === undefined) {
    res.status(401);
    next({ message: 'Not authorized' })
  } else {
    next();
  }
}

function authorize(req, res, next) {
  if (req.swagger === undefined) return next();
  let authorizerName = req.swagger.operation['x-authorizer'] || 'simple';
  let authorizer = require(`modules/authorizers/${authorizerName}`);

  // We need to rewrite this for authorizers to work with swagger
  // TODO(filip): remove this once we move to v1 API and drop old one
  _.each(req.swagger.params, (param, key) => {
    req.params[key] = param.value;
  });
  
  authorization(authorizer, req, res, next);
}

function setup(app) {
  swaggerTools.initializeMiddleware(apiSpec, function (middleware) {
    app.use(API_BASE_PATH, loggedInAuthorization);
    app.use(middleware.swaggerMetadata());
    app.use(middleware.swaggerValidator());
    app.use(API_BASE_PATH, authorize);
    app.use(middleware.swaggerRouter(swaggerOptions));
    app.use(middleware.swaggerUi());
    app.use(defaultErrorHandler);
  });
}

module.exports = {
  setup
};