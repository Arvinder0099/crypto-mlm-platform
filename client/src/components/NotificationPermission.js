/**
 * NotificationPermission Component
 * Shows a prompt asking the user to enable notifications
 * Appears after login on mobile devices
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slide,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import notificationService from '../services/notificationService';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const NotificationPermission = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    checkAndPrompt();
  }, []);

  const checkAndPrompt = async () => {
    // Only show if notifications are supported
    if (!notificationService.isSupported()) return;

    // Check if user already dismissed this prompt
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    if (dismissed) return;

    // Check current permission
    const status = await notificationService.checkPermission();
    
    // Only prompt if not yet decided
    if (status === 'prompt' || status === 'default') {
      // Small delay so it doesn't appear immediately on login
      setTimeout(() => setOpen(true), 2000);
    }
  };

  const handleAllow = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      // Send a test notification to confirm it works
      await notificationService.sendNotification(
        '🔔 Notifications Enabled!',
        'You will now receive important updates from Hexanova.',
        { type: 'setup' }
      );
    }
    setOpen(false);
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  const handleDismiss = () => {
    setOpen(false);
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleDismiss}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          maxWidth: 400,
          mx: 2,
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ mb: 1 }}>
          <NotificationsActiveIcon 
            sx={{ 
              fontSize: 50, 
              color: '#d4af37',
              animation: 'bell-ring 1s ease-in-out',
              '@keyframes bell-ring': {
                '0%': { transform: 'rotate(0)' },
                '10%': { transform: 'rotate(15deg)' },
                '20%': { transform: 'rotate(-15deg)' },
                '30%': { transform: 'rotate(10deg)' },
                '40%': { transform: 'rotate(-10deg)' },
                '50%': { transform: 'rotate(5deg)' },
                '60%': { transform: 'rotate(-5deg)' },
                '100%': { transform: 'rotate(0)' },
              }
            }} 
          />
        </Box>
        <Typography variant="h6" sx={{ color: '#d4af37', fontWeight: 'bold' }}>
          Enable Notifications
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', px: 3 }}>
        <Typography variant="body1" sx={{ color: '#e0e0e0', mb: 2 }}>
          Stay updated with important alerts:
        </Typography>
        <Box sx={{ textAlign: 'left', pl: 2 }}>
          {[
            { icon: '💰', text: 'Daily earnings credited' },
            { icon: '✅', text: 'Deposit confirmations' },
            { icon: '📤', text: 'Withdrawal status updates' },
            { icon: '🎉', text: 'New referral notifications' },
            { icon: '📢', text: 'Important announcements' },
          ].map((item, idx) => (
            <Typography 
              key={idx} 
              variant="body2" 
              sx={{ color: '#b0b0b0', mb: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <span>{item.icon}</span> {item.text}
            </Typography>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1, px: 3 }}>
        <Button
          onClick={handleDismiss}
          variant="outlined"
          sx={{
            color: '#999',
            borderColor: '#555',
            '&:hover': { borderColor: '#888', backgroundColor: 'rgba(255,255,255,0.05)' },
            flex: 1,
          }}
        >
          Not Now
        </Button>
        <Button
          onClick={handleAllow}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #d4af37, #b8860b)',
            color: '#000',
            fontWeight: 'bold',
            '&:hover': { background: 'linear-gradient(135deg, #e5c04b, #c8961b)' },
            flex: 1,
          }}
        >
          Allow
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPermission;
