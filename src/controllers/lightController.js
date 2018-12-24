// External Dependancies
const boom = require('boom')

// Get Data Models
const Light = require('../models/Light')
// Get my 'hueapi' object from via external configuration file .hueUser.json
require('./hue-lib/localHueObject.js')()
var hue = require('node-hue-api'),
    lightState = hue.lightState;

function getLightById(id) {
    return hueapi.lightStatus(id).then((result)=>{
        console.log(result)
        singleLight = Light.parse({
            id:id,
            name:result.name,
            on:result.state.on,
            bri:result.state.bri
        })
        console.log("Return getLightById: " + singleLight)
        return singleLight
    })
}

function setLightOnOffById(id, on) {
    var state;
    if (on) {
        state = lightState.create().on()
    } else {
        state = lightState.create().off()
    }
    return hueapi.setLightState(id, state).then((result)=> {
        console.log(result)
    }).then((result)=> {
        return getLightById(id)
    })
}

function getAllLights() {
    return hueapi.getGroup(0).then((result)=>{
        console.log(result)

        promises = []

        result['lights'].forEach((id)=>{
            promises.push(getLightById(id))
        })

        return Promise.all(promises).then((values)=>{
            console.log("Return getAllLights: " + values)
            return values
        })
	})
}

// Get all lights
exports.getLights = async (req, reply) => {
    try {
        return getAllLights().then((result)=>{
            allLights = {lights: result}
            console.log("API getLights: " + JSON.stringify(allLights))
            return allLights
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get single light by ID
exports.getSingleLight = async (req, reply) => {
    try {
        const id = req.params.id
        return getLightById(id).then((result)=>{
            singleLight = result
            console.log("API getSingleLight: " + JSON.stringify(singleLight))
            return singleLight
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Set single line on/off by ID
exports.setSingleLightOnOff = async (req, reply) => {
    try {
        const id = req.params.id
        const onOff = req.params.which
        const on = ("on" == onOff)
        return setLightOnOffById(id, on).then((result)=>{
            singleLight = result
            console.log("API setSingleLightOnOff: " + JSON.stringify(singleLight))
            return singleLight
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}

