const cron = require("node-cron");
const OrderModel = require("../model/order");
const { info } = require("../config/winston");
const mongoose = require('mongoose');


mongoose
	.connect('mongodb://127.0.0.1:27017/sensibull', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('connected to database');
	})
	.catch(() => {
		console.log('Mongodb connection error');
	});

cron.schedule("* * * * * *", async function () {
  console.log("running a task every minute");
	try{
    let finalData = await OrderModel.findOneAndUpdate({status:'open',$where : "this.request_quantity > this.filled_quantity"},{ $inc: { "filled_quantity" : Math.floor(Math.random() * 2) } },{
		new: true,
		runValidators: true,
	});

    await OrderModel.findOneAndUpdate({status:'open', $where : "this.request_quantity == this.filled_quantity" },{$set:{status : "complete"}});
	if(Math.floor(Math.random() * 10) == 10){
    await OrderModel.findOneAndUpdate({status:'open', $where : "this.request_quantity > this.filled_quantity" },{$set:{status : "complete"}});
	}

   finaldata =JSON.parse(JSON.stringify(finalData));

  console.log(finalData);
  console.log("completed:",1);
  }catch(err){console.log(err);}
});

//node cluster

const cluster = require('node:cluster');
const http = require('node:http');
const numCPUs = require('node:os').cpus().length;
const process = require('node:process');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}