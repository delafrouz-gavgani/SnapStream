import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Camera, User, Mail, Lock, AlertCircle, ArrowRight, Check, X } from 'lucide-react';

// Trusted email providers
const TRUSTED_DOMAINS = new Set([
  'gmail.com','googlemail.com',
  'outlook.com','hotmail.com','live.com','msn.com',
  'hotmail.co.uk','live.co.uk','outlook.co.uk',
  'hotmail.fr','live.fr','outlook.fr',
  'hotmail.de','live.de','outlook.de',
  'hotmail.it','live.it','outlook.it',
  'hotmail.es','live.es','outlook.es',
  'icloud.com','me.com','mac.com',
  'yahoo.com','yahoo.co.uk','yahoo.fr','yahoo.de',
  'yahoo.es','yahoo.it','yahoo.ca','yahoo.com.au',
  'yahoo.co.jp','yahoo.com.br','ymail.com','rocketmail.com',
  'proton.me','protonmail.com','protonmail.ch','pm.me',
  'aol.com','aol.co.uk',
  'zoho.com','zohomail.com',
  'fastmail.com','fastmail.fm','fastmail.org',
  'gmx.com','gmx.net','gmx.de','gmx.co.uk','gmx.at',
  'mail.com','email.com','usa.com','post.com',
  'tutanota.com','tutamail.com','tuta.io',
  'hey.com','yandex.com','yandex.ru','mailfence.com',
]);

function getEmailError(email) {
  if (!email) return null;
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2 || !parts[1]) return null;
  return TRUSTED_DOMAINS.has(parts[1])
    ? null
    : 'Use a trusted provider: Gmail, Outlook, iCloud, Yahoo, ProtonMail…';
}

const PW_CHECKS = [
  { key: 'length',    label: 'At least 8 characters',      test: (p) => p.length >= 8 },
  { key: 'upper',     label: 'One uppercase letter (A–Z)',  test: (p) => /[A-Z]/.test(p) },
  { key: 'lower',     label: 'One lowercase letter (a–z)',  test: (p) => /[a-z]/.test(p) },
  { key: 'number',    label: 'One number (0–9)',            test: (p) => /[0-9]/.test(p) },
  { key: 'special',   label: 'One special character',       test: (p) => /[!@#$%^&*()_+\-=[\]{}|;':.,<>?/\\]/.test(p) },
];

const STRENGTH = [
  { label: 'Very weak', bar: 'bg-red-500',    text: 'text-red-500'    },
  { label: 'Weak',      bar: 'bg-orange-400', text: 'text-orange-500' },
  { label: 'Fair',      bar: 'bg-yellow-400', text: 'text-yellow-600' },
  { label: 'Good',      bar: 'bg-lime-500',   text: 'text-lime-600'   },
  { label: 'Strong',    bar: 'bg-green-500',  text: 'text-green-600'  },
];

export default function RegisterPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const checks = useMemo(() => PW_CHECKS.map(c => ({ ...c, pass: c.test(form.password) })), [form.password]);
  const score  = checks.filter(c => c.pass).length;
  const strength = STRENGTH[Math.min(score, STRENGTH.length - 1)];
  const emailError = emailTouched ? getEmailError(form.email) : null;
  const pwAllPass  = checks.every(c => c.pass);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const eErr = getEmailError(form.email);
    if (eErr) { setEmailTouched(true); return setError(eErr); }
    if (!pwAllPass) return setError('Password does not meet all requirements');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      loginUser(res.data.token, res.data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = `w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors`;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 flex items-center justify-center px-4 bg-gradient-to-br from-rose-50 via-white to-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-600 shadow-rose-200 shadow-lg flex items-center justify-center mx-auto mb-4">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
            <p className="text-gray-500 text-sm mt-1">Join <span className="font-semibold text-rose-600">SnapStream</span> as a consumer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name" className={inputCls + ' pl-10'} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you@gmail.com" className={inputCls + ' pl-10' + (emailError ? ' border-red-300 ring-1 ring-red-300' : '')} />
              </div>
              {emailError && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <X className="w-3 h-3 shrink-0" /> {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className={inputCls + ' pl-10'} />
              </div>

              {form.password && (
                <div className="mt-2.5 space-y-2">
                  {/* Strength bar */}
                  <div className="flex gap-1">
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? strength.bar : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${strength.text}`}>{strength.label}</p>
                  {/* Checklist */}
                  <div className="grid grid-cols-1 gap-0.5">
                    {checks.map(c => (
                      <span key={c.key} className={`text-xs flex items-center gap-1.5 ${c.pass ? 'text-green-600' : 'text-gray-400'}`}>
                        {c.pass
                          ? <Check className="w-3 h-3 shrink-0 text-green-500" />
                          : <span className="w-3 h-3 shrink-0 rounded-full border border-gray-300 inline-block" />}
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" required value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="••••••••" className={inputCls + ' pl-10'} />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <X className="w-3 h-3 shrink-0" /> Passwords do not match
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-rose-200 mt-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
