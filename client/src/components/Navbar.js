import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = ({ onToggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar variant={isMobile ? 'regular' : 'dense'} sx={{ minHeight: isMobile ? 56 : 48 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
          aria-label="toggle sidebar"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          Crypto MLM Platform
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {/* Right-side actions can go here */}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
