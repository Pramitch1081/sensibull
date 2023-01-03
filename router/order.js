const express = require("express");

const router = express.Router();
const orderController = require("../controller/order");

router.route("/").get(orderController.getAll);

router.route("/FindByStatus").post(orderController.FindByStatus);

router.route("/place").post(orderController.Create); //@ order place

router.route("/status-for-ids").post(orderController.CompleteStatus); //status of orders

router
  .route("/:id")
  .get(orderController.GetOrderById)
  .put(orderController.UpdateOrderById)
  .delete(orderController.CancelOrder); 
module.exports = router;
