const mongoose = require("mongoose");
const OrderModel = require("../model/order");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const successResponse = require("../utils/successResponse");
const OrderSuccessResponse = require("../utils/OrderSuccessResponse");
const ErrorResponse = require("../utils/errorResponse");
const UUID = require("uuid");

const options = { new: true, runValidators: true };

exports.getAll = catchAsync(async (req, res, next) => {
  let finalData = await OrderModel.find();
  if (finalData.length) {
    res
      .status(200)
      .json(
        successResponse(
          finalData,
          "order fetched successfully"
        )
      );
  } else {
    res.status(400).json(successResponse(finalData, "No order found"));
  }
});

exports.FindByStatus = catchAsync(async (req, res, next) => {
  let finalData = await OrderModel.find({ status: req.body.status });
  if (finalData.length) {
    res
      .status(200)
      .json(
        successResponse(
          finalData,
          "order fetched successfully"
        )
      );
  } else {
    res.status(400).json(successResponse(finalData, "No order found"));
  }
});

exports.Create = catchAsync(async (req, res, next) => {
  const order = {
    symbol: req.body.symbol,
    order_id: UUID.v1(),
    order_tag: req.body.order_tag,
    request_quantity: req.body.quantity,
  };
  let finalData = await OrderModel.create(order);
  delete finalData._doc._id;
  res.status(200).json(successResponse(finalData, "order create success"));
});

exports.UpdateOrderById = catchAsync(async (req, res,err, next) => {
  const orderDetails = await OrderModel.findOneAndUpdate(
    {
      order_id: req.params.id,
      $expr: { $gt: [req.body.quantity, "$filled_quantity"] },
    },
    { request_quantity: req.body.quantity },
    options
  );
  if (orderDetails) {
    res.status(200).json(successResponse(orderDetails, "order update success"));
  } else {
    res.json({ statusCode: 400, message: "requested quantity is greater than filled quantity" });
  }
});

exports.GetOrderById = catchAsync(async (req, res, next) => {
  const orderDetails = await OrderModel.findOne({ order_id: req.params.id });
  if (orderDetails) {
    res.status(200).json(successResponse(orderDetails, "order fetch success"));
  } else {
    res.json({ statusCode: 400, message: "can't get requested order" });
  }
});

exports.CancelOrder = catchAsync(async (req, res, next) => {
  const orderDetails = await OrderModel.findOneAndUpdate(
    { order_id: req.params.id, status: "open" },
    { $set: { status: "cancel" } },
    options
  );
  if (orderDetails) {
    res.status(200).json(successResponse(orderDetails, "order cancel success"));
  }
  else{
  res.json({ statusCode: 400, message: "order can not be cancelled, order status must be open" });
  }
});

exports.CompleteStatus = catchAsync(async (req, res, next) => {
  const orderDetails = await OrderModel.find({
    order_id: { $in: req.body.order_ids },
  });
  res.status(200).json(OrderSuccessResponse(orderDetails));
});
