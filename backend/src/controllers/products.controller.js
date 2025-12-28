const { z } = require("zod");
const { logger } = require("../models/logger");
const Products = require("../models/products.model");

const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1).optional(),
  reorderLevel: z.number().int().nonnegative().optional()
});

const updateProductSchema = z
  .object({
    name: z.string().min(1).optional(),
    unit: z.string().min(1).optional(),
    reorderLevel: z.number().int().nonnegative().optional()
  })
  .refine((obj) => Object.keys(obj).length > 0, { message: "No fields to update" });

async function listProducts(_req, res) {
  const products = await Products.listProductsWithLastMovement();
  res.json(products);
}

async function createProduct(req, res) {
  const input = createProductSchema.parse(req.body);
  const product = await Products.createProduct(input);
  logger.info("product_created", {
    requestId: res.locals.requestId,
    productId: product.id,
    sku: product.sku
  });
  res.status(201).json(product);
}

async function getProduct(req, res) {
  const product = await Products.getProductWithMovements(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  return res.json(product);
}

async function updateProduct(req, res) {
  const input = updateProductSchema.parse(req.body);
  try {
    const product = await Products.updateProduct(req.params.id, input);
    logger.info("product_updated", {
      requestId: res.locals.requestId,
      productId: product.id
    });
    return res.json(product);
  } catch {
    logger.warn("product_update_not_found", {
      requestId: res.locals.requestId,
      productId: req.params.id
    });
    return res.status(404).json({ error: "Product not found" });
  }
}

module.exports = {
  listProducts,
  createProduct,
  getProduct,
  updateProduct
};
