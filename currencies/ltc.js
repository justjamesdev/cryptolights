// Generated by CoffeeScript 2.2.0
var LTC;

LTC = class LTC {
  constructor() {
    this.ws = null;
    this.socketUrl = "wss://insight.litecore.io/socket.io/?EIO=3&transport=websocket";
    this.txApi = "https://insight.litecore.io/api/tx/";
    this.txFees = [0.000224, 0.0005];
    this.txFeeTimestamp = 0;
    this.txFeeInterval = 3000; // how often to query for a fee
    this.donationAddress = "LiVcWyeoPXNYekcdFkDr64QLG3u9G8BgLs";
  }

  start(txCb, blockCb) {
    if (this.ws) {
      this.stop();
    }
    this.ws = new WebSocket(this.socketUrl);
    this.ws.onopen = () => {
      this.ws.send('2probe');
      this.ws.send('5');
      this.ws.send('420["subscribe","sync"]');
      this.ws.send('421["subscribe","inv"]');
      this.ws.send('422["subscribe","sync"]');
      this.ws.send('424["subscribe","sync"]');
      this.ws.send('425["subscribe","inv"]');
      return this.ping = setInterval((() => {
        return this.ws.send('2');
      }), 25 * 1000);
    };
    return this.ws.onmessage = ({data}) => {
      var payload, type;
      data = data.match(/^\d+(\[.+?)$/);
      if (data) {
        [type, payload] = JSON.parse(data[1]);
        if (type === 'tx') {
          // fetch fees every now and then
          if (new Date().getTime() - this.txFeeInterval > this.txFeeTimestamp) {
            $.get(this.txApi + payload.txid, ({fees}) => {
              if (fees) {
                this.txFees.shift();
                this.txFees.push(fees);
                return this.txFeeTimestamp = new Date().getTime();
              }
            });
          }
          return typeof txCb === "function" ? txCb({
            amount: payload.valueOut,
            fee: Math.random() * Math.abs(this.txFees[0] - this.txFees[1]) + Math.min.apply(0, this.txFees),
            link: 'https://insight.litecore.io/tx/' + payload.txid,
            donation: !!payload.vout.find((vout) => {
              return Object.keys(vout)[0] === this.donationAddress;
            })
          }) : void 0;
        } else {
          return typeof blockCb === "function" ? blockCb(payload) : void 0;
        }
      }
    };
  }

  stop() {
    this.ws.close();
    clearInterval(this.ping);
    return this.ws = null;
  }

};

//# sourceMappingURL=ltc.js.map
