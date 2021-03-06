import os

from flask import Flask, jsonify, render_template, request, url_for, session
from flask_socketio import SocketIO, emit, join_room, leave_room
import datetime 

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
channels={}
users={}
roomInfo={}
usersInRoom={}

@app.route("/")
def index():
    return render_template("index.html" )

@socketio.on("userConnects")
def connection(data):
    user=data['user']
    if users.get(request.sid) == None:
       users[request.sid]=user
       emit('announce user', {'user': user}, broadcast=True)

@socketio.on("existingChannels")
def existingChannels(data):
    savedChannels=[]
    savedUsers=[]
    for channel in channels:
        savedChannels.append(channel)
    for id in users:
        if id != request.sid:
           savedUsers.append(users[id])
    emit("existing channels",{'existing': savedChannels, 'existingUsers': savedUsers} , room=request.sid)

@socketio.on("disconnect")
def disconnect():
    user= users[request.sid]
    del users[request.sid] 
    if usersInRoom != {}:
       for room in  usersInRoom: # if disconnection happens we have to move user from room where he was;
          if usersInRoom[room] != []:
               for  obj  in usersInRoom[room]:
                  print(obj)
                  if obj['name'] == user and obj['id'] == request.sid:  # we need to know specific user who leaves  because  otherwise we might delete user in  other room(using same usernames is not prohibited)
                      usersInRoom[room].remove(obj) 
                       
                     
    print("disconnect")
    emit('announce user disconnect', {'user': user}, broadcast=True)


@socketio.on('create')
def create(data):
   channel=data['channel']
   if channels.get(channel) is not None:
        mess="this name is already used"
        emit ('answerToCreate', {'mess': mess}, room=request.sid)
   else:
        counter=len(channels)+1
        channels[channel]= counter
        emit('answerToCreate', {'channel':channel}, room=request.sid)

@socketio.on("show channels")
def show(data):
    channel=data['channel']
    emit("announce channel", {'channel': channel}, broadcast=True)


@socketio.on('join')
def on_join(data):
    user = data['user']
    room = data['room']
    uniqueUser = {
          "name" : user,
           "id"  : request.sid
    }
    if usersInRoom.get(room) != None:
        userList=usersInRoom[room]
        userList.append(uniqueUser)
    else: 
        usersInRoom[room]=[]    
        usersInRoom[room].append(uniqueUser)
    join_room(room)
    emit('userJoined', {'user': user}, room=room)

@socketio.on('getHistory')
def history(data):
    room=data['room']
    usersobj=usersInRoom[room]
    usersInfo=[]
    for obj in usersobj:
        usersInfo.append(obj['name'])
    if roomInfo.get(room)!= None:
        info=roomInfo[room]
    else: 
        info =[]
    emit('send history', { 'roomInfo': info, 'usersInfo':usersInfo}, room=request.sid) 



@socketio.on('leave')
def on_leave(data):
    print("leaves")
    user= users[request.sid]
    room = data['room']
    thisRoomUsers=usersInRoom[room]
    for obj in thisRoomUsers:
        if obj['name'] == user and obj['id'] == request.sid:
            thisRoomUsers.remove(obj)
    leave_room(room)
    emit('userLeft', {'user': user}, room=room)

   
@socketio.on('message')
def message(data):
    room=data['room']
    user = data['user']
    message= data['text']
    time=datetime.datetime.now()
    stamp=time.timestamp()

    if len(message) > 2000: # assume that string of this length is data sent from file
       info={'user' : user,
              'picture': message,
              'stamp': stamp
        }
    else:  
       info = { 'user' : user,
              'text': message,
              'stamp': stamp
    }

    if roomInfo.get(room)== None:
        textList=[]
        textList.append(info)
        roomInfo[room] = textList
    else:
        textList=roomInfo[room]
        textList.append(info)
        if len(textList) > 100:
           textList.remove[0]
    if len(message) > 2000:
        print("this is picture ")
        emit('announce message', {'user' : user ,'picture': message, 'stamp': stamp}, room=room )
    else: 
        print('this is mesage')
        emit('announce message', {'user' : user ,'message': message, 'stamp': stamp}, room=room )


