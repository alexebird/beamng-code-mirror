// Stream Manager Class

export default class {
  streamsRefCnt = { electrics: 1, sensors: 1 }
  gameAPI = {}

  constructor(api) {
    this.gameAPI = api
  }

  // C++ does not need to know our internal reference count, so we filter it out here
  _updateSubscriptions() {
    let reqVehStreams = []
    for (let k in this.streamsRefCnt) {
      reqVehStreams.push(k)
    }
    let subscriptions = {
      vehicles: [{ byPlayerId: 0, streams: reqVehStreams }],
      // TODO:
      //globalStreams: []
    }
    this.gameAPI.subscribeToEvents(JSON.stringify(subscriptions))
  }

  add(streams) {
    for (let i = 0; i < streams.length; ++i) {
      //console.log(`adding stream ${streams[i]} in`, this.streamsRefCnt)
      if (this.streamsRefCnt[streams[i]]) {
        this.streamsRefCnt[streams[i]] += 1
      } else {
        this.streamsRefCnt[streams[i]] = 1
      }
    }

    this._updateSubscriptions()
  }

  remove(streams) {
    for (let i = 0; i < streams.length; ++i) {
      //console.log(`removing stream ${streams[i]} from`, this.streamsRefCnt)
      if (!this.streamsRefCnt[streams[i]]) {
        //console.warn(`Asked to remove stream ${streams[i]}, but it doesn\'t exist.`)
      } else {
        if (this.streamsRefCnt[streams[i]] === 0) {
          //console.warn(`Asked to remove stream ${streams[i]} but there are already 0 references.`)
        } else {
          this.streamsRefCnt[streams[i]] -= 1
        }
      }
    }

    this._updateSubscriptions()
  }

  reset() {
    console.info(`Resetting streams references.`)
    this.streamsRefCnt = {}
  }

  resubmit() {
    this._updateSubscriptions()
  }
}
