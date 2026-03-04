const socket = io();

const registerDiv = document.getElementById("register");
const chatDiv = document.getElementById("chat");
const messages = document.getElementById("messages");

let currentUser = localStorage.getItem("username");

// If already registered → show chat
if (currentUser) {
    showChat();
}

// =====================
// Register
// =====================
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

// =====================
// Show Chat
// =====================
function showChat() {
    registerDiv.style.display = "none";
    chatDiv.style.display = "block";
}

// =====================
// Send Message
// =====================
function sendMessage() {
    const input = document.getElementById("messageInput");

    if (input.value.trim() === "") return;

    const msg = {
        user: currentUser,
        text: input.value
    };

    socket.emit("chat message", msg);
    input.value = "";
}

// =====================
// Add Message To Screen
// =====================
function addMessage(msg) {
    const item = document.createElement("li");
    item.textContent = msg.user + ": " + msg.text;
    messages.appendChild(item);

    messages.scrollTop = messages.scrollHeight;
}

// =====================
// Load Old Messages
// =====================
socket.on("load messages", (msgs) => {
    messages.innerHTML = "";
    msgs.forEach(msg => {
        addMessage(msg);
    });
});

// =====================
// Receive New Message
// =====================
socket.on("chat message", (msg) => {
    addMessage(msg);
});