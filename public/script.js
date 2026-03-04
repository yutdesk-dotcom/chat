const socket = io();

const registerDiv = document.getElementById("register");
const chatDiv = document.getElementById("chat");
const messages = document.getElementById("messages");

let currentUser = localStorage.getItem("username");

if (currentUser) {
    showChat();
}

function register() {
    const username = document.getElementById("username").value;

    fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "User registered successfully") {
            localStorage.setItem("username", username);
            currentUser = username;
            showChat();
        } else {
            alert(data.message);
        }
    });
}

function showChat() {
    registerDiv.style.display = "none";
    chatDiv.style.display = "block";
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const msg = {
        user: currentUser,
        text: input.value
    };

    socket.emit("chat message", msg);
    input.value = "";
}

socket.on("chat message", (msg) => {
    const item = document.createElement("li");
    item.textContent = msg.user + ": " + msg.text;
    messages.appendChild(item);
});