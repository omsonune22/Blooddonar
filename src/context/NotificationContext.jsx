import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Storage key scoped to current user
  const storageKey = currentUser?.uid ? `bloodlink_notifications_${currentUser.uid}` : 'bloodlink_notifications_guest';

  // Seed default initial notifications if none exist
  const getInitialNotifications = useCallback(() => {
    const userCity = currentUser?.city || 'Pune';
    const userBlood = currentUser?.bloodGroup || 'O+';
    const userName = currentUser?.displayName || 'Donor';

    return [
      {
        id: 'init-1',
        userId: currentUser?.uid || 'all',
        title: 'Emergency Blood Request Match',
        message: `A critical blood request for ${userBlood} blood at Cigma Hospital, Chhatrapati Sambhajinagar matches your profile.`,
        type: 'urgent_request',
        requestId: 'req-101',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        read: false
      },
      {
        id: 'init-2',
        userId: currentUser?.uid || 'all',
        title: `Active Request in ${userCity}`,
        message: `Ruby Hall Clinic, ${userCity} has an active requirement for blood donors.`,
        type: 'matching_request',
        requestId: 'req-102',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
        read: false
      },
      {
        id: 'init-3',
        userId: currentUser?.uid || 'all',
        title: 'Welcome to BloodLink Maharashtra',
        message: `Hello ${userName}! Your donor account is verified for voluntary donation requests.`,
        type: 'account',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true
      }
    ];
  }, [currentUser?.uid, currentUser?.city, currentUser?.bloodGroup, currentUser?.displayName]);

  // Load notifications from Backend and LocalStorage
  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      const combinedMap = new Map();

      // 1. Fetch from Express Backend API
      try {
        const res = await fetch(`http://localhost:5000/api/notifications?userId=${encodeURIComponent(currentUser.uid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.notifications)) {
            data.notifications.forEach(n => {
              combinedMap.set(n.id, n);
            });
          }
        }
      } catch (err) {
        console.warn('Backend notifications API fallback:', err);
      }

      // 2. Fetch from user-scoped localStorage
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach(n => {
              if (!combinedMap.has(n.id)) {
                combinedMap.set(n.id, n);
              }
            });
          }
        }
      } catch (err) {
        console.warn('LocalStorage notification read error:', err);
      }

      // 3. If no notifications exist yet, populate sensible defaults
      if (combinedMap.size === 0) {
        const defaults = getInitialNotifications();
        defaults.forEach(n => combinedMap.set(n.id, n));
      }

      // Sort by timestamp descending
      const list = Array.from(combinedMap.values()).sort((a, b) => {
        return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
      });

      setNotifications(list);
      try {
        localStorage.setItem(storageKey, JSON.stringify(list));
      } catch {
        // ignore
      }
    } catch (e) {
      console.warn('Error loading notifications:', e);
    } finally {
      setLoading(false);
    }
    // loadNotifications should only re-trigger on user identity or key changes, not transient profile renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, storageKey]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        return { ...n, read: true };
      }
      return n;
    });

    setNotifications(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Inform backend if available
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
    } catch (e) {
      console.warn('Backend mark read warning:', e);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Inform backend
    try {
      await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.uid })
      });
    } catch (e) {
      console.warn('Backend mark all read warning:', e);
    }
  };

  // Add new notification programmatically (e.g. on response submit)
  const addNotification = (notif) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      userId: currentUser?.uid || 'all',
      timestamp: new Date().toISOString(),
      read: false,
      ...notif
    };

    setNotifications(prev => {
      const next = [newNotif, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    // Send to backend
    fetch('http://localhost:5000/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    }).catch(e => console.warn('Backend notification add fallback:', e));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const togglePanel = () => setIsPanelOpen(prev => !prev);
  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);

  const value = {
    notifications,
    unreadCount,
    isPanelOpen,
    loading,
    togglePanel,
    openPanel,
    closePanel,
    markAsRead,
    markAllAsRead,
    addNotification,
    refreshNotifications: loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
