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

function setGroupOnOffById(id, on) {
    var state;
    if (on) {
        state = lightState.create().on()
    } else {
        state = lightState.create().off()
    }
    return hueapi.setGroupLightState(id, state).then((result)=> {
        console.log(result)
    }).then((result)=> {
        return getGroupById(id)
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
            return values
        })
    })
}

function getGroupById(id) {
    return hueapi.getGroup(id).then((result)=>{
        console.log(result)

        promises = []

        result['lights'].forEach((id)=>{
            promises.push(getLightById(id))
        })

        singleGroup = {id:id, name:result.name, lights:[]}

        return Promise.all(promises).then((values)=>{
            singleGroup.lights = values
            return singleGroup
        })
    })
}

function getAllGroups() {
    return hueapi.groups().then((result)=>{
        console.log(result)

        promises = []

        for (var id in result) { 
            if (id != 0) {
                promises.push(getGroupById(id))
            }
        }

        return Promise.all(promises).then((values)=>{
            return values
        })
    })
}

function getHueState() {
    return hueapi.getFullState().then((result)=>{
        console.log(result)
        return result    
    }).then((result)=>{
        fullData = {groups: [], lights: []}

        for (var id in result.lights) {
            singleLight = Light.parse({
                id:id,
                name:result.lights[id].name,
                on:result.lights[id].state.on,
                bri:result.lights[id].state.bri
            })
            fullData.lights.push(singleLight)
        }

        for (var id in result.groups) {
            singleGroup = {
                id:id,
                lights:[],
                all_on: result.groups[id].state.all_on,
                any_on: result.groups[id].state.any_on
            }

            result.groups[id].lights.forEach((id)=>{
                singleGroup.lights.push(fullData.lights[id])
            })
            fullData.groups.push(singleGroup)
        }

        return fullData
    })
}


// Get all lights
exports.getLights = async (req, reply) => {
    try {
        return getAllLights().then((result)=>{
            allLights = {lights: result}
            console.log("API getLights: " + JSON.stringify(allLights, null, 2))
            return allLights
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get all light groups
exports.getGroups = async (req, reply) => {
    try {
        return getAllGroups().then((result)=>{
            allGroups = {groups: result}
            console.log("API getGroups: " + JSON.stringify(allGroups, null, 2))
            return allGroups
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}


// Get full state
exports.getFullState = async (req, reply) => {
    try {
        return getHueState().then((result)=>{
            fullState = result
            console.log("API getFullState: " + JSON.stringify(fullState, null, 2))
            return fullState
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
            console.log("API getSingleLight: " + JSON.stringify(singleLight, null, 2))
            return singleLight
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Get single light by ID
exports.getSingleGroup = async (req, reply) => {
    try {
        const id = req.params.id
        return getGroupById(id).then((result)=>{
            singleGroup = result
            console.log("API getSingleGroup: " + JSON.stringify(singleGroup, null, 2))
            return singleGroup
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Set single group on/off by ID
exports.setSingleLightOnOff = async (req, reply) => {
    try {
        const id = req.params.id
        const onOff = req.params.which
        const on = ("on" == onOff)
        return setLightOnOffById(id, on).then((result)=>{
            singleLight = result
            console.log("API setSingleLightOnOff: " + JSON.stringify(singleLight, null, 2))
            return singleLight
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}

// Set single group on/off by ID
exports.setSingleGroupOnOff = async (req, reply) => {
    try {
        const id = req.params.id
        const onOff = req.params.which
        const on = ("on" == onOff)
        return setGroupOnOffById(id, on).then((result)=>{
            singleGroup = result
            console.log("API setSingleGroupOnOff: " + JSON.stringify(singleGroup, null, 2))
            return singleGroup
        },
        (err)=> {
            throw err
        })
    } catch (err) {
        throw boom.boomify(err)
    }
}

