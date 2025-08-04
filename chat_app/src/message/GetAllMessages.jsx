import React, { useState, useEffect } from 'react';
import './MessageHistory.css';

const MessageHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setConversations([
        {
          id: 1,
          contact: 'John Doe',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          lastMessage: 'See you tomorrow at the meeting!',
          time: '10:30 AM',
          unread: 0,
          messages: [
            { id: 1, text: 'Hi there!', time: '10:00 AM', sent: false },
            { id: 2, text: 'Hello! How are you?', time: '10:02 AM', sent: true },
            { id: 3, text: 'Are we still meeting tomorrow?', time: '10:25 AM', sent: false },
            { id: 4, text: 'Yes, at 3 PM', time: '10:28 AM', sent: true },
            { id: 5, text: 'See you tomorrow at the meeting!', time: '10:30 AM', sent: false }
          ]
        },
        {
          id: 2,
          contact: 'Sarah Smith',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          lastMessage: 'The documents are ready for review',
          time: 'Yesterday',
          unread: 2,
          messages: [
            { id: 1, text: 'Hi Sarah, how are the documents coming along?', time: '9:00 AM', sent: true },
            { id: 2, text: 'Almost done, will send them by EOD', time: '2:30 PM', sent: false },
            { id: 3, text: 'The documents are ready for review', time: '5:45 PM', sent: false }
          ]
        },
        {
          id: 3,
          contact: 'Mike Johnson',
          avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
          lastMessage: 'Thanks for your help!',
          time: 'Monday',
          unread: 0,
          messages: [
            { id: 1, text: 'Can you help me with the project?', time: '11:00 AM', sent: false },
            { id: 2, text: 'Sure, what do you need?', time: '11:05 AM', sent: true },
            { id: 3, text: 'Thanks for your help!', time: '4:20 PM', sent: false }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="message-history-container">
      {/* Sidebar */}
      <div className="conversation-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="search-box">
            <input type="text" placeholder="Search conversations..." />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading conversations...</p>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map(convo => (
              <div 
                key={convo.id} 
                className={`conversation-item ${activeConversation?.id === convo.id ? 'active' : ''}`}
                onClick={() => setActiveConversation(convo)}
              >
                <img src={convo.avatar} alt={convo.contact} className="contact-avatar" />
                <div className="contact-info">
                  <div className="contact-name">{convo.contact}</div>
                  <div className="message-preview">{convo.lastMessage}</div>
                </div>
                <div className="message-meta">
                  <div className="message-time">{convo.time}</div>
                  {convo.unread > 0 && <div className="unread-badge">{convo.unread}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message View */}
      <div className="message-view">
        {activeConversation ? (
          <>
            <div className="message-header">
              <img src={activeConversation.avatar} alt={activeConversation.contact} className="contact-avatar" />
              <div className="contact-details">
                <h3>{activeConversation.contact}</h3>
                <p>Online</p>
              </div>
            </div>

            <div className="message-container">
              {activeConversation.messages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.sent ? 'sent' : 'received'}`}>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              ))}
            </div>

            <div className="message-input">
              <input type="text" placeholder="Type a message..." />
              <button className="send-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a chat from the sidebar to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageHistory;