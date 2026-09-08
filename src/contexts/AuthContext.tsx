import React, { createContext, useState, ReactNode } from 'react';

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