
//log types worker, proxy
const logTypes = ["pool"];//"proxy","proxy","pool"

exports.logger = (type, msgs) => {

  if(logTypes.includes(type)){
    for(var i=0;i < msgs.length;i++){
      console.log(type + ':', msgs[i]);
    }
  }
}
