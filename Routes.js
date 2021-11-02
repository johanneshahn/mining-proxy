const express = require('express');
const app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));
let workers;
module.exports = function(stats, db, config) {

  app.get('/', (req, res) => {
    workers_online = stats.connectedWorkers(true);
    workers_offline = stats.connectedWorkers(false);

    for(i in workers_online ){

      for( j  in workers_offline){

        if(workers_online[i].socket.params.login == workers_offline[j].socket.params.login){

          delete workers_offline[j.toString()];

          break;
        }
      }
    }


    res.render('pages/index', {workers_online: workers_online, workers_offline: workers_offline});
  })

  app.listen(config.port, config.host,() => {
    console.log(`App listening at http://localhost:${config.port}`)
  })

}
