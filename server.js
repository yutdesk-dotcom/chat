const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = "users.json";
const MESSAGES_FILE = "messages.json";

// Create JSON files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]");
}

if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, "[]");
}

// =====================
// Register User
// =====================
app.post("/register", (req, res) => {
    const { username } = req.body;

    if (!username || username.trim() === "") {
        return res.status(400).json({ message: "Username required" });
    }

    const users = JSON.parse(fs.readFileSync(USERS_FILE));

    if (users.includes(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push(username);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({ message: "User registered successfully" });
});

// =====================
// Socket.io
// =====================
io.on("connection", (socket) => {
    console.log("User connected");

    // 🔥 Load old messages on refresh
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
    socket.emit("load messages", messages);

    socket.on("chat message", (msg) => {
        const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
        messages.push(msg);

        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

        io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Railway uses dynamic port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});