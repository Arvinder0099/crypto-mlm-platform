import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RoleRedirect() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Navigate by role
    navigate(isAdmin() ? '/admin' : '/dashboard', { replace: true });
  }, [isAdmin, navigate]);

  return null;
}

export default RoleRedirect;