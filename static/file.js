

if (localStorage.getItem('user') == null){
    var user=prompt("enter your name", "guest");
}  else  {
     var user=localStorage.getItem('user');

}

const userName= user;


document.addEventListener('DOMContentLoaded',  function() {
  name()
});

function name() {
      document.querySelector('#name').innerHTML = "welcome "+ userName;
      localStorage.setItem('user', user);
}

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
document.addEventListener('DOMContentLoaded',  function() {
socket.on('connect', function() { 
socket.emit('userConnects', {'user': userName});

});

socket.on("announce user", function(data) {
    one=data.user;
    addUsers(one)
});

});

window.onload= function(){
    socket.emit("existingChannels", {'user': userName})
  
}

socket.on("existing channels", function(data){
    const existing=data.existing;
    if (existing.length>0) {
        for(i=0; i<existing.length; i++){
            singleChannel=existing[i];
            oneChannel(singleChannel)
        }
    }
    const presentUsers=data.existingUsers;
    if (presentUsers.length>0){
        for(j=0; j<presentUsers.length; j++){
            addUsers(presentUsers[j])
        }
    }

});

socket.on('announce user disconnect', function(data) {
       const ul = document.getElementById('userList');
       const names =ul.getElementsByTagName('li');
       console.log("disconnect");
       deleteOneUser(data.user, ul, names)
     
   });


document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#form').addEventListener('submit', function(event){
                          event.preventDefault()
                          create()
                });            
 });

 function create(){
     channel=document.querySelector('#channel').value;
     document.querySelector("#form").reset();
     socket.emit('create', {'channel': channel})
 }

socket.on('answerToCreate', function(data){
        if (data.hasOwnProperty('channel')){
             document.querySelector('#create').innerHTML=data.channel;
             go(data.channel);

        }else{
            document.querySelector('#create').innerHTML=data.mess;
        }

});


function go(channel) {               
socket.emit('show channels', {'channel': channel});

}

socket.on('announce channel', function(data) {
       oneChannel(data.channel)
       
  });


function oneChannel(name) {
       const a = document.createElement('a');
       a.setAttribute('class', 'chat-name');
       a.setAttribute('data-page', name);
       const linkText=document.createTextNode(name);
        a.appendChild(linkText);
       //const url=`channel/${data.channel}`;
       a.href=""; 
       const button=document.createElement('button'); 
       button.appendChild(a);
       document.querySelector("#list").append(button);




}
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#list').addEventListener('click', function(event){
                          event.preventDefault()
                          rooms()
                          
    });
});

function rooms() {
   channels= document.querySelectorAll('.chat-name');
   channels.forEach(function(channel){
       
       channel.onclick = function(){
       room= channel.getAttribute('data-page');
       window.var=room;
       forward(room)      
       }    
}); 

}


function join(room){
   
socket.emit('join', {'user': userName , 'room':room });
}

socket.on("userJoined", function(data) {
    thisRoomUser(data.user)

});
 

function thisRoomUser(user) {
   const li = document.createElement('li');
   li.innerHTML = user
   document.querySelector("#thisRoomUsers").append(li); 

}

function getHistory(room){
socket.emit('getHistory', { 'room':room });

}

socket.on("send history", function(data) {
   writeHistory(data.roomInfo)
   const users=data.usersInfo;
   console.log(users);
   users.pop(); //delete last user to avoid duplication 
       console.log(users);
    if (users.length>0){
       for(i=0; i<users.length; i++){
           thisRoomUser(users[i]);
     }
       }
});

document.addEventListener('DOMContentLoaded', function() {
document.querySelector("#file").addEventListener('change', function(event){ //sending image data as message
     
      
        var reader=new FileReader();
        reader.addEventListener('load', function(event) {
        result= event.target.result;
        document.querySelector('#chatRoom').onclick = function(event){
        event.preventDefault()
        document.querySelector('#message').innerHTML=result;
        console.log(result.length);
        sendMessage()
         
        document.querySelector('#message').innerHTML="";
      
        }
     
     });
        reader.readAsDataURL(event.target.files[0]);
         
    } );
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#chatRoom').addEventListener('submit', function(event){
                          event.preventDefault()
                          sendMessage()
                });
 });

function sendMessage() {
    console.log("seeeeend");
    const text=document.querySelector('#message').value;
    document.querySelector('#chatRoom').reset();
    socket.emit("message", {'user': userName, 'text': text, 'room': window.var});


}

