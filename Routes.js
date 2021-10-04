const express = require('express');
const app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
module.exports = function(stats, db, config) {

  app.get('/', (req, res) => {
     let workers = stats.connectedWorkers();
     //console.log(workers);
     res.render('pages/index', {workers: workers});
  })

  app.listen(config.port, config.host,() => {
    console.log(`App listening at http://localhost:${config.port}`)
  })

}
