"use strict";

// Static Web Apps exposes managed Functions below /api. The static route
// rewrite keeps the public, embeddable URL as /badge.svg.
const { app } = require("@azure/functions");
const { response } = require("../../badge/index.cjs");

app.http("badge", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "badge",
  handler: async (request) => response(Object.fromEntries(request.query.entries())),
});
