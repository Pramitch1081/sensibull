const mongoose = require("mongoose");
const UUID = require("uuid");
const orderSchema = mongoose.Schema(
  {
    order_id: {
      type: String,
      default: UUID.v1(),
    },
    order_tag: {
      type: String,
      default: "",
    },
    symbol: { type: String, required: true, minlength: 3 },
    request_quantity: { type: Number, required: true, default: 0, min: 0 },
    filled_quantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "cancel", "complete", "error"],
      default: "open",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
