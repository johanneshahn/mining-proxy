/* create Worker ClassObject */

class Workers {

    constructor() {  // Constructor
      this.workers = {};
    }
    addWorker(id, worker){
        this.workers[id] = worker;
    }

    getWorker(id){
      return this.workers[id];
    }
    getAllWorkers(){
      return this.workers;
    }


}
module.exports = Workers;