socket.on("announce message", function(data) {
    console.log("message is recieved");
    const stamp=data.stamp;
    const person=data.user;
    if (data.hasOwnProperty('message')){
       const  mess=data.message;
       writeMessage(person, mess, stamp);
    }
    else{
       const pic=data.picture;
       writePicture(person, pic, stamp)
    }
}


function writeMessage(id, text, stamp) {
       id= document.createTextNode(id);
       mess=document.createTextNode(text);
       stamp=document.createTextNode(stamp);
       empty=document.createTextNode("  ");
       const li = document.createElement('li');
       const h4 = document.createElement('h4');
       h4.appendChild(id);
       h4.appendChild(empty);
       h4.appendChild(stamp);
      // var img = document.createElement('img'); 
      //  img.src =text
     //   li.appendChild(img);
       li.appendChild(mess);
       document.querySelector(".messages").append(h4); 
       document.querySelector(".messages").append(li); 

}

function writePicture(id, picture, stamp) {  //repeates above code , needs correction
       id= document.createTextNode(id);
       mess=document.createTextNode(picture);
       stamp=document.createTextNode(stamp);
       empty=document.createTextNode("  ");
       const li = document.createElement('li');
       const h4 = document.createElement('h4');
       h4.appendChild(id);
       h4.appendChild(empty);
       h4.appendChild(stamp);
       let img = document.createElement('img'); 
        img.src =picture
      li.appendChild(img);
       document.querySelector(".messages").append(h4); 
       document.querySelector(".messages").append(li); 



}

/* document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#back').addEventListener('click', function(event){
                          event.preventDefault()
                          back()
                          
    });
});

*/
function forward(room){
 
       document.querySelector("#form").classList.add("hidden");
       document.querySelector("#chatRoom").classList.remove("hidden");
       document.querySelector("#list").classList.add("hidden");
       document.querySelector("#create").classList.add("hidden");
      /* document.querySelector("#lastRow").classList.add("hidden"); */
       document.querySelector("#userTitle").classList.add("hidden");
       document.querySelector("#userList").classList.add("hidden");
       /*document.querySelector("#back").classList.remove("hidden"); */
        document.querySelector("#mess").classList.remove("hidden");
        document.querySelector("#roomUsers").classList.remove("hidden");
        join(room);
        getHistory(room);
        document.title = room;
        history.pushState({ }, room, room);

}

window.onpopstate = function() {
      document.title='main page';
      back()
  };


function back() {
       leave()
       deleteUsers()
       clearBoard()
       document.querySelector("#form").classList.remove("hidden");
       document.querySelector("#chatRoom").classList.add("hidden");
       document.querySelector("#list").classList.remove("hidden");
       document.querySelector("#create").classList.remove("hidden");
     /*  document.querySelector("#lastRow").classList.remove("hidden"); */
       document.querySelector("#userTitle").classList.remove("hidden");
       document.querySelector("#userList").classList.remove("hidden");
   /*    document.querySelector("#back").classList.add("hidden");   */
       document.querySelector("#roomUsers").classList.add("hidden");
       document.querySelector("#mess").classList.add("hidden");
       

}

function clearBoard(){
    current= document.querySelector(".messages");
        while (current.firstChild){
             current.removeChild(current.firstChild);
        }

    } 

function leave() {
 socket.emit("leave", {'user': userName,  'room': window.var});      
}

socket.on("userLeft", function(data) {
    let name = data.user
    logOutUser(name);
         
});


function logOutUser(user) {
    const ul = document.getElementById("thisRoomUsers");
    const names =ul.getElementsByTagName('li');
    deleteOneUser(user, names, ul)
     
}


function deleteOneUser (user, ul, names){
    console.log(user);
    for(i=0; i< names.length; i++) {
           if (names[i].innerHTML === user) {
               ul.removeChild(names[i]);
               break;
           }
       }


}
function deleteUsers(){
     const ul = document.getElementById("thisRoomUsers");
     console.log(ul);
     const names =ul.getElementsByTagName('li');
     console.log(names);
    if (names.length>0){
        for(i=names.length-1; i>=0; i--) {  // doing deletion backwards not to  mix things  during deletion
             console.log(names[i]);
          ul.removeChild(names[i]);
         
       }
   
    }
}

function writeHistory(info) {
    if (info.length>0) {
    for(i=0; i<info.length; i++){
            data=info[i];
            user=data["user"]
            text=data["text"]
            stamp=data["stamp"]
            user= document.createTextNode(user);
            mess=document.createTextNode(text);
            stamp=document.createTextNode(stamp);
            empty=document.createTextNode("  ");
            const li = document.createElement('li');
            const h4 = document.createElement('h4');
            h4.appendChild(user);
            h4.appendChild(empty);
            h4.appendChild(stamp);
            li.appendChild(mess);
            document.querySelector(".messages").append(h4); 
            document.querySelector(".messages").append(li)
   
      }
    }
}

function addUsers(one){
const li = document.createElement('li');
       li.innerHTML = one;
       document.querySelector("#userList").append(li); 

}