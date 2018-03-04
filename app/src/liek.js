window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
  }

  App.start((err, accounts) => {
    if (err) {
      console.log(err);
      return;
    }

    var domain = window.location.href;
    var buttons = document.getElementsByClassName('liek');

    Array.prototype.forEach.call(buttons, (button) => {
      var id = button.getAttribute('data-liek-id');

      App.liekCheck(domain, id, (error, result) => {
        if (error || result) {
          return;
        }

        button.onclick = () => {
          App.liek(domain, id);

          var currentCount = parseInt(button.innerText, 10);
          var newCount = currentCount + 1;
          button.innerText = newCount;

          button.onclick = undefined;
        };
      });

      App.liekCount(domain, id , (error, result) => {
        if (error) {
          console.error(error);
          return;
        }

        button.innerText = result;
      });
    });
  });
});


window.App = {

    start: function(callback) {
      var self = this;

      const abi = [{
        "constant": true,
        "inputs": [
          {
            "name": "domain",
            "type": "string"
          },
          {
            "name": "id",
            "type": "string"
          }
        ],
        "name": "liekCount",
        "outputs": [
          {
            "name": "",
            "type": "uint64"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "domain",
            "type": "string"
          },
          {
            "name": "id",
            "type": "string"
          }
        ],
        "name": "liekCheck",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "domain",
            "type": "string"
          },
          {
            "name": "id",
            "type": "string"
          }
        ],
        "name": "liek",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];

      const address = '0x9bfa12b93299e4e75a812ac8957c0b8a9c3db164';
      this.contract = web3.eth.contract(abi).at(address);
  
      // Get the initial account balance so it can be displayed.
      web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          alert("There was an error fetching your accounts.");
          callback(err);
          return;
        }
  
        if (accs.length == 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }

        this.account = accs[0];
        callback(null, accs);
      });
    },

    // todo
    /**
     * local call check liek volt-e már
     * domain from window-loc és user majd unique ID ad meg az oldalhoz
     * sendTran után view update global result button disabled
     * packages and enb
     */

    liek: function(domain, id) {
        this.contract.liek.sendTransaction(domain, id, {from:account, gas:600000}, function (error, result){
            console.log(result);
            
        });
    },

    liekCheck: function(domain, id, callback) {
        this.contract.liekCheck(domain, id, {from:account, gas:600000}, callback);
    },
  
    liekCount: function(domain, id, callback) {
        this.contract.liekCount(domain, id, callback);
    },  
};


