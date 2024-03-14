
######################################## IMPORTS ########################################

import datetime
import os

from flask import (
    Flask, redirect, render_template, session, flash, url_for, request, jsonify
)
from flask_socketio import (
    SocketIO, send, emit, join_room
)



######################################## APP CONFIGURATIONS ########################################

# app configurations
app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"

# initializations
socketio = SocketIO(app)



######################################## MAIN PROGRAM ########################################

# dictionary to store all clients
users = {}
msgs = []

roomMsgs = {}

########### ROUTES ###########

@app.route("/")
def chat():
    return render_template("index.html")


@app.route("/room")
def room():
    return render_template("room.html")



########### SOCKETS ###########

### public chat ###

# load history on join chat
@socketio.on("loadHistoryPublic")
def connect():
    print()
    print(20 * "-")
    print(f"USER[{request.sid}] Connected!")
    print(20 * "-")
    print()
    for msg in msgs:
        socketio.emit("displayMessage_c", msg)

# send message
@socketio.on("sendMessage_s")
def sendMessage_s(msg):

    socketio.emit("displayMessage_c", msg)

    msgs.append(msg)

# new user join chat
@socketio.on("newuser_joined_s")
def newuser_joined_s(msg):
    socketio.emit("newuser_joined_c", msg)


### room chat ###

# join room
@socketio.on('join')
def on_join(data):

    room = int(data["room"])
    join_room(room)

    joinMsg = f"{data['username']} just connected - {data['time']}"

    if (str(room) in roomMsgs.keys()):

        for data in roomMsgs[f"{room}"]:
            socketio.emit("displayMessage_c", data, to=room)
    else:

        roomMsgs[f"{room}"] = []

    socketio.emit("newuser_joined_c", joinMsg, to=room)

# send message
@socketio.on("sendMessage_s_r")
def sendMessage_s_r(data):

    room = int(data["room"])

    roomMsgs[f"{room}"].append(data)  

    socketio.emit("displayMessage_c", data, to=room)


######################################## RUN THE PROGRAM ########################################

if __name__ == '__main__':
    socketio.run(app, "localhost", "5555", debug=True)
