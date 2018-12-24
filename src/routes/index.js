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
        url: '/api/lights/:id',
        handler: lightController.getSingleLight
    },
    {
        method: 'GET',
        url: '/api/lights/:id/:which(on|off)',
        handler: lightController.setSingleLightOnOff
    }
]

module.exports = routes
