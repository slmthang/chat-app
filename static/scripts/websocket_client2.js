
// function to get formatted date
const getFormattedDate = (curDate) => {
    let d = (curDate.getMonth() + 1) + "/" + curDate.getDate() + "/" + curDate.getFullYear();
    
    let y = parseInt(curDate.getHours());
    let en = ""
    
    if (y > 12) {
        y -= 12;
        en = "p.m";
    } else if (y == 0) {
        y = 12
        en = "a.m";
    } else {
        en = "a.m"
    }
    
    y += ":" + curDate.getMinutes() + " " + en;
    
    return y + " " + d
}

document.addEventListener('DOMContentLoaded', () => {
    
    // // connect user to websocket
    const socketConn = io();

    // main displays pages
    const joinRoomPage = document.querySelector("#joinRoom-page");
    const homepageRoom = document.querySelector("#homepage-room");

    // elements from room login page
    const username = document.querySelector("#joinRoom-form #username");
    const roomNumber = document.querySelector("#joinRoom-form #roomNum");
    const joinRoomBtn2 = document.querySelector("#joinRoom-form #joinRoom-btn");

    // elements from room chat page
    const room = document.querySelector("#top-cont .roomNum");
    const user = document.querySelector("#top-cont .username");
    const messageContainer = document.querySelector("#msg_cont");
    const messageInput = document.querySelector("#msg_input");
    const sendMessageBtn = document.querySelector("#send_msg_btn");


    // join room 
    joinRoomBtn2.addEventListener("click", () => {

        if (username.value && roomNumber.value) {

            joinRoomPage.classList.toggle("pageActive");
            homepageRoom.classList.toggle("pageActive");

            // update room number and username
            room.textContent = "Room: " + roomNumber.value
            user.textContent = username.value

            let curDate = new Date();

            let data = {
                "username": username.value,
                "room": roomNumber.value,
                "time": getFormattedDate(curDate),
            }

            socketConn.emit("join", data)

        } else {
            alert("Enter Username!");
        }
    })


    // update DOM for new user connection notification ( CLIENT )
    socketConn.addEventListener("newuser_joined_c", (msg) => {

        // create new messageChild to display
        let join = document.createElement("p");
        join.classList.add("join");
        join.textContent = msg;
        
        messageContainer.appendChild(join); // add to the message display
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });


    // display the new messages ( CLIENT )
    socketConn.addEventListener("displayMessage_c", (data) => {

        // create new messageChild to display
        let msg = document.createElement("p");
        msg.classList.add("text");
        msg.textContent = data["username"] + ": " + data["text"];

        // add time detail of the message
        let msgTime = document.createElement("p");
        msgTime.classList.add("time");
        msgTime.textContent = data["time"];

        // msg container to store text and time
        let msgCont = document.createElement("div");
        msgCont.classList.add("msg")

        // append
        msgCont.appendChild(msg);
        msgCont.appendChild(msgTime);
        messageContainer.appendChild(msgCont);

        messageContainer.scrollTop = messageContainer.scrollHeight; // always show the latest messages
    });

    // send message
    sendMessageBtn.addEventListener('click', () => {
        if (username.value) {
            // send message to server ( SERVER )
            let curDate = new Date();

            let msg = {
                "username": username.value,
                "text": messageInput.value,
                "room": roomNumber.value,
                "time": getFormattedDate(curDate),
            }

            socketConn.emit("sendMessage_s_r", msg);
        } else {
            alert("Enter Username!");
        }
        
    })

}, false)