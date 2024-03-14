
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

    // elements from login page
    const loginPage = document.querySelector("#login-page");
    const usernamePublic = document.querySelector("#login-form #username");
    const chatBtn = document.querySelector("#chat-btn");

    // elements from home page
    const homepage = document.querySelector("#homepage");
    const messageContainer = document.querySelector("#msg_cont");
    const messageInput = document.querySelector("#msg_input");
    const sendMessageBtn = document.querySelector("#send_msg_btn");
    const displayUsername = document.querySelector("#top-cont .username")

    // elements for/from join room page
    const joinRoomBtn1 = document.querySelector("#login-form #joinRoom-btn");
    

    joinRoomBtn1.addEventListener("click", () => {
        window.location = "/room";
    })


    // join public chat
    chatBtn.addEventListener("click", () => {
        if (usernamePublic.value) {
            loginPage.classList.toggle("pageActive");
            homepage.classList.toggle("pageActive");

            displayUsername.textContent = usernamePublic.value; // set username
            
            let curDate = new Date();

            // notify server of new user connection ( SERVER )
            socketConn.emit("newuser_joined_s", "\"" + usernamePublic.value + "\"" + " just connected - " + (curDate.getMonth() + 1) + "/" + curDate.getDate() + "/" + curDate.getFullYear());

        } else {
            alert("Enter Username!");
        }
    });


    // update DOM for new user connection notification ( CLIENT )
    socketConn.addEventListener("newuser_joined_c", (msg) => {

        // create new messageChild to display
        let join = document.createElement("p");
        join.classList.add("join");
        join.textContent = msg;
        
        messageContainer.appendChild(join); // add to the message display
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });


    // send messages to server
    socketConn.addEventListener("connect", () => {

        socketConn.emit("loadHistoryPublic");
    });

    // send message
    sendMessageBtn.addEventListener('click', () => {

        if (usernamePublic.value) {
            // send message to server ( SERVER )
            let curDate = new Date();

            let msg = {
                "username": username.value,
                "text": messageInput.value,
                "time": getFormattedDate(curDate),
            }

            socketConn.emit("sendMessage_s", msg);
        } else {
            alert("Enter Username!");
        }
        
    })


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


    socketConn.addEventListener("redirect", (data) => {

        window.location = data + "?param=value";
    });

}, false)