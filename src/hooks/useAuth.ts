import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestContext } from '../context/TestContext';

export function useAuth() {
  const navigate = useNavigate();
  const { login, loading, error } = useTestContext();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [userIdError, setUserIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserIdError('');
    setPasswordError('');

    let hasError = false;
    if (!userId.trim()) {
      setUserIdError('User ID is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }
    if (hasError) return;

    try {
      await login(userId.trim(), password);
      navigate('/dashboard');
    } catch {
      // Error shown via context
    }
  };

  return {
    userId,
    setUserId,
    password,
    setPassword,
    userIdError,
    setUserIdError,
    passwordError,
    setPasswordError,
    handleSubmit,
    loading,
    error,
  };
}
