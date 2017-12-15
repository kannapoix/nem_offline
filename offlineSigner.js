var nem = require("nem-sdk").default;
const fs = require('fs')

// generate private key
if (process.argv[2] == "generate") {
  console.log("Generate address......");

  var networkId = -104;
  var rBytes = nem.crypto.nacl.randomBytes(32);
  var privateKey = nem.utils.convert.ua2hex(rBytes);
  var keyPair = nem.crypto.keyPair.create(privateKey);
  var publicKey = keyPair.publicKey.toString();
  var address = nem.model.address.toAddress(publicKey, networkId);

  console.log(privateKey);
  console.log(publicKey);
  console.log(address);

  saveAddress(address, privateKey, publicKey)

}

// import key.json
function getAddress() {
  fs.readFile('./key.json', 'utf8', (err, file) => {
    var data = JSON.parse(file);
    console.log(data);
    console.log(Object.keys(data));
  })
}

// save address to key.json
function saveAddress(address, private, public) {
  fs.readFile('./key.json', 'utf8', (err, file) => {
    var data = JSON.parse(file);
    data[address] = [private, public];
    console.log(data);
    fs.writeFile('./key.json', JSON.stringify(data), (err, file) => {
      console.log('Saved');})
  })
}

// create normal transaction
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);

function sign(common, entity) {
    if(!entity || !common) throw new Error('Missing parameter !');
    if (common.privateKey.length !== 64 && common.privateKey.length !== 66) throw new Error('Invalid private key, length must be 64 or 66 characters !');
    if (!nem.utils.helpers.isHexadecimal(common.privateKey)) throw new Error('Private key must be hexadecimal only !');
    let kp = nem.crypto.keyPair.create(nem.utils.helpers.fixPrivateKey(common.privateKey));
    let result = nem.utils.serialization.serializeTransaction(entity);
    let signature = kp.sign(result);
    let obj = {
      'data': nem.utils.convert.ua2hex(result),
      'signature': signature.toString()
    };
    return obj
}

function prepare_tx(address, recipient, amount, message) {
  fs.readFile('./key.json', 'utf8', (err, file) => {
    var data = JSON.parse(file);
    var private_key = data[address][0]
    var common = nem.model.objects.create("common")("", private_key);
    var transferTransaction = nem.model.objects.create("transferTransaction")(recipient, amount, message);
    var entity = nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, nem.model.network.data.testnet.id);
    var obj = sign(common, entity, endpoint);

    // output the serializedTransaction
    fs.writeFile('./serializedTransaction', JSON.stringify(obj));
  })
}

if (process.argv[2] == "tx"){
  var sender = process.argv[3];
  var recipient = process.argv[4];
  var amount = process.argv[5];
  var message = process.argv[6];

  prepare_tx(sender, recipient, amount, message)
}
// sender = "TA5G36CIM4CRQQX5Z7ALGP4MNW6KIKKOUHZ4JPX4"
// recipient = "TA5JGQFARU255WAK3UGPTPCYNHMD5RSFUWX7Y55E"
// amount = 10
// message = "TEST"
