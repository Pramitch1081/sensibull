const cron = require("node-cron");
const axios = require("axios");
const { info } = require("../config/winston");

cron.schedule("* * * * * *", function () {
  console.log("running a task every minute");
  axios
    .get(`http://localhost:3000/api/v1/order/`)

    // Print data
    .then((response) => {
      const data = JSON.parse(JSON.stringify(response.data));
      for (let ele of data.payload.order) {
        if (ele.status == "open") {
          console.log("element:", ele);
          if (ele.request_quantity >= ele.filled_quantity) {

            if (ele.request_quantity == ele.filled_quantity) {
              axios
                .post(
                  `http://localhost:3000/api/v1/order/CompleteStatus/${ele.order_id}`
                )
                .then((response) => {
                  console.log("status change", response.data);
                })
                .catch((error) => console.log(error));
            }

            const post = {
              "filled_quantity":
                ele.filled_quantity +
                Math.floor(Math.random() * data.payload.order.length),
            };
            console.log("post:", post);
            console.log(ele.order_id);
            if(ele.request_quantity>=post.filled_quantity){ 
            axios
              .post(
                `http://localhost:3000/api/v1/order/update/${ele.order_id}`,
                post
              )
              .then((response) => {
                console.log("updated Data", response.data);
              })
              .catch((error) => console.log(error));
            }
          } else {
          }
        }
      }
      //  console.log("order:",data.payload.order)
    });
});
