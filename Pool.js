const { logger } = require('./utils.js');
var net = require('net');
const JSONbig = require("json-bigint");
const MessageBuffer = require('./MessageBuffer.js');
let clientReceived = new MessageBuffer("\n");

class Pool {

  constructor(workers, config) {  // Constructor


     this.config = config;


     this.socket = new net.Socket();
     this.socket.job;
     this.socket.difficulty = 0;
     this.socket.loginResponce;
     this.socket.isLoggedIn = false;
     this.socket.workerSockets = {};
     this.socket.workers = workers;
     this.socket.setEncoding("utf8");
     let job = "blabla";
     this.socket.on('close', function(e ) {
       this.isLoggedIn = false;
       delete this.job;
       delete this.loginResponce;
       logger('pool', ['Connection closed']);
     });

     this.socket.on('error', function(e) {
       this.isLoggedIn = false;
       delete this.job;
       delete this.loginResponce;
       logger('pool', ['Error connecting to node. Is node running?']);
     });

     this.socket.on('data', function(buffer) {

       clientReceived.push(buffer);
       while (!clientReceived.isFinished()) {
         const message = clientReceived.handleData()
         const jsonRPCResponse = JSONbig.parse(message);

         switch (jsonRPCResponse.method) {
           case 'submit':

             logger('debug', ['pool:submit', jsonRPCResponse]);
             if(this.isLoggedIn){
               let workerId = jsonRPCResponse.id;
               jsonRPCResponse.id = this.workerSockets[workerId] ? this.workerSockets[workerId].originRpcId : 0;

               if(jsonRPCResponse.result && ((typeof jsonRPCResponse.result == 'string' &&  jsonRPCResponse.result == 'ok') || (typeof jsonRPCResponse.result == 'object') && jsonRPCResponse.result.status == 'ok' )){

                 this.workers.getWorker(workerId).countShare();
               }else{

                 this.workers.getWorker(workerId).countReject();
               }
               //
               if(this.workerSockets[workerId]){
                  this.workerSockets[workerId].write(JSONbig.stringify(jsonRPCResponse).toString('utf8') +"\n");
               }

             }
           break;
           case 'status':

             logger('debug', ['pool:status', jsonRPCResponse]);
             if(this.isLoggedIn){
               let workerId = jsonRPCResponse.id;
               jsonRPCResponse.id = this.workerSockets[workerId].originRpcId;
               this.workerSockets[workerId].write(JSONbig.stringify(jsonRPCResponse).toString('utf8') +"\n");

             }
           break;
           case 'login':

               logger('debug', ['pool:login', jsonRPCResponse]);
               //xmrig login result


               if(jsonRPCResponse.result && ((typeof jsonRPCResponse.result == 'string' &&  jsonRPCResponse.result == 'ok') || (typeof jsonRPCResponse.result == 'object') && jsonRPCResponse.result.status == 'OK' )){

                 this.isLoggedIn = true;
                 let workerId = jsonRPCResponse.id;
                   if(workerId && this.workerSockets[workerId]){
		     jsonRPCResponse.id = this.workerSockets[workerId].originRpcId;
                     this.loginResponce = jsonRPCResponse;

                     this.workers.getWorker(workerId).isLoggedIn = true;
                     this.workerSockets[workerId].write(JSONbig.stringify(jsonRPCResponse).toString('utf8') +"\n");
                  }
               }

           break;
           case 'job':
             //xmrig job result
             logger('debug', ['pool:job', jsonRPCResponse]);
             if(this.isLoggedIn){
               if(this.job != jsonRPCResponse){
                 this.job = jsonRPCResponse;
               }



                for(const workerSocket in this.workerSockets){
                  let worker = this.workerSockets[workerSocket];
                  this.workers.getWorker(worker.id).countJob();
                  this.workers.getWorker(worker.id).setJobTemplate(this.job);
                  worker.write(JSONbig.stringify(this.job).toString('utf8') +"\n");
                }

             }

           break;

           case 'getjobtemplate':
             logger('debug', ['pool:getjobtemplate', jsonRPCResponse]);
             if(this.isLoggedIn){
               let workerId = jsonRPCResponse.id;
               if(workerId && this.workerSockets[workerId]){
                jsonRPCResponse.id = this.workerSockets[workerId].originRpcId;
                this.workerSockets[workerId].write(JSONbig.stringify(jsonRPCResponse).toString('utf8') +"\n");
               }
             }
           break;



           default:
             //console.log('unknown pool method response', jsonRPCResponse);
             let workerId = jsonRPCResponse.id;
             jsonRPCResponse.id = this.workerSockets[workerId].originRpcId;
             this.workerSockets[workerId].write(JSONbig.stringify(jsonRPCResponse).toString('utf8') +"\n");
           break
         }

       }

     });

  }

  async connect(){
    this.socket.connect(this.config.port, this.config.host, function() {

    });
  }

  write(jsonRequest){

    logger('debug', ['pool:write jsonRequest', jsonRequest]);
    this.socket.write(JSONbig.stringify(jsonRequest).toString('utf8') +"\n");
  }

  getLoginResponce(){
    return this.socket.loginResponce;
  }
  setLoggedIn(){
      this.socket.isLoggedIn = true;
  }
  isLoggedIn(){
    return this.socket.isLoggedIn;
  }
  addWorkerSocket(socketId, workerSocket){
      this.socket.workerSockets[socketId] = workerSocket;
  }
  getWorkerSocket(socketId){
    return this.socket.workerSockets[socketId];
  }
  deleteWorkerSocket(socketId){
      delete this.socket.workerSockets[socketId];
  }
  getAlgos(){
    return this.config.algos;
  }

}

module.exports = Pool;
