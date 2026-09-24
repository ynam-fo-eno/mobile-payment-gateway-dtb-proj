import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

interface AuthContextType {
    userToken: string | null;
    role: string | null;
    login: (token: string, role: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    role: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // THE FIX: Globally fetch the role if we have a token but missed the role
    useEffect(() => {
        const fetchUserRole = async () => {
            if (userToken && !role) {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/me/`, {
                        headers: { 'Authorization': `Bearer ${userToken}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data?.role) setRole(data.role);
                    }
                } catch (error) {
                    console.error("Global role fetch error:", error);
                }
            }
        };
        fetchUserRole();
    }, [userToken]);

    const login = (token: string, userRole: string) => {
        setUserToken(token);
        setRole(userRole);
    };

    const logout = () => {
        setUserToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ userToken, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};