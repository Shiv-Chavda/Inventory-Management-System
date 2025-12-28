const { z } = require("zod");
const Reports = require("../models/reports.model");

async function lowStock(req, res) {
  const threshold = z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0), "Invalid threshold")
    .parse(req.query.threshold);

  if (threshold !== undefined) {
    const products = await Reports.lowStockReportByThreshold(threshold);
    return res.json(products);
  }

  const low = await Reports.lowStockReportByReorderLevel();
  return res.json(low);
}

async function deadStock(req, res) {
  const days = z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 30))
    .refine((v) => Number.isFinite(v) && v > 0, "Invalid days")
    .parse(req.query.days);

  const report = await Reports.deadStockReport(days);
  return res.json(report);
}

module.exports = {
  lowStock,
  deadStock
};
