const express = require('express');
const app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));
module.exports = function(stats, db, config) {

  app.get('/', (req, res) => {
     let workers = stats.connectedWorkers();
    // console.log('workers', workers);
    // res.write(JSON.stringify(workers));
    //res.setHeader('Content-Type', 'application/json');
    //res.send(JSON.stringify(workers));
    res.render('pages/index', {workers: workers});
  })

  app.listen(config.port, config.host,() => {
    console.log(`App listening at http://localhost:${config.port}`)
  })

}
