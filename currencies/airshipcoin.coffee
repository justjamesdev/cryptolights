

#I'm sure this format wouldnt work w/ waves ;)#


class AIRSHIP
  constructor: ->
    @ws = null
    @socketUrl = "#ENTERWAVESAPIHERE#/inv"
    @donationAddress = ""

  start: (txCb, blockCb) ->
    @stop() if @ws
    @ws = new WebSocket @socketUrl

    @ws.onclose = =>
      setTimeout (=> @start txCb, blockCb), 1000

    @ws.onopen = =>
      @ws.send JSON.stringify op: 'unconfirmed_sub'
      @ws.send JSON.stringify op: 'blocks_sub'

    @ws.onmessage = ({data}) =>
      data = JSON.parse data
      if data.op is 'utx'
        fee = 0
        valOut = 0
        valIn = 0
        valIn += input.prev_out.value/100000000 for input in data.x.inputs
        valOut += output.value/100000000 for output in data.x.out
        fee = Math.max valIn - valOut, 0
        txCb? {
          amount: valOut
          fee: fee
          link: '#ENTERWAVESTXNLINK#/tx/' + data.x.hash
          donation: !!data.x.out.find (out) => out.addr is @donationAddress
        }
      else
        blockCb? count: data.x.nTx
    stop: ->
      @ws.close()
      @ws = null
