import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  Droplet, 
  AlertTriangle, 
  ShieldCheck, 
  X,
  ExternalLink
} from 'lucide-react';
import './NotificationPanel.css';

// Helper utility for human-friendly relative time
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Recently';
  const now = Date.now();
  const seconds = Math.floor((now - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationPanel() {
  const { 
    notifications, 
    unreadCount, 
    isPanelOpen, 
    closePanel, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Only close if not clicking the toggle button
        if (!event.target.closest('.btn-nav-icon-link') && !event.target.closest('.dash-notif-trigger')) {
          closePanel();
        }
      }
    };

    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  const getIconForType = (type) => {
    switch (type) {
      case 'urgent_request':
        return <AlertTriangle size={16} className="notif-item-icon urgent" />;
      case 'matching_request':
        return <Droplet size={16} className="notif-item-icon match" />;
      case 'response_update':
        return <Check size={16} className="notif-item-icon response" />;
      case 'account':
      default:
        return <ShieldCheck size={16} className="notif-item-icon account" />;
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.read) {
      markAsRead(item.id);
    }
    if (item.requestId) {
      closePanel();
      navigate('/dashboard');
    }
  };

  return (
    <div className="notif-panel-overlay">
      <div className="notif-panel-container" ref={panelRef} role="dialog" aria-label="Notification Center">
        {/* Header */}
        <div className="notif-panel-header">
          <div className="notif-panel-title-wrap">
            <Bell size={18} className="notif-panel-header-icon" />
            <h3 className="notif-panel-title">Notifications</h3>
            {unreadCount > 0 && (
              <span className="notif-panel-badge">{unreadCount} new</span>
            )}
          </div>
          <div className="notif-panel-header-actions">
            {unreadCount > 0 && (
              <button 
                type="button" 
                className="notif-mark-all-btn" 
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
            <button 
              type="button" 
              className="notif-close-btn" 
              onClick={closePanel}
              aria-label="Close notification panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notif-panel-body">
          {notifications.length > 0 ? (
            <div className="notif-list">
              {notifications.map((item) => (
                <div 
                  key={item.id} 
                  className={`notif-item ${!item.read ? 'unread' : 'read'}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className="notif-item-left">
                    <div className="notif-icon-box">
                      {getIconForType(item.type)}
                    </div>
                  </div>

                  <div className="notif-item-content">
                    <div className="notif-item-top">
                      <h4 className="notif-item-title">{item.title}</h4>
                      <span className="notif-item-time">
                        <Clock size={11} /> {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                    <p className="notif-item-msg">{item.message}</p>
                    {item.requestId && (
                      <div className="notif-item-action-tag">
                        <span>View Request</span>
                        <ExternalLink size={10} />
                      </div>
                    )}
                  </div>

                  {!item.read && (
                    <div className="notif-unread-dot" title="Unread notification" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="notif-empty-state">
              <Bell size={32} className="notif-empty-icon" />
              <h4>No notifications</h4>
              <p>You're all caught up! New blood requests and donation updates will appear here.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="notif-panel-footer">
          <span className="notif-footer-text">
            BloodLink Maharashtra Notification Center
          </span>
        </div>
      </div>
    </div>
  );
}
