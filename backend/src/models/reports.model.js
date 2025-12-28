const { prisma } = require("./db");

async function lowStockReportByThreshold(threshold) {
  return prisma.product.findMany({
    where: { onHand: { lt: threshold } },
    orderBy: [{ onHand: "asc" }, { name: "asc" }]
  });
}

async function lowStockReportByReorderLevel() {
  const all = await prisma.product.findMany({
    orderBy: [{ onHand: "asc" }, { name: "asc" }]
  });
  return all.filter((p) => p.onHand < p.reorderLevel);
}

async function deadStockReport(days) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const products = await prisma.product.findMany({
    where: { onHand: { gt: 0 } },
    include: {
      movements: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
      }
    }
  });

  const items = products
    .map((product) => ({
      ...product,
      lastMovementAt: (product.movements && product.movements[0] ? product.movements[0].createdAt : null) || null,
      movements: undefined
    }))
    .filter((product) => (product.lastMovementAt ? product.lastMovementAt < since : true));

  return { days, since, items };
}

module.exports = {
  lowStockReportByThreshold,
  lowStockReportByReorderLevel,
  deadStockReport
};
