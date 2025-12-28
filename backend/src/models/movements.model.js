const { prisma } = require("./db");

async function listMovements(productId) {
  return prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: 200
  });
}

async function createMovementAndAdjustStock(productId, input) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) return { kind: "not_found" };

    const delta = input.type === "IN" ? input.quantity : -input.quantity;
    const nextOnHand = product.onHand + delta;
    if (nextOnHand < 0) return { kind: "insufficient", onHand: product.onHand };

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        type: input.type,
        quantity: input.quantity,
        note: input.note
      }
    });

    const updated = await tx.product.update({
      where: { id: productId },
      data: { onHand: nextOnHand }
    });

    return { kind: "ok", movement, product: updated };
  });
}

module.exports = {
  listMovements,
  createMovementAndAdjustStock
};
