"use strict";

// Azure Functions Node v4 is the supported programming model for the managed
// API attached to an Azure Static Web App. Static Web Apps gives this function
// its normal /api prefix; staticwebapp.config.json rewrites /badge.svg here.
const { app } = require("@azure/functions");
const { response } = require("../../badge/index.cjs");

app.http("badge", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "badge",
  handler: async (request) => response(Object.fromEntries(request.query.entries())),
});
