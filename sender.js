var nem = require("nem-sdk").default;
const fs = require('fs')

// nis
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);

// announce
function announce(endpoint) {
  fs.readFile('./serializedTransaction', 'utf8', (err, file) => {
    var obj = file
    nem.com.requests.transaction.announce(endpoint, obj).then(function(res) {
        console.log("announced!");
    });
  });
};

announce(endpoint)
