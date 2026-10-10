/**
 * Security Utilities
 * Provides password hashing, validation, and security functions
 */

// Simple SHA-256 hash function (for demonstration - use bcrypt/argon2 in production)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Password strength validation
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true, message: 'Password is strong' };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Username validation
export function validateUsername(username: string): { valid: boolean; message: string } {
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true, message: 'Username is valid' };
}

// Generate secure session token
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Session expiry (24 hours from now)
export function getSessionExpiry(): string {
  const now = new Date();
  now.setHours(now.getHours() + 24);
  return now.toISOString();
}

// Check if session is valid
export function isSessionValid(expiry: string): boolean {
  const expiryDate = new Date(expiry);
  const now = new Date();
  return expiryDate > now;
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private maxAttempts: number = 5, private windowMs: number = 15 * 60 * 1000) {}
  
  isBlocked(key: string): boolean {
    const record = this.attempts.get(key);
    if (!record) return false;
    
    if (Date.now() > record.resetTime) {
      this.attempts.delete(key);
      return false;
    }
    
    return record.count >= this.maxAttempts;
  }
  
  recordAttempt(key: string): void {
    const record = this.attempts.get(key);
    const now = Date.now();
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
    } else {
      record.count++;
    }
  }
  
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - record.count);
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Global rate limiter instance
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Get client IP (for logging - limited in browser)
export function getClientInfo(): { userAgent: string; timestamp: string } {
  return {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
}

// Log security event
export function logSecurityEvent(event: string, details: any): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    client: getClientInfo()
  };
  
  // Store in localStorage for now (should be sent to backend in production)
  const logs = JSON.parse(localStorage.getItem('hms_security_logs') || '[]');
  logs.push(logEntry);
  
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  localStorage.setItem('hms_security_logs', JSON.stringify(logs));
  console.warn('Security Event:', logEntry);
}
