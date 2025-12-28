const { z } = require("zod");
const { logger } = require("../models/logger");
const Movements = require("../models/movements.model");

const createMovementSchema = z.object({
  type: z.enum(["IN", "OUT", "DAMAGED"]),
  quantity: z.number().int().positive(),
  note: z.string().max(500).optional()
});

async function listMovements(req, res) {
  const productId = req.params.id;
  const movements = await Movements.listMovements(productId);
  res.json(movements);
}

async function createMovement(req, res) {
  const productId = req.params.id;
  const input = createMovementSchema.parse(req.body);

  const result = await Movements.createMovementAndAdjustStock(productId, input);

  if (result.kind === "not_found") return res.status(404).json({ error: "Product not found" });
  if (result.kind === "insufficient") {
    logger.warn("movement_rejected_insufficient_stock", {
      requestId: res.locals.requestId,
      productId,
      onHand: result.onHand,
      requestedQty: input.quantity,
      type: input.type
    });
    return res.status(400).json({ error: "Insufficient stock", onHand: result.onHand });
  }

  logger.info("movement_created", {
    requestId: res.locals.requestId,
    productId,
    movementId: result.movement.id,
    type: result.movement.type,
    quantity: result.movement.quantity,
    nextOnHand: result.product.onHand
  });
  return res.status(201).json(result);
}

module.exports = {
  listMovements,
  createMovement
};
