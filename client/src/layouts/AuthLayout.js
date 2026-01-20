import React from 'react';
import { Box, Container, Paper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AuthLayout = ({ children, title = 'Crypto MLM Platform' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: { xs: theme.spacing(1), sm: theme.spacing(2) },
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 } }}>
        <Paper
          elevation={8}
          sx={{
            padding: { xs: theme.spacing(2), sm: theme.spacing(3), md: theme.spacing(4) },
            borderRadius: { xs: theme.spacing(1.5), sm: theme.spacing(2) },
            backgroundColor: 'background.paper',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              color="primary"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: '1.3rem', sm: '1.75rem', md: '2.125rem' } }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Professional MLM Platform for Crypto Investments
            </Typography>
          </Box>
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;