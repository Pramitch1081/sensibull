require("dotenv").config();

const express = require("express");

const app = express();
const cors = require("cors");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
var _ = require('lodash');
const winston = require("./config/winston");
const ErrorResponse = require("./utils/errorResponse");
const errorHandler = require("./utils/errorHandler");
// const authorize = require('./middleware/auth');
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const cron = require("node-cron");
const OrderModel = require("./model/order");
// const port = process.env.port || 8080;

process.env.TZ = "Asia/Kolkata";

mongoose
  .connect(process.env.mongoConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");
  })
  .catch((e) => {
    console.log("Mongodb connection error",e);
  });

app.use(cors());
app.use(
  bodyparser.urlencoded({
    limit: "3mb",
    extended: false,
  })
);
app.use(bodyparser.json({ limit: "3mb" }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
app.use(express.json());

// morgan logger
app.use(
  morgan("combined", {
    stream: winston.stream,
  })
);

// app.use(authorize);
app.use("/api/v1/order", require("./router/order"));

cron.schedule("5 * * * * *", async function () {
  console.log("running a task every minute");
  try {
    // let openStatusOrders = await OrderModel.find({ status: 'open' });
    // await Promise.all(_.map(openStatusOrders, async (e) => {
    //   let incrCount = (e.request_quantity / e.request_quantity>1000?1000:100) * 5
    //   await OrderModel.findOneAndUpdate({ _id: e._id, $expr: { $gt: ["$request_quantity", "$filled_quantity"] } }, { $inc: { "filled_quantity": incrCount } }, {
    //     new: true,
    //     runValidators: true,
    //   })
    //   await OrderModel.findOneAndUpdate({ _id: e._id, $expr: { $eq: ["$request_quantity", "$filled_quantity"] } }, { $set: { status: "complete" } });
    //   if (Math.floor(Math.random() * 10) == 10) {
    //     await OrderModel.findOneAndUpdate({ _id: e._id, $expr: { $gt: ["$request_quantity", "$filled_quantity"] } }, { $set: { status: "error" } });
    //   }
    // }))

    let openStatusOrders = await OrderModel.find({ status: 'open' });
    await Promise.all(_.map(openStatusOrders, async (e) => {
      let incrCount = (e.request_quantity / e.request_quantity>1000?1000:100) * 5
      await OrderModel.findOneAndUpdate(
        {
          _id: e._id,
          $expr: { $gt: ["$request_quantity", "$filled_quantity"] },
        },
        { $inc: { "filled_quantity": Math.floor(Math.random() * 2) } },
        {
          new: true,
          runValidators: true,
        }
      );
      await OrderModel.findOneAndUpdate(
        {
          _id: e._id,
          $expr: { $eq: ["$request_quantity", "$filled_quantity"] },
        },
        { $set: { status: "complete" } }
      );
      if (Math.floor(Math.random() * 10) == 10) {
        await OrderModel.findOneAndUpdate({ _id: e._id, $expr: { $gt: ["$request_quantity", "$filled_quantity"] } }, { $set: { status: "error" } });
      }
    }))
  } catch (err) { console.log(err); }
});

app.all("*", (req, res, next) => {
  next(new ErrorResponse(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  // apm.captureError(err);
  errorHandler(err, req, res, next);
});

app.set("port", process.env.PORT || 5000);

//node cluster
if (cluster.isMaster) {
  // Create a worker for each CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is online.");
  });
  cluster.on("exit", function (worker, code, signal) {
    console.log("worker " + worker.process.pid + " died.");
  });
} else {
  //For avoidong Heroku $PORT error
  app
    .get("/", function (request, response) {
      var result = "App is running";
      response.send(result);
    })
    .listen(app.get("port"), function () {
      console.log(
        "App is running, server is listening on port ",
        app.get("port")
      );
    });
}

module.exports = app;
