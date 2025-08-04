import React, { useState, useEffect, useRef } from 'react';
import './AllContact.css';
import { Client } from '@stomp/stompjs';

const AllContact = () => {
  const userData = JSON.parse(localStorage.getItem('userData'));

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

  // Fetch all contacts
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const url = `http://localhost:8080/contacts/${userData.user_id}`;
        const response = await fetch(url);
        const result = await response.json();
        console.log("Fetched contacts:", result);
        setContacts(result.data || []);
      } catch (error) {
        console.error("Error fetching contacts", error);
      }
    };
    fetchContact();
  }, [userData.id]);

  // Fetch chat history
  const fetchChats = async (senderId, receiverId) => {
    try {
      const url = `http://localhost:8080/chats/${senderId}/${receiverId}`;
      const response = await fetch(url);
      const result = await response.json();
      console.log("Fetched chats:", result);
      setMessages(result.data || []);
    } catch (error) {
      console.error("Error fetching chats", error);
    }
  };

  // WebSocket connection
  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected');
      setIsConnected(true);

      client.subscribe('/topic/messages', message => {
        handleIncomingMessage(JSON.parse(message.body));
      });

      client.subscribe('/user/queue/messages', message => {
        handleIncomingMessage(JSON.parse(message.body));
      });

      // Register user
      const mobileNumber = String(userData?.mobileNumber);
      client.publish({
        destination: '/app/chat.register',
        body: JSON.stringify(mobileNumber)
      });
    };

    client.onStompError = frame => {
      console.error('Broker error:', frame.headers['message']);
      console.error('Details:', frame.body);
    };

    client.activate();
    socketRef.current = client;

    return () => {
      if (client) client.deactivate();
    };
  }, [userData]);

  // Send message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact || !isConnected) return;

    const newMessage = {
      from: String(userData?.id),
      to: String(selectedContact.contactId),
      content: messageInput,
      timestamp: new Date().toISOString()
    };

    socketRef.current.publish({
      destination: "/app/chat.private.send",
      body: JSON.stringify(newMessage)
    });

    setMessages(prev => [...prev, { ...newMessage, isSent: true }]);

    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.contactId === selectedContact.contactId
          ? { ...contact, lastMessage: messageInput, time: 'Just now', unread: 0 }
          : contact
      )
    );

    setMessageInput('');
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming messages
  const handleIncomingMessage = (message) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.contactId.toString() === message.from
          ? {
            ...contact,
            lastMessage: message.content,
            time: 'Just now',
            unread: selectedContact?.contactId.toString() === message.from ? 0 : (contact.unread || 0) + 1
          }
          : contact
      )
    );

    if (selectedContact?.contactId.toString() === message.from) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: message.content,
          senderId: message.from,
          timestamp: message.timestamp,
          isSent: false
        }
      ]);
    }
  };

  // When a contact is selected
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);

    setContacts(prevContacts =>
      prevContacts.map(c =>
        c.contactId === contact.contactId ? { ...c, unread: 0 } : c
      )
    );

    fetchChats(userData.id, contact.contactId);
  };

  const filteredContacts = (contacts || []).filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-container">
      <div className="contact-container">
        <div className="contact-header">
          <h2>Chats</h2>
          <div className="connection-status">
            {isConnected ? '✔ Online' : '🔴 Offline'}
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="contact-list">
          {filteredContacts.map((contact) => (
            <div
              key={contact.contactId}
              className={`contact-item ${selectedContact?.contactId === contact.contactId ? 'active' : ''}`}
              onClick={() => handleContactSelect(contact)}
            >
              <img src={contact.avatar || '/images/default-avatar.png'} alt={contact.name} className="avatar" />
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-last-message">{contact.mobileNumber}</div>
              </div>
              <div className="contact-meta">
                <div className="contact-time">{contact.updatedAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="message-preview">
        {selectedContact ? (
          <>
            <div className="message-header">
              <img src={selectedContact.avatar || '/images/default-avatar.png'} alt={selectedContact.name} className="avatar" />
              <div className="contact-name">{selectedContact.name}</div>
              <div className="header-actions">
                <button>📞</button>
                <button>⋮</button>
              </div>
            </div>
            <div className="message-content">
              {messages.map((message) => (
                <div
                  key={message.id || message.messageId}
                  className={`message-bubble ${message.sent ? 'received' : 'sent'}`}
                >
                  <p>{message.text || message.content}</p>
                  <span className="message-time">{formatTime(message.timestamp || message.updatedAt)}</span>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage} disabled={!isConnected}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-contact-selected">
            <div className="whatsapp-icon">💬</div>
            <h3>Private chat room</h3>
            <p>Select a contact to start chatting</p>
            <div className="connection-status">
              Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllContact;
