const chatForn = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const socket = io();

//get username and room from URL
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
});

//join chat room
socket.emit("joinRoom" , {username , room});

//Get room and users
socket.on("roomUsers" , ({room , users})=>{
    outputRoomName(room);
    outputUsers(users);
});

//the emiting message(defined in server.js file) will be catched here / message from server
socket.on("message" , message=>{ 
    console.log(message);
    outputMessage(message);
    //every time when we get a message just scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//submission of message
chatForn.addEventListener("submit" , e=>{
    e.preventDefault(); //when you submit a form it automatically submit to a file and we want to stop that from happening so 
                        //we use 'e.preventDefault' which will prevent the default behaviour
    const msg = e.target.elements.msg.value; //fetching the message text here , from where the user is used to submit 
    socket.emit("chatMessage" , msg);//Emit message to server
    
    //clear msg from input bar
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

//output message to DOM in oreder to do so , do some DOM manipulation here
function outputMessage(message){
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

//add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//add users to DOM
function outputUsers(users){
    userList.innerHTML=`${users.map(user =>`<li>${user,username}</li>`).join("")}`;
}