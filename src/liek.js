const CLASS_NAME = 'liek';
const ATTRIBUTE_NAME = 'data-liek-id';
const IPFS_ADDRESS = 'http://liek.io';

const ethereumAbi = require('ethereumjs-abi');

// function encodeString(str) {
//   var utf8 = unescape(encodeURIComponent(str));

//   var arr = [];
//   for (var i = 0; i < utf8.length; i++) {
//     arr.push(utf8.charCodeAt(i).toString(16));
//   }

//   var enc = utf8.length.toString(16).padStart(64, '0') + arr.join('');
//   return enc.padEnd(enc.length + 64 - (enc.length % 64), '0');
// }

// function encodeLiekCountCall(domain, id) {
//   return `0x13d3812f00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080${encodeString(domain)}${encodeString(id)}`;
// }

function encodeLiekCountRequestBody(to, data, id) {
  return JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [{
        to,
        data
      },
      'latest'
    ],
    id
  });
}

function performLiekCountRequest(abi, url, address, domain, id) {
  const data = '0x' + ethereumAbi.simpleEncode('liekCount(string,string):(uint64)', domain, id).toString('hex');
  return fetch(url, {
    method: 'POST',
    // body: encodeLiekCountRequestBody(address, encodeLiekCountCall(domain, id), 1)
    body: encodeLiekCountRequestBody(address, data, 1)
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

    var svg = document.createElement('object');
    svg.setAttribute("type", "image/svg+xml");
    svg.setAttribute("data", "./liek.svg");
    svg.setAttribute("width", "60px");
    svg.setAttribute("height", "60px");
    button.appendChild(svg);
    
    const id = button.getAttribute(ATTRIBUTE_NAME);
    const count = await app.liekCount(domain, id);
    var liek_count_text = svg.contentDocument.getElementById("liek-count");
    liek_count_text.innerHTML = count;

    var liek_info = svg.contentDocument.getElementById("liek-info");
    liek_info.onclick = () => window.location = IPFS_ADDRESS;

    var liek_button = svg.contentDocument.getElementById("liek-button");

    var circle_button = svg.contentDocument.getElementById("circle-button");
    liek_button.onmouseenter = () => {
      circle_button.setAttribute("style", "fill:#bfecff");
      var hand = svg.contentDocument.getElementsByClassName("cls-5");
      Array.prototype.forEach.call(hand, (segment) => segment.setAttribute("style", "stroke-width:2.7px;"))

    }
    liek_button.onmouseleave = () => {
      circle_button.setAttribute("style", "fill:#ffffff");
      var hand = svg.contentDocument.getElementsByClassName("cls-5");
      Array.prototype.forEach.call(hand, (segment) => segment.setAttribute("style", "stroke-width:1.92px;"))
    }

    var circle_info = svg.contentDocument.getElementById("circle-info");
    liek_info.onmouseenter = () => circle_info.setAttribute("style", "fill:#bfecff");
    liek_info.onmouseleave = () => circle_info.setAttribute("style", "fill:#ffffff");

    if (!app.isOnline())
      return;

    const hasLieked = await app.liekCheck(domain, id);

    if (!hasLieked) {
      liek_button.onclick = async () => {
        await app.liek(domain, id);
        const currentCount = parseInt(liek_count_text.innerHTML, 10);
        const newCount = currentCount + 1;
        liek_count_text.innerHTML = newCount;
        liek_button.onclick = undefined;
      };
    }

  });
});

class App {

  async initialize() {
    this.abi = require('../contracts/bin/Liek.json');
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

    return performLiekCountRequest(this.abi, 'https://ropsten.infura.io/xfPSeLdlrTJqPuH7bdWj', this.address, domain, id);
  }

}
