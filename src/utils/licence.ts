/**
 * Licence Management Utilities
 * Handles licence validation, expiry checks, and plan management
 */

import { Licence } from '../types';

// Get all licences
export function getAllLicences(): Licence[] {
  return JSON.parse(localStorage.getItem('hms_licences') || '[]');
}

// Get licence for a specific school
export function getSchoolLicence(schoolId: string): Licence | null {
  const licences = getAllLicences();
  return licences.find(l => l.school_id === schoolId) || null;
}

// Check if school licence is valid
export function isLicenceValid(schoolId: string): { valid: boolean; reason?: string; daysRemaining?: number } {
  const licence = getSchoolLicence(schoolId);
  
  if (!licence) {
    return { valid: false, reason: 'No licence found' };
  }
  
  if (licence.status === 'Suspended') {
    return { valid: false, reason: 'Licence is suspended' };
  }
  
  const now = new Date();
  const expiry = new Date(licence.expiry_date);
  
  if (expiry < now) {
    return { valid: false, reason: 'Licence has expired' };
  }
  
  const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return { valid: true, daysRemaining };
}

// Get days remaining for a licence
export function getLicenceDaysRemaining(schoolId: string): number {
  const licence = getSchoolLicence(schoolId);
  if (!licence) return 0;
  
  const now = new Date();
  const expiry = new Date(licence.expiry_date);
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, days);
}

// Check if school has reached student limit
export function checkStudentLimit(schoolId: string, currentCount: number): { allowed: boolean; limit: number; remaining: number } {
  const licence = getSchoolLicence(schoolId);
  
  if (!licence) {
    return { allowed: false, limit: 0, remaining: 0 };
  }
  
  const remaining = licence.student_limit - currentCount;
  
  return {
    allowed: remaining > 0,
    limit: licence.student_limit,
    remaining: Math.max(0, remaining)
  };
}

// Create a new licence
export function createLicence(licence: Omit<Licence, 'id' | 'created_at' | 'updated_at'>): Licence {
  const now = new Date().toISOString();
  const newLicence: Licence = {
    ...licence,
    id: `lic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: now,
    updated_at: now
  };
  
  const licences = getAllLicences();
  licences.push(newLicence);
  localStorage.setItem('hms_licences', JSON.stringify(licences));
  
  return newLicence;
}

// Update a licence
export function updateLicence(licenceId: string, updates: Partial<Licence>): Licence | null {
  const licences = getAllLicences();
  const index = licences.findIndex(l => l.id === licenceId);
  
  if (index === -1) return null;
  
  licences[index] = {
    ...licences[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  localStorage.setItem('hms_licences', JSON.stringify(licences));
  
  return licences[index];
}

// Renew a licence (extend expiry date)
export function renewLicence(licenceId: string, months: number = 12): Licence | null {
  const licence = getAllLicences().find(l => l.id === licenceId);
  if (!licence) return null;
  
  const newExpiry = new Date(licence.expiry_date);
  newExpiry.setMonth(newExpiry.getMonth() + months);
  
  return updateLicence(licenceId, {
    expiry_date: newExpiry.toISOString().split('T')[0],
    status: 'Active'
  });
}

// Suspend a licence
export function suspendLicence(licenceId: string): Licence | null {
  return updateLicence(licenceId, { status: 'Suspended' });
}

// Activate a licence
export function activateLicence(licenceId: string): Licence | null {
  return updateLicence(licenceId, { status: 'Active' });
}

// Get licence statistics
export function getLicenceStats(): {
  total: number;
  active: number;
  suspended: number;
  expired: number;
  expiringSoon: number; // Within 30 days
  totalStudents: number;
  totalRevenue: number;
} {
  const licences = getAllLicences();
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  let active = 0;
  let suspended = 0;
  let expired = 0;
  let expiringSoon = 0;
  let totalStudents = 0;
  let totalRevenue = 0;
  
  licences.forEach(licence => {
    const expiry = new Date(licence.expiry_date);
    
    if (licence.status === 'Suspended') {
      suspended++;
    } else if (expiry < now) {
      expired++;
    } else {
      active++;
      if (expiry <= thirtyDaysFromNow) {
        expiringSoon++;
      }
    }
    
    totalStudents += licence.student_limit;
    totalRevenue += licence.amount;
  });
  
  return {
    total: licences.length,
    active,
    suspended,
    expired,
    expiringSoon,
    totalStudents,
    totalRevenue
  };
}

// Plan definitions
export const LICENCE_PLANS = {
  Basic: {
    name: 'Basic',
    student_limit: 200,
    price: 5000, // INR per year
    features: [
      'Up to 200 students',
      '5 houses',
      'Basic reports',
      'Email support'
    ]
  },
  Standard: {
    name: 'Standard',
    student_limit: 500,
    price: 10000,
    features: [
      'Up to 500 students',
      '10 houses',
      'Advanced reports',
      'Excel import/export',
      'Priority support'
    ]
  },
  Premium: {
    name: 'Premium',
    student_limit: 1000,
    price: 20000,
    features: [
      'Up to 1000 students',
      'Unlimited houses',
      'All reports',
      'Excel import/export',
      'API access',
      '24/7 support',
      'Custom branding'
    ]
  }
} as const;

// Get plan details
export function getPlanDetails(plan: 'Basic' | 'Standard' | 'Premium') {
  return LICENCE_PLANS[plan];
}

// Calculate expiry date from start date
export function calculateExpiryDate(startDate: string, months: number = 12): string {
  const start = new Date(startDate);
  start.setMonth(start.getMonth() + months);
  return start.toISOString().split('T')[0];
}

// Check and update expired licences
export function updateExpiredLicences(): number {
  const licences = getAllLicences();
  const now = new Date().toISOString().split('T')[0];
  let updated = 0;
  
  licences.forEach(licence => {
    if (licence.status === 'Active' && licence.expiry_date < now) {
      updateLicence(licence.id, { status: 'Expired' });
      updated++;
    }
  });
  
  return updated;
}
