import React from 'react';
import { CheckCircle, AlertCircle, XCircle, InfoIcon } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

const NotificationCenter = () => {
  const { notifications } = useWeb3();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} />;
      case 'error':
        return <XCircle size={16} />;
      case 'warning':
        return <AlertCircle size={16} />;
      case 'info':
      default:
        return <InfoIcon size={16} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'var(--success-color)';
      case 'error':
        return 'var(--danger-color)';
      case 'warning':
        return 'var(--warning-color)';
      case 'info':
      default:
        return 'var(--accent-color)';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px'
    }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: `1px solid ${getNotificationColor(notification.type)}`,
            backdropFilter: 'blur(10px)',
            color: getNotificationColor(notification.type),
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {getNotificationIcon(notification.type)}
          <span style={{ fontSize: '0.9rem', flex: 1 }}>
            {notification.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
