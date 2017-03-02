#!flask/bin/python
from qhueroom import *
import json
from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on installed packages.
async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)
thread = None

def light_poller_thread():
    """Example of how to send server generated events to clients."""
    while True:
        socketio.sleep(5)
        lights, groups = Lights()
        socketio.emit('event',
                      {'id': 'HUE', 'data': {'lights':lights, 'groups':groups}},
                      namespace='/lights')


@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


@socketio.on('my_ping', namespace='/main')
def ping_pong():
    emit('my_pong')


@socketio.on('connect', namespace='/main')
def main_connect():
    print('Client conected to /main', request.sid)

@socketio.on('connect', namespace='/lights')
def lights_connect():
    print('Client connected to /lights', request.sid)
    global thread
    if thread is None:
        thread = socketio.start_background_task(target=light_poller_thread)


@socketio.on('disconnect', namespace='/main')
def disconnect():
    print('Client disconnected from /main', request.sid)

@socketio.on('disconnect', namespace='/lights')
def lights_disconnect():
    print('Client disconnected from /lights', request.sid)
        

if __name__ == '__main__':
    socketio.run(app, debug=True)
