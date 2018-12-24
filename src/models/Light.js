const schema = require("schm");

const Light = schema({
    id: Number,
    name: String,
    on: Boolean,
    bri: Number,
});

module.exports = Light;
