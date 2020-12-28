"use strict";

if (localStorage.getItem('user') == null) {
  var user = prompt("enter your name", "guest");
} else {
  var user = localStorage.getItem('user');
  console.log(user);
}

console.log("print");
document.addEventListener('DOMContentLoaded', function () {
  //  setInterval(name, 1000);
  name();
});

function name() {
  console.log(user);
  document.querySelector('#name').innerHTML = "welcome " + user;
  localStorage.setItem('user', user);
}

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
document.addEventListener('DOMContentLoaded', function () {
  socket.on('connect', function () {
    socket.emit('userConnects', {
      'user': user
    });
  });
  socket.on("announce user", function (data) {
    var li = document.createElement('li');
    li.innerHTML = data.user;
    document.querySelector("#userList").append(li);
  });
});
socket.on('announce user disconnect', function (data) {
  var ul = document.getElementById('userList');
  var names = ul.getElementsByTagName('li');

  for (i = 0; i < names.length; i++) {
    if (names[i].innerHTML === data.user) {
      ul.removeChild(names[i]);
    }
  }
});
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#form').addEventListener('submit', function (event) {
    event.preventDefault();
    create();
  });
});

function create() {
  channel = document.querySelector('#channel').value;
  document.querySelector("#form").reset();
  var request = new XMLHttpRequest();
  request.open('POST', '/create');

  request.onload = function () {
    var response = JSON.parse(request.responseText);
    document.querySelector('#create').innerHTML = response;

    if (response.includes("this name is already used") == false) {
      go(response);
    }
  };

  var data = new FormData();
  data.append('channel', channel);
  request.send(data);
}

function go(channel) {
  socket.emit('show channels', {
    'channel': channel
  });
}

socket.on('announce channel', function (data) {
  var a = document.createElement('a');
  a.setAttribute('class', 'chat-name');
  a.setAttribute('data-page', data.channel);
  var linkText = document.createTextNode(data.channel);
  a.appendChild(linkText); //const url=`channel/${data.channel}`;

  a.href = "";
  var button = document.createElement('button');
  button.appendChild(a);
  document.querySelector("#list").append(button);
});
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#list').addEventListener('click', function (event) {
    event.preventDefault();
    rooms();
  });
});

function rooms() {
  channels = document.querySelectorAll('.chat-name');
  channels.forEach(function (channel) {
    channel.onclick = function () {
      room = channel.getAttribute('data-page');
      window["var"] = room;
      document.querySelector("#form").classList.add("hidden");
      document.querySelector("#chatRoom").classList.remove("hidden");
      document.querySelector("#list").classList.add("hidden");
      document.querySelector("#create").classList.add("hidden");
      document.querySelector("#lastRow").classList.add("hidden");
      document.querySelector("#back").classList.remove("hidden");
      document.querySelector("#mess").classList.remove("hidden");
      document.querySelector("#roomUsers").classList.remove("hidden");
      join(room);
    };
  });
}

function join(room) {
  socket.emit('join', {
    'user': user,
    'room': room
  });
}

socket.on("userJoined", function (data) {
  console.log(data);
  var li = document.createElement('li');
  li.innerHTML = data.user;
  document.querySelector("#thisRoomUsers").append(li);

  if (data.hasOwnProperty('roomInfo')) {
    console.log(data.roomInfo);
    writeHistory(data.roomInfo);
  }
});
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#chatRoom').addEventListener('submit', function (event) {
    event.preventDefault();
    sendMessage();
  });
});

function sendMessage() {
  var text = document.querySelector('#message').value;
  document.querySelector('#chatRoom').reset();
  console.log(user);
  console.log;
  console.log("mistake????heree");
  socket.emit("message", {
    'user': user,
    'text': text,
    'room': window["var"]
  });
}

socket.on("announce message", function (data) {
  console.log("message is recieved");
  var person = data.user;
  var mess = data.message;
  writeMessage(person, mess);
});

function writeMessage(id, text) {
  id = document.createTextNode(id);
  mess = document.createTextNode(text);
  var li = document.createElement('li');
  var h4 = document.createElement('h4');
  h4.appendChild(id);
  li.appendChild(mess);
  document.querySelector(".messages").append(h4);
  document.querySelector(".messages").append(li);
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#back').addEventListener('click', function (event) {
    event.preventDefault();
    back();
  });
});

function back() {
  leave();
  clearBoard();
  document.querySelector("#form").classList.remove("hidden");
  document.querySelector("#chatRoom").classList.add("hidden");
  document.querySelector("#list").classList.remove("hidden");
  document.querySelector("#create").classList.remove("hidden");
  document.querySelector("#lastRow").classList.remove("hidden");
  document.querySelector("#back").classList.add("hidden");
  document.querySelector("#roomUsers").classList.add("hidden");
  document.querySelector("#mess").classList.add("hidden");
}

function clearBoard() {
  current = document.querySelector(".messages");

  while (current.firstChild) {
    current.removeChild(current.firstChild);
  }
}

function leave() {
  console.log(user);
  socket.emit("leave", {
    'user': user,
    'room': window["var"]
  });
}

socket.on("userLeft", function (data) {
  console.log("logout");
  var ul = document.getElementById("thisRoomUsers");
  var names = ul.getElementsByTagName('li');

  for (i = 0; i < names.length; i++) {
    console.log(names[i]);

    if (names[i].innerHTML === data.user) {
      ul.removeChild(names[i]);
    }
  }
});

function writeHistory(info) {
  for (i = 0; i < info.length; i++) {
    console.log(info);
    data = info[i];
    user = data["user"];
    text = data["text"];
    user = document.createTextNode(user);
    mess = document.createTextNode(text);
    var li = document.createElement('li');
    var h4 = document.createElement('h4');
    h4.appendChild(user);
    li.appendChild(mess);
    document.querySelector(".messages").append(h4);
    document.querySelector(".messages").append(li);
  }
}