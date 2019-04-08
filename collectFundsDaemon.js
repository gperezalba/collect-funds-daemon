var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://piApp:password@ip:port/piDatabase";

var Web3 = require('web3');
var Tx = require('ethereumjs-tx');
var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/TOKEN"))

console.log(web3.version.api)

var contractAddress = "0x";
var contractAbi = [];
var contract = web3.eth.contract(contractAbi).at(contractAddress)
var ourWallet = "0x";
var privateKey = new Buffer('');

setInterval(() => {
  MongoClient.connect(url, { useNewUrlParser: true },  function(err, db) {
    if(err) throw err;
    var dbo = db.db("piDatabase")
    dbo.collection("").find({}, function(err, result) {
      if(err) throw err;
      for (txs in result){
        if(txs.time < Date.now()-(24*3600000)){
          var funds = contract.getBlockedFunds(txs.wallet)
          if(funds > 0){
            collectPendingFunds(txs.wallet)
          }
          dbo.collection.updateOne()
        }
      }
      console.log(result);
      db.close();
    })
  })
}, 3600000);

function collectPendingFunds(args) {
  var calldata = contract.method.getData(args)
  var rawTx = {
    nonce: '0x00',
    gasPrice: '0x100000',
    gasLimit: '0x271000',
    to: contractAddress,
    value: '0x00',
    data: calldata
  }
  var tx = new Tx(rawTx);
  tx.sign(privateKey) //o web3.eth.sign(address, dataToSign, callback)
  var serializedTx = tx.serialize();
  web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
    if(!err) console.log(hash)
  });
}
