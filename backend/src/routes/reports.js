const { Router } = require("express");
const ReportsController = require("../controllers/reports.controller");

const reportsRouter = Router();

reportsRouter.get("/low-stock", ReportsController.lowStock);
reportsRouter.get("/dead-stock", ReportsController.deadStock);

module.exports = { reportsRouter };
