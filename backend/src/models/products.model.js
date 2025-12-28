const { prisma } = require("./db");

async function listProductsWithLastMovement() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      movements: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
      }
    }
  });

  return products.map((product) => ({
    ...product,
    lastMovementAt: (product.movements && product.movements[0] ? product.movements[0].createdAt : null) || null,
    movements: undefined
  }));
}

async function createProduct(data) {
  return prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      unit: data.unit || "unit",
      reorderLevel: typeof data.reorderLevel === "number" ? data.reorderLevel : 0
    }
  });
}

async function getProductWithMovements(id) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      movements: {
        orderBy: { createdAt: "desc" },
        take: 50
      }
    }
  });
}

async function updateProduct(id, data) {
  return prisma.product.update({
    where: { id },
    data
  });
}

module.exports = {
  listProductsWithLastMovement,
  createProduct,
  getProductWithMovements,
  updateProduct
};
