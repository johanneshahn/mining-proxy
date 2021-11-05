/* create Worker ClassObject */
const { logger } = require('./utils.js');
const MessageBuffer = require('./MessageBuffer.js');
const JSONbig = require("json-bigint");
const { JSONRPCServer } = require("json-rpc-2.0");
let serverReceived = new MessageBuffer("\n");


class Worker {

  constructor(id, socket, pools, config) {  // Constructor
    this.id = id.toString();
    this.pools = pools;
    this.config = config;
    this.connected = Date.now();
    this.shares = 0;
    this.lastShare = 0;
    this.reject = 0;
    this.jobs = 0;
    this.lastJob = 0;
    this.isLoggedIn = false;
    this.isError = false;
    this.jobTemplate = {};
    this.jobShares = 0;
    this.jobSharesDuration = 0;
    this.hps = 0;
    this.blockStart = 0;
    this.blockTimeDuration = 60;
    this.socket = socket;
    this.jobDifficulty = 0;
    this.algo = '';
    this.socket.rpcserver = new JSONRPCServer();

    this.socket.rpcserver.addMethod("login", function(params, socket){

      logger('worker', ['login', params]);
      socket.params = params;
      let rpcId = socket.id.toString();

      //get Worker supported algos from config and set pool to worker
      if(Object.keys(socket.pools).length == 0){
        let minerAlgos = [];
        for(const miner in config){

          if(miner == params.login){
            minerAlgos = config[miner].algos;
          }
        }
        minerAlgos = 'randomx';
        for(const pool in pools){
          let poolAlgos = pools[pool].getAlgos();
          let supportsAlgo = false;
          for(const algo in poolAlgos){
            if(minerAlgos.indexOf(poolAlgos[algo]) !== -1){
              supportsAlgo = true;
              break;
            }
          }

          if(supportsAlgo){
            socket.pools[pool] = pools[pool];
            pools[pool].addWorkerSocket(socket.id, socket);
          }
        }
      }

      for(const pool in socket.pools){
        if(!socket.pools[pool].isLoggedIn() ){
                socket.pools[pool].setLoggedIn();
              socket.pools[pool].connect().then(function(){
              logger('pool', ['connect']);
              let jsonRequest =  {
                id: rpcId,
                jsonrpc: '2.0',
                method: 'login',
                params: params
              };
              socket.pools[pool].write(jsonRequest);
            });

        }else{

          let jsonRequest = socket.pools[pool].getLoginResponce();
          if(jsonRequest){
            jsonRequest.id = socket.originRpcId;
            socket.write(JSONbig.stringify(jsonRequest).toString('utf8') +"\n");
          }else{
              logger('worker', ['error: getLoginResponce']);
          }

        }
      }


    });


    this.socket.rpcserver.addMethod("getjobtemplate", function(params, socket){
        //  console.log(socket);
          logger('worker', ['getjobtemplate']);
          let rpcId = socket.id.toString();
          let jsonRequest =  {
            id: rpcId,
            jsonrpc: '2.0',
            method: 'getjobtemplate',
            params: params
          };

          for(const pool in socket.pools){
            socket.pools[pool].write(jsonRequest);
          }

    });
    this.socket.rpcserver.addMethod("status", function(params, socket){

      logger('worker', ['worker status']);
      let rpcId = socket.id.toString();
      let jsonRequest =  {
        id: rpcId,
        jsonrpc: '2.0',
        method: 'status'
      };
      for(const pool in socket.pools){
        socket.pools[pool].write(jsonRequest);
      }
    });

    this.socket.rpcserver.addMethod("submit", function(params, socket){

      logger('worker', ['submit', params]);
      let rpcId = socket.id.toString();
      for(const pool in socket.pools){
        if(socket.pools[pool].isLoggedIn()){

          let jsonRequest =  {
            id: rpcId,
            jsonrpc: '2.0',
            method: 'submit',
            params: params
          };

          socket.pools[pool].write(jsonRequest);
        }
      }
    });


    this.socket.id = id;
    this.socket.pools = {};
    this.socket.params = {};
    this.socket.isConnected = false;
    this.socket.originRpcId = 0;

    this.socket.setEncoding("utf8");
  	this.socket.on('data', function(buffer){
      this.isConnected = true;
      serverReceived.push(buffer);
      while (!serverReceived.isFinished()) {
        const message = serverReceived.handleData()
        const jsonRPCRequest = JSONbig.parse(message);
        this.originRpcId = jsonRPCRequest.id;
       // logger('worker', ['original send message', jsonRPCRequest]);


        this.rpcserver.receive(jsonRPCRequest, this).then(function(res){

          //console.log('socket on data responce', res);
        });
      }
  	});
    this.socket.on('close', function(buffer){
      for(const pool in this.pools){
        delete this.pools[pool].deleteWorkerSocket(this.id);
      }
      this.isConnected = false;
    });
    this.socket.on('error', function(buffer){
      for(const pool in this.pools){
        delete this.pools[pool].deleteWorkerSocket(this.id);
      }
      this.isError = true;
    });
  }

  errorWorker(){
    this.error = true;
  }

  countShare(worker){
    this.lastShare = Date.now();
    this.shares++;
    this.jobShares++;
  }

  countReject(worker){
    this.reject++;
  }

  countJob(worker){
    this.lastJob = Date.now();
    this.jobs++;
  }

  setJobTemplate(jobtemplate){

    if(jobtemplate && this.jobTemplate && jobtemplate.params && this.jobTemplate.params){

      if(jobtemplate.params.height != this.jobTemplate.params.height){

        let blocktime = Math.round(+new Date()/1000) - this.blockStart;
        //if shares greater 0 we know the miner is hashing on this job
        if(this.jobShares > 0){
           for(var diff in this.jobTemplate.params.difficulty){

             if(this.jobTemplate.params.difficulty[diff][0] == this.jobTemplate.params.algorithm){
               this.jobDifficulty = Number(this.jobTemplate.params.difficulty[diff][1]);
               this.algo = this.jobTemplate.params.difficulty[diff][0];
               break;
             }
           }
           this.blockTimeDuration = Math.round((this.blockTimeDuration + blocktime) / 2);
           this.jobSharesDuration = Math.round((this.jobSharesDuration + this.jobShares) / 2);
           this.hps = Math.round((this.hps + (  (this.jobDifficulty / this.blockTimeDuration) * (this.jobSharesDuration == 0 ? this.jobShares: this.jobSharesDuration)  )) / 2);


        }

        this.jobShares = 0;
        this.blockStart = Math.round(+new Date()/1000);

      }
    }else{
      this.blockStart = Math.round(+new Date()/1000);
    }

    this.jobTemplate = jobtemplate;


  }
  getJobTemplate(){
    return this.jobTemplate;
  }



}
module.exports = Worker;
