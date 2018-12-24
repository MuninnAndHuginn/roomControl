var hue = require('node-hue-api'),
    lightState = hue.lightState;

module.exports = function() {
    class lightObject {
        constructor(api, id) {
            this.hueapi = api;
            this.id = id;
            this.lastState = {};
        }
    
        updateState() {
            console.log("Updating state for light: " + this.id);
            this.hueapi.lightStatusWithRGB(this.id, function(err, result) {
                if (err) throw err;
                this.lastState = result;
            });
        }

        getLastState() {
            return this.lastState;
        }
    
        turnOn() {
            this.hueapi.setLightState(lightId, lightState.create().on()).done();
        }

        turnOff() {
            this.hueapi.setLightState(lightId, lightState.create().off()).done();
        }

    }

    this.LightObject = lightObject;
};
