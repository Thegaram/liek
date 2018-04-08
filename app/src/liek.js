const CLASS_NAME = 'liek';
const ATTRIBUTE_NAME = 'data-liek-id';

function encodeString(str) {
  var utf8 = unescape(encodeURIComponent(str));

  var arr = [];
  for (var i = 0; i < utf8.length; i++) {
      arr.push(utf8.charCodeAt(i).toString(16));
  }

  var enc = utf8.length.toString(16).padStart(64, "0") + arr.join("");
  return enc.padEnd(enc.length + 64 - (enc.length % 64), "0");
}

function encodeLiekCountCall(domain, id) {
  return `0x13d3812f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080${encodeString(domain)}${encodeString(id)}`;
}

function encodeLiekCountRequestBody(to, data, id) {
  return JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{
        to,
        data
      },
      "latest"
    ],
    id
  });
}

function performLiekCountRequest(url, address, domain, id) {
  return fetch(url, {
    method: 'POST',
    body: encodeLiekCountRequestBody(address, encodeLiekCountCall(domain, id), 1)
  })
  .then(res => res.json())
  .then(res => parseInt(res.result, 16));
}

window.addEventListener('load', async () => {
  const app = new App();
  await app.initialize();

  const domain = window.location.href;
  const buttons = document.getElementsByClassName(CLASS_NAME);

  Array.prototype.forEach.call(buttons, async (button) => {
    
    var top_div = document.createElement('div');
    var count_div = document.createElement('div');
    var bottom_div = document.createElement('div');
    var button_div = document.createElement('div');
    var info_div = document.createElement('div');

    button.appendChild(top_div);
    button.appendChild(bottom_div);

    top_div.appendChild(count_div);

    bottom_div.appendChild(button_div);
    bottom_div.appendChild(info_div);

    top_div.id = "top";
    count_div.id = "count";

    bottom_div.id = "bottom";
    button_div.id = "button";
    info_div.id = "info";

    button_div.innerText = "liek";
    info_div.innerText = "i";  
    
    const id = button.getAttribute(ATTRIBUTE_NAME);
    const count = await app.liekCount(domain, id);
    count_div.innerText = count;

    if (!app.isOnline())
      return;

    const hasLieked = await app.liekCheck(domain, id);

    if (!hasLieked) {
      button_div.onclick = async () => {
        await app.liek(domain, id);
        const currentCount = parseInt(count_div.innerText, 10);
        const newCount = currentCount + 1;
        count_div.innerText = newCount;
        button_div.onclick = undefined;
      };
    }   

  });
});

class App {

  async initialize() {
    this.abi = require('../../contracts/bin/Liek.json');
    this.address = '0x9bfa12b93299e4e75a812ac8957c0b8a9c3db164';

    // check if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 === 'undefined') {
      console.warn('No web3 injected');
      return;
    }

    this.web3 = new Web3(web3.currentProvider);
    this.contract = this.web3.eth.contract(this.abi).at(this.address);

    return new Promise((resolve, reject) => {
      this.web3.eth.getAccounts((error, accounts) => {
        if (error || (accounts.length == 0)){
          console.warn('Unable to fetch accounts');
        }
        else {
          this.account = accounts[0];
        }

        resolve();
      });
    });
  }

  isOnline() {
    return (typeof this.web3 !== 'undefined') && (typeof this.account !== 'undefined');
  }

  // promise handler
  ph(resolve, reject) {
    return (error, result) => {
      if (error)
        reject(error);
      else
        resolve(result);
    };
  }

  async liek(domain, id) {
    return new Promise((resolve, reject) => {
      if (!this.isOnline())
        return reject('Attempting \'liek\' without web3/account');

      this.contract.liek.sendTransaction(domain, id, { from: this.account, gas: 600000 }, this.ph(resolve, reject));
    });
  }

  liekCheck(domain, id) {
    return new Promise((resolve, reject) => {
      if (!this.isOnline())
        return reject('Attempting \'liekCheck\' without web3/account');

      this.contract.liekCheck(domain, id, { from: this.account }, this.ph(resolve, reject));
    });
  }

  liekCount(domain, id) {
    if (typeof this.web3 !== 'undefined')
    {
      return new Promise((resolve, reject) => {
        this.contract.liekCount(domain, id, this.ph(resolve, reject));
      });
    }

    return performLiekCountRequest('https://ropsten.infura.io/xfPSeLdlrTJqPuH7bdWj', this.address, domain, id);
  }

}
