var hue = require("node-hue-api"), timeout = 2000;;
 
var displayBridges = function(bridge) {
    console.log("Hue Bridges Found: " + JSON.stringify(bridge));
};
 
// --------------------------
// Using a promise
//hue.nupnpSearch().then(displayBridges).done();
 
// --------------------------
// Using a callback
hue.nupnpSearch(function(err, result) {
    if (err) throw err;
    displayBridges(result);
});

//hue.upnpSearch(timeout).then(displayBridges).done();


