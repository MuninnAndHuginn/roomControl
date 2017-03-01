# roomControl
Smart Room Control UI using Flask/React + SocketIO

A fast and responsive UI that allows one to control smart room devices from a local webserver.

TLDR; for the quick and dirty setup, install your dependencies:

```
# (using BASH, not ZSH)
pip install virtualenv
virtualenv flask; source flask/bin/activate
pip install -r requirements.txt
pip install nodeenv # should add to requirements at some point
nodeenv node; source node/bin/activate
npm install -g webpack
npm install
webpack
python app.py
```

## Development

The entry point for the app is in `js/app.js`. The starter first UI panel React component is `js/Lights.js`.

In order to use the node and flask virtual environment applications, activate both environments.

```
# (using BASH, not ZSH)
source flask/bin/activate
source node/bin/activate
```

While developing on the frontend, run `webpack --watch` to keep re-compiling your JavaScript code.

Running `webpack` creates a file in `static/bundle.js`, which is the bundled version of your frontend code.

The "backend" here is a Flask app that loads other backend components to work with. Look in `app.py` as the starting point.

To run the application, follow the steps in the next section.

## Running the app

Make sure you are at least in the python virtualenv: activate it.

```
# (using BASH, not ZSH)
source flask/bin/activate
```

Then run the Flask app:

```
python app.py
```

## Curent Architecture

### Flask Backend
The app.py file loads dependencies from qhueroom.py and socketIO.

qhueroom.py is a collection of HUE API wrappers for dealing with lights. (This should be replaced by a more OOD.)

qhueroom.py uses the rgb_xy.py to perform some conversions from hex to xy for the API.

The app.py upon connect makes sure the background task is scheduled to query the lights via qhueroom.py and sends the data to the client.

MORE FUNCTIONALITY TO COME LATER

### React Frontend
The js/app.js file loads depencencies from React and js/Lights.js so it can load the <Lights/> object into the "tabs-1" container.

The templates/index loads depenedencies from static (including the generated React bundle.js, using webpack). It currently generates a 3 tab UI using jquery. The main.js links jquery.touchSwipe.min.js to the tab content bodies and creates swipe handlers to allow for navigation other than point+click. Backend events are currently routed by main.js. They are currently hooked to either console logging or UI tags that get clobbered by the <Lights/> React mountpoint.
