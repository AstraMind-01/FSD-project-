import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, Mail, User, Loader2, Shield, KeyRound } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  const { register, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (showOtpScreen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpScreen, countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await register(name, email, password, role);
      if (data && data.verifyEmail) {
        setShowOtpScreen(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      await verifyOTP(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResending(true);
    try {
      await resendOTP(email);
      setCountdown(600); // reset countdown to 10m
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 z-10 relative">
        {showOtpScreen ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-600/35">
                <KeyRound size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-wide">Verify Email</h2>
              <p className="text-xs text-slate-400 mt-1 text-center">We have sent a 6-digit verification code to <strong>{email}</strong></p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Enter OTP</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <KeyRound size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-input text-xs tracking-[8px] text-center font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 py-1">
                <span>Code expires in: <strong className="text-indigo-400">{formatTime(countdown)}</strong></span>
                <button
                  type="button"
                  disabled={countdown > 0 || resending}
                  onClick={handleResendOtp}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold disabled:opacity-50 transition"
                >
                  {resending ? 'Resending...' : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length !== 6}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Verify & Log In'
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-600/35">
                <Terminal size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-wide">Create Account</h2>
              <p className="text-xs text-slate-400 mt-1">Get started with DevBoard workspace</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-input text-xs"
                    placeholder="Ada Lovelace"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-input text-xs"
                    placeholder="ada@lovelace.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-input text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace Role</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Shield size={15} />
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-input text-xs appearance-none"
                  >
                    <option value="Member" className="bg-slate-900 text-white">Member (Update tasks, attachments)</option>
                    <option value="Admin" className="bg-slate-900 text-white">Admin (Create/edit projects & tasks)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-[11px] text-slate-400 text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
