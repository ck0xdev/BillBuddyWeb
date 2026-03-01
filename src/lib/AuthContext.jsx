import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const authStatus = localStorage.getItem('billbuddy_auth') === 'true';
        setIsAuthenticated(authStatus);
        setLoading(false);
    }, []);

    const login = (username, password) => {
        if (username === 'btkukadiya' && password === 'Bhavesh_1980') {
            localStorage.setItem('billbuddy_auth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('billbuddy_auth');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
