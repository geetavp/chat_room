document.addEventListener("DOMContentLoaded", function () {
    const socket = io(); // Ensure socket.io is loaded properly
    const app = document.querySelector(".app");

    if (!app) {
        console.error("App container not found!");
        return;
    }

    let uname;

    const joinButton = document.querySelector(".join-screen #join-user");
    const messageInput = document.querySelector(".chat-screen #message-input");
    const sendMessageButton = document.querySelector(".chat-screen #send-message");
    const exitChatButton = document.querySelector(".chat-screen #exit-chat");
    const messageContainer = document.querySelector(".chat-screen .messages");

    if (!joinButton || !messageInput || !sendMessageButton || !exitChatButton || !messageContainer) {
        console.error("One or more elements not found! Check your HTML structure.");
        return;
    }

    joinButton.addEventListener("click", function () {
        let username = document.querySelector(".join-screen #username").value.trim();
        if (username.length === 0) return;

        socket.emit("newuser", username);
        uname = username;

        document.querySelector(".join-screen").classList.remove("active");
        document.querySelector(".chat-screen").classList.add("active");
    });

    sendMessageButton.addEventListener("click", function () {
        let message = messageInput.value.trim();
        if (message.length === 0) return;

        const chatMessage = { username: uname, text: message };
        renderMessage("my", chatMessage);
        socket.emit("chat", chatMessage);

        messageInput.value = "";
        messageInput.focus(); // Keep the focus on the input box
    });

    exitChatButton.addEventListener("click", function () {
        socket.emit("exituser", uname);
        window.location.href = window.location.href; // Refresh to rejoin
    });

    socket.on("update", function (update) {
        renderMessage("update", update);
    });

    socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    // Load previous messages when a user joins
    socket.on("loadMessages", function (messages) {
        messages.forEach(function (message) {
            renderMessage("other", message);
        });
    });

    function renderMessage(type, message) {
        let el = document.createElement("div");
        if (type === "my") {
            el.classList.add("message", "my-message");
            el.innerHTML = `<div>
                <div class="name">You</div>
                <div class="text">${message.text}</div>
            </div>`;
        } else if (type === "other") {
            el.classList.add("message", "other-message");
            el.innerHTML = `<div>
                <div class="name">${message.username}</div>
                <div class="text">${message.text}</div>
            </div>`;
        } else if (type === "update") {
            el.classList.add("update");
            el.innerText = message;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight; // Scroll to the bottom
        messageInput.focus(); // Keep the input box focused
    }
});
