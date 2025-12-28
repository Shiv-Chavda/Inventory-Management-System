const { Router } = require("express");
const MovementsController = require("../controllers/movements.controller");

const movementsRouter = Router({ mergeParams: true });

movementsRouter.get("/", MovementsController.listMovements);
movementsRouter.post("/", MovementsController.createMovement);

module.exports = { movementsRouter };
