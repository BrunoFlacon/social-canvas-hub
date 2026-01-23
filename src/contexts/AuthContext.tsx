import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hashPassword, verifyPassword, generateSalt } from '@/lib/crypto';

/**
 * SECURITY NOTE: This is a demo/prototype authentication system.
 * 
 * Passwords are hashed using PBKDF2 before storage, but this is still
 * client-side only. For production use, implement:
 * - Server-side authentication (Lovable Cloud/Supabase Auth recommended)
 * - JWT tokens with server validation
 * - Secure HTTP-only cookies for sessions
 */

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('socialhub_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('socialhub_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check stored users
    const users: StoredUser[] = JSON.parse(localStorage.getItem('socialhub_users') || '[]');
    const foundUser = users.find((u) => u.email === email);
    
    if (!foundUser) {
      return false;
    }

    // Verify password using hash comparison
    const isValid = await verifyPassword(password, foundUser.passwordHash, foundUser.salt);
    
    if (isValid) {
      const userWithoutSensitiveData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        avatar: foundUser.avatar,
        createdAt: foundUser.createdAt
      };
      setUser(userWithoutSensitiveData);
      localStorage.setItem('socialhub_user', JSON.stringify(userWithoutSensitiveData));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users: StoredUser[] = JSON.parse(localStorage.getItem('socialhub_users') || '[]');
    
    // Check if user exists
    if (users.find((u) => u.email === email)) {
      return false;
    }

    // Generate salt and hash password
    const salt = await generateSalt();
    const passwordHash = await hashPassword(password, salt);
    
    const newStoredUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      salt,
      name,
      createdAt: new Date().toISOString()
    };
    
    users.push(newStoredUser);
    localStorage.setItem('socialhub_users', JSON.stringify(users));
    
    const userWithoutSensitiveData: User = {
      id: newStoredUser.id,
      email: newStoredUser.email,
      name: newStoredUser.name,
      createdAt: newStoredUser.createdAt
    };
    setUser(userWithoutSensitiveData);
    localStorage.setItem('socialhub_user', JSON.stringify(userWithoutSensitiveData));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('socialhub_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('socialhub_user', JSON.stringify(updatedUser));
      
      // Update in users list too (excluding sensitive data from the update)
      const users: StoredUser[] = JSON.parse(localStorage.getItem('socialhub_users') || '[]');
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { 
          ...users[userIndex], 
          name: updates.name ?? users[userIndex].name,
          avatar: updates.avatar ?? users[userIndex].avatar
        };
        localStorage.setItem('socialhub_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
