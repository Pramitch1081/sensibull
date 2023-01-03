const cron = require('node-cron');
const fs = require('fs'); 
// ...

// Remove the error.log file every twenty-first day of the month.
cron.schedule('46 14 16 * *', function() {// 46 is month 14 is hour 16 is date
    console.log('---------------------');
    console.log('Running Cron Job');
    fs.unlink('./error.log', err => {
      if (err) throw err;
      console.log('Error file successfully deleted');
    });
  });