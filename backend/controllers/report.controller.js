// backend/controllers/report.controller.js
const { getPrisma } = require('../config/db');
const Product = require('../models/mongo/product.model');

exports.getReports = async (req, res, next) => {
  try {
    const prisma = getPrisma();

    // SQL AGGREGATION → Daily Revenue
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") AS "date",
        SUM("total") AS "revenue"
      FROM "Order"
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") DESC;
    `;

    // MongoDB AGGREGATION → Category-wise Sales
    const categorySales = await Product.aggregate([
      { $group: { _id: "$category", totalProducts: { $sum: 1 }, avgPrice: { $avg: "$price" } } },
      { $sort: { totalProducts: -1 } }
    ]);

    res.json({
      dailyRevenue,
      categorySales
    });
  } catch (err) {
    next(err);
  }
};
