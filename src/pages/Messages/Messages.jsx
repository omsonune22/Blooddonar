import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  CalendarDays,
  Clock,
  AlertTriangle,
  Search,
  Phone,
  Info,
  Mic,
  Send,
  HelpCircle,
  LogOut
} from 'lucide-react';
import './Messages.css';

export default function Messages() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeConvo, setActiveConvo] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 0,
      name: 'Sarah Jenkins',
      bloodGroup: 'O-',
      lastMsg: 'I can come in for a donation tomc...',
      time: '10:42 AM',
      online: true,
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      messages: [
        { id: 1, sender: 'them', text: 'Hi there, I received an emergency alert for O- blood needed at City Hospital. Is there still a critical shortage?', time: '9:32 AM' },
        { id: 2, sender: 'me', text: 'Hello Sarah. Yes, the alert is still active. We have a severe shortage following an accident this morning. Your O- type is universally crucial right now.', time: '9:35 AM' },
        { id: 3, sender: 'them', text: "I can come in for a donation tomorrow morning. Or is it needed sooner? I could try to rearrange my schedule for this afternoon if it's life or death.", time: '10:42 AM' }
      ]
    },
    {
      id: 1,
      name: 'Marcus Thorne',
      bloodGroup: 'A+',
      lastMsg: 'Thank you for the update on the c...',
      time: 'Yesterday',
      online: false,
      photoUrl: '',
      messages: [
        { id: 1, sender: 'them', text: 'Thank you for the update on the current blood drive. I will be there.', time: '3:15 PM' },
        { id: 2, sender: 'me', text: 'Great to hear, Marcus! We look forward to seeing you.', time: '3:20 PM' }
      ]
    },
    {
      id: 2,
      name: 'Elena Rostova',
      bloodGroup: 'B+',
      lastMsg: 'Is the clinic open on weekends?',
      time: 'Tuesday',
      online: false,
      photoUrl: '',
      messages: [
        { id: 1, sender: 'them', text: 'Is the clinic open on weekends?', time: '11:00 AM' },
        { id: 2, sender: 'me', text: 'Yes, we are open Saturday 9 AM - 2 PM. Closed on Sundays.', time: '11:15 AM' }
      ]
    }
  ];

  const current = conversations[activeConvo];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    // In a real app, this would send to backend
    setNewMessage('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/search', label: 'Donor Map', icon: MapPin },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/my-requests', label: 'Appointments', icon: CalendarDays },
    { path: '/my-requests', label: 'History', icon: Clock },
    { path: '/request', label: 'Emergency Alerts', icon: AlertTriangle }
  ];

  return (
    <div className="msg-layout">
      {/* ===== Left Sidebar ===== */}
      <aside className="msg-sidebar">
        <div className="msg-sidebar-top">
          <div className="msg-brand">
            <Heart size={18} className="msg-brand-icon" />
            <div>
              <span className="msg-brand-name">VitalFlow</span>
              <span className="msg-brand-sub">Healthcare Portal</span>
            </div>
          </div>
          <nav className="msg-nav">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === 'Messages';
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`msg-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="msg-sidebar-bottom">
          <Link to="/search" className="msg-find-btn">Find Donors Now</Link>
          <button className="msg-help-btn"><HelpCircle size={16} /> Help Center</button>
          <button className="msg-signout-btn" onClick={handleLogout}><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>

      {/* ===== Conversations List ===== */}
      <div className="msg-convos">
        <h2 className="msg-convos-title">Messages</h2>
        <div className="msg-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="msg-convos-list">
          {conversations.map((convo, idx) => (
            <button
              key={convo.id}
              className={`msg-convo-item ${activeConvo === idx ? 'active' : ''}`}
              onClick={() => setActiveConvo(idx)}
            >
              <div className="msg-convo-avatar">
                {convo.photoUrl ? (
                  <img src={convo.photoUrl} alt={convo.name} />
                ) : (
                  <div className="msg-convo-initials">{getInitials(convo.name)}</div>
                )}
              </div>
              <div className="msg-convo-info">
                <div className="msg-convo-top-row">
                  <span className="msg-convo-name">{convo.name}</span>
                  <span className="msg-convo-time">{convo.time}</span>
                </div>
                <div className="msg-convo-bottom-row">
                  <span className="msg-convo-preview">{convo.lastMsg}</span>
                  <span className="msg-convo-badge">{convo.bloodGroup}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== Chat Area ===== */}
      <div className="msg-chat">
        {/* Chat Header */}
        <div className="msg-chat-header">
          <div className="msg-chat-header-left">
            <div className="msg-chat-avatar">
              {current.photoUrl ? (
                <img src={current.photoUrl} alt={current.name} />
              ) : (
                <div className="msg-chat-initials">{getInitials(current.name)}</div>
              )}
            </div>
            <div className="msg-chat-user-info">
              <div className="msg-chat-name-row">
                <span className="msg-chat-name">{current.name}</span>
                <span className="msg-chat-blood">{current.bloodGroup}</span>
              </div>
              <span className={`msg-chat-status ${current.online ? 'online' : ''}`}>
                <span className="msg-chat-status-dot"></span>
                {current.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="msg-chat-header-right">
            <button className="msg-chat-icon-btn"><Phone size={18} /></button>
            <button className="msg-chat-icon-btn"><Info size={18} /></button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="msg-chat-body">
          <div className="msg-chat-date-label">Today, 9:30 AM</div>
          {current.messages.map((msg) => (
            <div key={msg.id} className={`msg-bubble-row ${msg.sender === 'me' ? 'sent' : 'received'}`}>
              <div className={`msg-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                <p>{msg.text}</p>
              </div>
              <span className="msg-bubble-time">
                {msg.time}
                {msg.sender === 'me' && <span className="msg-sender-tag">VF</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form className="msg-chat-input" onSubmit={handleSend}>
          <button type="button" className="msg-mic-btn"><Mic size={18} /></button>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="msg-send-btn"><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
}
