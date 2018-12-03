module.exports = function() {
    var HueApi = require("node-hue-api").HueApi;
 
    let connectData = require('./.hueUser.json');
    var host = connectData["host"],
        username = connectData["user"];
 
    this.hueapi = new HueApi(host, username, 5000);
}

