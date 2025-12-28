const { Router } = require("express");
const ProductsController = require("../controllers/products.controller");

const productsRouter = Router();

productsRouter.get("/", ProductsController.listProducts);
productsRouter.post("/", ProductsController.createProduct);
productsRouter.get("/:id", ProductsController.getProduct);
productsRouter.patch("/:id", ProductsController.updateProduct);

module.exports = { productsRouter };
