const { handle } = require("../lib/api");

module.exports = (req, res) => handle(req, res, new URL(req.url, "http://localhost"));
