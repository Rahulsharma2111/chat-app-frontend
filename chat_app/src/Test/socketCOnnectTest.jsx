import React from 'react'

export default function socketCOnnectTest() {
       let stompClient = null;
        let username = null;

        function connect() {
            const socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, function(frame) {
                console.log('Connected: ' + frame);

                // Subscribe to personal queue
                stompClient.subscribe('/user/queue/messages', function(message) {
                    showMessage(JSON.parse(message.body));
                });
            });
        }

        function register() {
            username = document.getElementById('username').value;
            connect();

            // Notify server about registration
            if (stompClient) {
                stompClient.send("/app/chat.register", {}, username);
            }
        }

        function sendPrivateMessage() {
            const recipient = document.getElementById('recipient').value;
            const content = document.getElementById('message').value;

            if (stompClient && username) {
                const message = {
                    from: username,
                    to: recipient,
                    content: content,
                    timestamp: new Date()
                };

                stompClient.send("/app/chat.send", {}, JSON.stringify(message));
                document.getElementById('message').value = '';
            }
        }

        function showMessage(message) {
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML += `
                <p><b>${message.from}:</b> ${message.content}
                <small>${new Date(message.timestamp).toLocaleTimeString()}</small></p>
            `;
        }

  return (
    
    <div>
      <input type="text" id="username" placeholder="Your username"/>
    <button onclick="register()">Register</button>

    <div>
        <input type="text" id="recipient" placeholder="Recipient username"/>
        <input type="text" id="message" placeholder="Your message"/>
        <button onclick="sendPrivateMessage()">Send</button>
    </div>

    <div id="messages"></div>

    </div>
  )
}
