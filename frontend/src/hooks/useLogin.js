// File: frontend/src/hooks/useLogin.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { resolveDashboardRoute } from '../utils/auth.js';

export function useLogin() {
  const { login, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pendingTwoFactorToken, setPendingTwoFactorToken] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (show = true) => {
    if (!email.trim()) {
      if (show) setEmailError('El correo es requerido.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      if (show) setEmailError('Ingresa un correo válido.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (show = true) => {
    if (!password) {
      if (show) setPasswordError('La contraseña es requerida.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateOtp = (show = true) => {
    if (!pendingTwoFactorToken) return true;
    if (!otpCode.trim()) {
      if (show) setOtpError('El código es requerido.');
      return false;
    }
    if (!/^[0-9]{6}$/.test(otpCode.trim())) {
      if (show) setOtpError('Ingresa un código válido de 6 dígitos.');
      return false;
    }
    setOtpError('');
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setGlobalError('');

    const isEmailValid = validateEmail(true);
    const isPasswordValid = validatePassword(true);
    const isOtpValid = validateOtp(true);

    if (!isEmailValid || !isPasswordValid || !isOtpValid) return;

    setLoading(true);
    try {
      let authResponse;
      if (pendingTwoFactorToken) {
        authResponse = await api.login2FA(pendingTwoFactorToken, otpCode.trim());
      } else {
        authResponse = await login(email.trim(), password);
      }

      if (authResponse?.twoFactorRequired) {
        setPendingTwoFactorToken(authResponse.tempToken);
        setLoading(false);
        return { twoFactorRequired: true };
      }

      return { success: true, user: authResponse };
    } catch (err) {
      const msg = err.mensaje || err.message || "No se pudo iniciar sesión.";
      if (err.status === 403 && /verific/i.test(msg)) {
        return { pendingVerification: true, email: email.trim() };
      }
      setGlobalError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    otpCode,
    setOtpCode,
    pendingTwoFactorToken,
    emailError,
    passwordError,
    otpError,
    globalError,
    loading,
    validateEmail,
    validatePassword,
    validateOtp,
    handleSubmit,
  };
}
