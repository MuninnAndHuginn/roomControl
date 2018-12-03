// Get my 'hueapi' object from via external configuration file .hueUser.json
require('./localHueObject.js')()
require('./lightObject.js')()
var hue = require('node-hue-api'),
    lightState = hue.lightState;

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

var displayError = function(err) {
    console.error(err);
};

function getDescription() {
    // --------------------------
    // Using a promise
    hueapi.description().then(displayResult).done();
    
    // using alias getDescription()
    //hueapi.getDescription().then(displayResult).done();
     
    // --------------------------
    // Using a callback
    //hueapi.description(function(err, config) {
    //    if (err) throw err;
    //    displayResult(config);
    //});
    
    // using alias getDescription()
    //hueapi.getDescription(function(err, config) {
    //    if (err) throw err;
    //    displayResult(config);
    //}
};

//getDescription();
//hueapi.getConfig().then(displayResult).done();
//hueapi.getVersion().then(displayResult).done();

//var resetRgbToSame = function(id, lightState) {
//    var state = lightState.create().on().rgb(lightState["state"]["rgb"]);
//    api.setLightState(id, state).then(displayResult).done();
//};

//var addRed = function(id, lightState) {
//    var rgb = lightState["state"]["rgb"];
//    rgb[0] = rgb[0]+50;
//    var state = lightState.create().on().rgb(rgb);
//    api.setLightState(id, state).then(displayResult).done();
//};

//hueapi.lights().then(displayResult).done();
//hueapi.lightStatusWithRGB(3).then(displayResult).fail(displayError).done();

//var lightId = 2;

//var toggleOnOff = function(curState) {
//    if (!curState) throw "Invalid Light State!";
//    var state;
//    if (curState["state"]["on"]) {
//        console.log("Off: " + lightId) 
//        state = lightState.create().off();
//    } else {
//        console.log("On: " + lightId)
//        state = lightState.create().on();
//    }
//    hueapi.setLightState(lightId, state).then(displayResult).done();
//};
//
//
//hueapi.lightStatusWithRGB(lightId).then(toggleOnOff).done()

var lightTwo = new LightObject(hueapi, 2);

var lastKnown = lightTwo.getLastState();
while (lastKnown == lightTwo.getLastState()) {
    lightTwo.updateState();
}
lastKnown = lightTwo.getLastState();

if (lastKnown["state"]["on"]) {
    lightTwo.turnOn();
} else {
    lightTwo.turnOff();
}
