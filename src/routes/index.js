// Import controllers
const lightController = require('../controllers/lightController')

const routes = [
    {
        method: 'GET',
        url: '/api/lights',
        handler: lightController.getLights
    },
    {
        method: 'GET',
        url: '/api/lights/groups',
        handler: lightController.getGroups
    },

    {
        method: 'GET',
        url: '/api/lights/fullState',
        handler: lightController.getFullState
    },
    {
        method: 'GET',
        url: '/api/lights/light/:id',
        handler: lightController.getSingleLight
    },
    {
        method: 'GET',
        url: '/api/lights/group/:id',
        handler: lightController.getSingleGroup
    },
    {
        method: 'GET',
        url: '/api/lights/light/:id/:which(on|off)',
        handler: lightController.setSingleLightOnOff
    },
    {
        method: 'GET',
        url: '/api/lights/group/:id/:which(on|off)',
        handler: lightController.setSingleGroupOnOff
    }
]

module.exports = routes
