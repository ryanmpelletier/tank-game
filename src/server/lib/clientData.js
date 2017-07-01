/**
 * This class made for the sake of modularity. Simply stores data for a particular connected client.
 */

class ClientData {
  constructor(id) {
    this.player = {
      screenName: undefined,
      screenWidth: undefined,
      screenHeight: undefined
    };
    this.id = id;
    this.ping = undefined;
    this.startPingTime = undefined;
    this.lastHeartbeat = new Date().getTime();
  }

}

module.exports = ClientData;