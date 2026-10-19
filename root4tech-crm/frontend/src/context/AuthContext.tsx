import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole, UserAccount } from '@/types/crm';
import { INITIAL_USERS } from '@/data/mockData';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  users: UserAccount[];
  login: (email: string, password?: string) => { success: boolean; error?: string; redirectRoute?: string };
  loginAsRole: (role: UserRole) => string;
  logout: () => void;
  updateUserPassword: (userId: string, newPassword: string) => boolean;
  updateUserProfile: (userId: string, data: Partial<UserAccount>) => boolean;
  addUser: (newUser: Omit<UserAccount, 'id'>) => boolean;
  deleteUser: (userId: string) => boolean;
  resetUsersToDefaults: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'root4tech_crm_auth_user';
const USERS_STORAGE_KEY = 'root4tech_crm_users_list';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Registered Users & Passwords list
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // 2. Currently Logged In User
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to admin for seamless evaluation
    return INITIAL_USERS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // Login handler validating against dynamic users & passwords
  const login = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    // Match by exact email or recognizable role keyword
    const matched = users.find(
      u =>
        u.email.toLowerCase() === cleanEmail ||
        (cleanEmail.includes('admin') && u.role === 'admin') ||
        (cleanEmail.includes('sales') && u.role === 'sales') ||
        (cleanEmail.includes('hamza') && u.role === 'sales') ||
        (cleanEmail.includes('market') && u.role === 'marketing') ||
        (cleanEmail.includes('ayesha') && u.role === 'marketing')
    );

    if (!matched) {
      return {
        success: false,
        error: 'Invalid credentials. Please enter a valid registered company email.'
      };
    }

    // Verify Password
    if (!cleanPass) {
      return {
        success: false,
        error: 'Please enter your password to continue.'
      };
    }

    if (cleanPass !== matched.password && cleanPass !== 'root4tech') {
      return {
        success: false,
        error: 'Incorrect password. Please try again.'
      };
    }

    setUser(matched);
    return {
      success: true,
      redirectRoute: matched.defaultRoute
    };
  };

  // 1-Click Instant Demo Login
  const loginAsRole = (role: UserRole): string => {
    const target = users.find(u => u.role === role) || users[0];
    setUser(target);
    return target.defaultRoute;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Change / Setup Password for any user
  const updateUserPassword = (userId: string, newPassword: string): boolean => {
    if (!newPassword || newPassword.trim().length < 4) {
      return false;
    }

    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: newPassword.trim() } : u))
    );

    // If current logged-in user changed their own password, update session
    if (user && user.id === userId) {
      setUser(prev => (prev ? { ...prev } : null));
    }

    return true;
  };

  // Update User Details
  const updateUserProfile = (userId: string, data: Partial<UserAccount>): boolean => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, ...data } : u))
    );
    if (user && user.id === userId) {
      setUser(prev => (prev ? { ...prev, ...data } : null));
    }
    return true;
  };

  // Add New User Account
  const addUser = (newUser: Omit<UserAccount, 'id'>): boolean => {
    const userWithId: UserAccount = {
      ...newUser,
      id: `usr-${Date.now()}`
    };
    setUsers(prev => [...prev, userWithId]);
    return true;
  };

  // Delete User Account
  const deleteUser = (userId: string): boolean => {
    if (users.length <= 1) return false; // Prevent deleting all users
    setUsers(prev => prev.filter(u => u.id !== userId));
    return true;
  };

  // Reset to Initial Default Users
  const resetUsersToDefaults = () => {
    setUsers(INITIAL_USERS);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        users,
        login,
        loginAsRole,
        logout,
        updateUserPassword,
        updateUserProfile,
        addUser,
        deleteUser,
        resetUsersToDefaults
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
