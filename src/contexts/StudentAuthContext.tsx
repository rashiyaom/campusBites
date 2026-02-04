"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  department: string;
  studentId: string;
  createdAt: Date;
}

interface StudentAuthState {
  student: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  institute: string;
  department: string;
  studentId: string;
}

interface StudentAuthContextType extends StudentAuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

// Load students from localStorage or initialize empty array
const loadStudentsFromStorage = (): Array<Student & { password: string }> => {
  if (typeof window === 'undefined') return [];
  
  const saved = localStorage.getItem('mockStudents');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

// Save students to localStorage
const saveStudentsToStorage = (students: Array<Student & { password: string }>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mockStudents', JSON.stringify(students));
};

// Mock student database (in real app, this would be in backend)
let MOCK_STUDENTS: Array<Student & { password: string }> = loadStudentsFromStorage();

export const StudentAuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<StudentAuthState>({
    student: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading true until we check localStorage
    error: null
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find student in mock database
    const student = MOCK_STUDENTS.find(
      s => s.email === credentials.email && s.password === credentials.password
    );

    if (student) {
      const { password, ...studentData } = student;
      
      setAuthState({
        student: studentData,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Save to localStorage for persistence
      localStorage.setItem('student', JSON.stringify(studentData));
    } else {
      setAuthState({
        student: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid email or password'
      });
      throw new Error('Invalid credentials');
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if email already exists
    const existingStudent = MOCK_STUDENTS.find(s => s.email === data.email);
    
    if (existingStudent) {
      setAuthState({
        student: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Email already registered'
      });
      throw new Error('Email already exists');
    }

    // Create new student
    const newStudent: Student & { password: string } = {
      id: `student-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      institute: data.institute,
      department: data.department,
      studentId: data.studentId,
      password: data.password,
      createdAt: new Date()
    };

    MOCK_STUDENTS.push(newStudent);
    
    // Save updated students list to localStorage
    saveStudentsToStorage(MOCK_STUDENTS);

    const { password, ...studentData } = newStudent;

    setAuthState({
      student: studentData,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });

    // Save to localStorage
    localStorage.setItem('student', JSON.stringify(studentData));
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      student: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    localStorage.removeItem('student');
  }, []);

  // Restore student from localStorage on mount
  React.useEffect(() => {
    const savedStudent = localStorage.getItem('student');
    if (savedStudent) {
      try {
        const student = JSON.parse(savedStudent);
        setAuthState({
          student,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        localStorage.removeItem('student');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      // No saved student, just set loading to false
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return (
    <StudentAuthContext.Provider value={{ ...authState, login, signup, logout }}>
      {children}
    </StudentAuthContext.Provider>
  );
};

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};
