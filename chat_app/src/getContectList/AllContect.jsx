import React, { useState, useEffect, useRef } from 'react';
import './AllContact.css';
import { Client } from '@stomp/stompjs';

const AllContact = () => {
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Narendra Modi',
      avatar: '/images/modi.jpeg',
      lastMessage: 'Hey, how are you doing?',
      time: '10:30 AM',
      unread: 2,
    },
    {
      id: 2,
      name: 'Donald Trump',
      avatar: '/images/trump.jpeg',
      lastMessage: 'Meeting at 3 PM tomorrow',
      time: 'Yesterday',
      unread: 0,
    },
    {
      id: 3,
      name: 'MS Dhoni',
      avatar: '/images/dhoni.jpeg',
      lastMessage: 'Please send me the files',
      time: 'Yesterday',
      unread: 1,
    },
    {
      id: 4,
      name: 'Ajit Doval',
      avatar: '/images/ajit.jpeg',
      lastMessage: 'Thanks for your help!',
      time: '2 days ago',
      unread: 0,
    },
    {
      id: 5,
      name: 'S. Jaishankar',
      avatar: '/images/Jaishankar.jpeg',
      lastMessage: 'Let me know when you arrive',
      time: '1 week ago',
      unread: 2,
    },
     {
      id: 6,
      name: 'Bhajan Lal Sharma',
      avatar: '/images/bajanLal.jpeg',
      lastMessage: 'when you free, call me?',
      time: '1 month ago',
      unread: 2,
    },
  ]);

  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);

useEffect(() => {
    const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        debug: function(str) {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    client.onConnect = function(frame) {
        console.log('Connected: ' + frame);
        setIsConnected(true);
        
        // Subscribe to public messages
        client.subscribe('/topic/messages', message => {
            const receivedMessage = JSON.parse(message.body);
            handleIncomingMessage(receivedMessage);
        });
        
        // Subscribe to private messages
        client.subscribe('/user/queue/messages', message => {
            const receivedMessage = JSON.parse(message.body);
            handleIncomingMessage(receivedMessage);
        });
        
        // Register user
        client.publish({
            destination: '/app/chat.register',
            body: JSON.stringify("currentUsername")
        });
    };

    client.onStompError = function(frame) {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
    };

    client.activate();
    
    socketRef.current = client; 
    
    return () => {
        if (client) {
            client.deactivate();
        }
    };
}, []);

// Update your send message function
const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedContact || !isConnected) return;

    const newMessage = {
        text: messageInput,
        senderId: "currentUserId", // Replace with actual user ID
        receiverId: selectedContact.id,
        timestamp: new Date().toISOString()
    };

    // For private messages
    socketRef.current.publish({
        destination: "/app/chat.private.send",
        body: JSON.stringify({
            ...newMessage,
            recipient: selectedContact.id
        })
    });

    // Update UI
    setMessages(prev => [...prev, {
        ...newMessage,
        isSent: true
    }]);
    
    setContacts(prevContacts => 
        prevContacts.map(contact => 
            contact.id === selectedContact.id
                ? { 
                    ...contact, 
                    lastMessage: messageInput,
                    time: 'Just now',
                    unread: 0
                }
                : contact
        )
    );

    setMessageInput('');
};

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleIncomingMessage = (message) => {
    // Update the last message in contacts list
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === message.senderId
          ? { 
              ...contact, 
              lastMessage: message.text,
              time: 'Just now',
              unread: selectedContact?.id === message.senderId ? 0 : contact.unread + 1
            }
          : contact
      )
    );

    // If the message is from the currently selected contact, add it to the messages
    if (selectedContact?.id === message.senderId) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: message.text,
          senderId: message.senderId,
          timestamp: new Date().toISOString(),
          isSent: false
        }
      ]);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    
    // Mark messages as read
    setContacts(prevContacts => 
      prevContacts.map(c => 
        c.id === contact.id ? { ...c, unread: 0 } : c
      )
    );
    
    // Load conversation history (in a real app, you'd fetch this from your API)
    setMessages([
      {
        id: 1,
        text: 'Hi there!',
        senderId: contact.id,
        timestamp: '2023-05-01T10:30:00Z',
        isSent: false
      },
      {
        id: 2,
        text: 'Hello! How are you?',
        senderId: 0,
        timestamp: '2023-05-01T10:32:00Z',
        isSent: true
      },
      {
        id: 3,
        text: contact.lastMessage,
        senderId: contact.id,
        timestamp: new Date().toISOString(),
        isSent: false
      }
    ]);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-container">
      <div className="contact-container">
        {/* Header */}
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

        {/* Contact List */}
        <div className="contact-list">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
              onClick={() => handleContactSelect(contact)}
            >
              <img src={contact.avatar} alt={contact.name} className="avatar" />
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-last-message">{contact.lastMessage}</div>
              </div>
              <div className="contact-meta">
                <div className="contact-time">{contact.time}</div>
                {contact.unread > 0 && (
                  <div className="unread-count">{contact.unread}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Preview */}
      <div className="message-preview">
        {selectedContact ? (
          <>
            <div className="message-header">
              <img src={selectedContact.avatar} alt={selectedContact.name} className="avatar" />
              <div className="contact-name">{selectedContact.name}</div>
              <div className="header-actions">
                <button>📞</button>
                <button>⋮</button>
              </div>
            </div>
            <div className="message-content">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message-bubble ${message.isSent ? 'sent' : 'received'}`}
                >
                  <p>{message.text}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
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
