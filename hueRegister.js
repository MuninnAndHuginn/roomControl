'use strict';

var ip;
var description = "Sample Description";

if (process.argv.length <= 2) {
    console.log("You need to specify the IP address of the bridge.");
    process.exit();
} else if (process.argv.length > 3) {
    ip = process.argv[2];
    description = process.argv[3];
} else {
    ip = process.argv[2];
}

var HueApi = require("node-hue-api").HueApi;

function writeUserFile(host, user) {
    var fs = require("fs");
    var output = {"host":host, "user":user};
    fs.writeFileSync('.hueUser.json', output);
};

var displayUserResult = function(result) {
    console.log("Created user: " + JSON.stringify(result));

    writeUserFile(ip, JSON.stringify(result));
};

var displayError = function(err) {
    console.log(err);
};
 
var hue = new HueApi();
 
// --------------------------
// Using a promise
hue.registerUser(ip, description)
    .then(displayUserResult)
    .fail(displayError)
    .done();
 
// --------------------------
// Using a callback (with default description and auto generated username)
//hue.createUser(ip, function(err, user) {
//    if (err) throw err;
//    displayUserResult(user);
//});
