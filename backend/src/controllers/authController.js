const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Trusted email providers
const TRUSTED_DOMAINS = new Set([
  // Google
  'gmail.com', 'googlemail.com',
  // Microsoft
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'hotmail.co.uk', 'live.co.uk', 'outlook.co.uk',
  'hotmail.fr', 'live.fr', 'outlook.fr',
  'hotmail.de', 'live.de', 'outlook.de',
  'hotmail.it', 'live.it', 'outlook.it',
  'hotmail.es', 'live.es', 'outlook.es',
  // Apple
  'icloud.com', 'me.com', 'mac.com',
  // Yahoo
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'yahoo.es', 'yahoo.it', 'yahoo.ca', 'yahoo.com.au',
  'yahoo.co.jp', 'yahoo.com.br', 'ymail.com', 'rocketmail.com',
  // ProtonMail
  'proton.me', 'protonmail.com', 'protonmail.ch', 'pm.me',
  // AOL
  'aol.com', 'aol.co.uk',
  // Zoho
  'zoho.com', 'zohomail.com',
  // Fastmail
  'fastmail.com', 'fastmail.fm', 'fastmail.org',
  // GMX
  'gmx.com', 'gmx.net', 'gmx.de', 'gmx.co.uk', 'gmx.at',
  // mail.com group
  'mail.com', 'email.com', 'usa.com', 'post.com',
  // Tutanota
  'tutanota.com', 'tutamail.com', 'tuta.io',
  // Hey / Basecamp
  'hey.com',
  // Samsung
  'samsung.com',
  // Yandex
  'yandex.com', 'yandex.ru',
  // Mailfence
  'mailfence.com',
]);

const PW_RULES = {
  length:    (pw) => pw.length >= 8,
  uppercase: (pw) => /[A-Z]/.test(pw),
  lowercase: (pw) => /[a-z]/.test(pw),
  number:    (pw) => /[0-9]/.test(pw),
  special:   (pw) => /[!@#$%^&*()_+\-=\[\]{}|;':",.<>?/\\]/.test(pw),
};

function validatePassword(pw) {
  const failures = [];
  if (!PW_RULES.length(pw))    failures.push('at least 8 characters');
  if (!PW_RULES.uppercase(pw)) failures.push('an uppercase letter');
  if (!PW_RULES.lowercase(pw)) failures.push('a lowercase letter');
  if (!PW_RULES.number(pw))    failures.push('a number');
  if (!PW_RULES.special(pw))   failures.push('a special character (!@#$%^&* …)');
  return failures;
}

function validateEmail(email) {
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return 'Invalid email address';
  const domain = parts[1];
  if (!TRUSTED_DOMAINS.has(domain)) {
    return 'Please use a trusted email provider (Gmail, Outlook, iCloud, Yahoo, ProtonMail, etc.)';
  }
  return null;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  const emailErr = validateEmail(email);
  if (emailErr) return res.status(400).json({ error: emailErr });

  const pwFailures = validatePassword(password);
  if (pwFailures.length > 0) {
    return res.status(400).json({
      error: 'Password must contain ' + pwFailures.join(', '),
    });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash, role: 'consumer' },
  });
  res.status(201).json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

module.exports = { register, login, me };
