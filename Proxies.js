/* create Worker ClassObject */

class Proxies {

    constructor() {  // Constructor
      this.proxies = {};
    }
    addProxy(id, proxy){
        this.proxies[id] = proxy;
    }

    getProxy(id){
      return this.proxies[id];
    }
    getAllProxies(){
      return this.proxies;
    }


}
module.exports = Proxies;
