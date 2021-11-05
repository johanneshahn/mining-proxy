const { logger } = require('./utils.js');
const Worker = require('./Worker.js');
const Workers = require('./Workers.js');

const Pool = require('./Pool.js');
const Proxies = require('./Proxies.js');

const config = require('./config.json');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/stats.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the stats database.');
});


const routes = require('./Routes.js');
const Stats = require('./Stats.js');
var net = require('net');
const ShortUniqueId = require('short-unique-id');
const JSONbig = require("json-bigint");

let workerSocketUid = new ShortUniqueId({
  dictionary: 'number', // the default
});


let workers = new Workers();
let pools = {};
for(const poolConfig in config.pools){
  pools[poolConfig] = new Pool(workers, config.pools[poolConfig]);
}



let stats = new Stats(db, workers);
routes(stats, db, config.app);

//split login job templates by miner type (xmrig send and receive different login and job than epic miner aso)
//todo start connection to mining server first with login data
//make recurring status calls or kkep alive calls
//log see who is sending what
//login from this proxy settings not miner settings
//create stats from workers

/* todo: login with different miners */
var server = net.createServer(function(socket) {
//  console.log(socket.remoteAddress);
  socket.id = 'w' + workerSocketUid().toString();
  let worker = new Worker(socket.id, socket, pools, config.miners);

  workers.addWorker(socket.id, worker);

});
server.listen(config.proxy.port, config.proxy.host);
