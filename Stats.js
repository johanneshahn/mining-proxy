/* create Worker ClassObject */

class Stats {

  constructor(db, workers) {  // Constructor

    this.db = db;
    this.workers = workers;
  }




  connectedWorkers(){
    let connected_workers = [];
    let workers = this.workers.getAllWorkers();


    for(const workerId in workers){
      let worker = workers[workerId.toString()];
      if(worker.socket.isConnected == true){
        connected_workers[workerId.toString()] = worker;
      }
    }

    return connected_workers;
  }
  errorWorkers(){
    let error_workers = [];
    let workers = this.workers.getAllWorkers();


    for(const workerId in workers){
      let worker = workers[workerId.toString()];
      if(worker.socket.isError == true){
        error_workers[workerId.toString()] = worker;
      }
    }

    return error_workers;
  }



}
module.exports = Stats;
