/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

let serviceDiscovery = require('modules/service-discovery');
let getService = require('queryHandlers/services/GetService');
let getSlices = require('queryHandlers/slices/GetSlicesByService');
let toggleSlices = require('commands/slices/ToggleSlicesByService');
let metadata = require('commands/utils/metadata');

/**
 * GET /services?environment=a,b,c
 */
function getServices(req, res, next) {
  const environment = req.swagger.params.environment.value;

  return serviceDiscovery.getAllServices(environment).then(data => res.json(data)).catch(next);
}

/**
 * GET /services/{service}?environment=a,b,c
 */
function getServiceById(req, res, next) {
  const environment = req.swagger.params.environment.value;
  const serviceName = req.swagger.params.service.value;

  return getService({ environment, serviceName }).then(data => res.json(data)).catch(next);
}

/**
 * GET /services/{service}/slices?environment=a&active=true
 */
function getServiceSlices(req, res, next) {
  const environmentName = req.swagger.params.environment.value;
  const serviceName = req.swagger.params.service.value;
  const active = req.swagger.params.active.value;

  return getSlices({ environmentName, serviceName, active }).then(data => res.json(data)).catch(next);
}

/**
 * PUT /services/{service}/toggle
 */
function putServiceSlicesToggle(req, res, next) {
  const environmentName = req.swagger.params.environment.value;
  const serviceName = req.swagger.params.service.value;
  const user = req.user;

  return toggleSlices(metadata.addMetadata({ environmentName, serviceName, user })).then(data => res.json(data)).catch(next);
}

module.exports = {
  getServices,
  getServiceById,
  getServiceSlices,
  putServiceSlicesToggle
};
