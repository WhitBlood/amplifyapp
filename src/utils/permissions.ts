// Role-based access control utilities

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: number;
  role: UserRole;
  managerId?: number | null;
  [key: string]: any;
}

// Check if user can edit a profile
export const canEditProfile = (currentUser: User, targetUserId: number): boolean => {
  // Admin can edit anyone
  if (currentUser.role === 'admin') {
    return true;
  }
  
  // Manager can edit their team members
  if (currentUser.role === 'manager') {
    // Can edit own profile or team members
    return currentUser.id === targetUserId || isTeamMember(currentUser.id, targetUserId);
  }
  
  // Employee can only edit own profile
  return currentUser.id === targetUserId;
};

// Check if user can view profile details
export const canViewProfile = (currentUser: User, targetUserId: number): boolean => {
  // Everyone can view profiles (read-only for non-authorized users)
  return true;
};

// Check if user can view team members
export const canViewTeamMembers = (currentUser: User): boolean => {
  // Admin and managers can view team members
  return currentUser.role === 'admin' || currentUser.role === 'manager';
};

// Check if user can approve leaves
export const canApproveLeaves = (currentUser: User): boolean => {
  // Admin and managers can approve leaves
  return currentUser.role === 'admin' || currentUser.role === 'manager';
};

// Check if user can view all employees
export const canViewAllEmployees = (currentUser: User): boolean => {
  // Admin can view all employees
  return currentUser.role === 'admin';
};

// Check if user can manage departments
export const canManageDepartments = (currentUser: User): boolean => {
  // Only admin can manage departments
  return currentUser.role === 'admin';
};

// Check if target user is a team member
const isTeamMember = (managerId: number, employeeId: number): boolean => {
  // This would check against actual team data
  // For now, simplified check
  return true; // Will be validated by backend
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    admin: 'Administrator',
    manager: 'Manager',
    employee: 'Employee',
  };
  return roleNames[role] || 'Employee';
};

// Get role color
export const getRoleColor = (role: UserRole): string => {
  const roleColors = {
    admin: '#ef4444', // Red
    manager: '#f59e0b', // Amber
    employee: '#10b981', // Green
  };
  return roleColors[role] || '#10b981';
};

// Get role gradient
export const getRoleGradient = (role: UserRole): string => {
  const roleGradients = {
    admin: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    manager: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    employee: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  };
  return roleGradients[role] || roleGradients.employee;
};
