import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Login from '../../../src/screens/auth/Login';
import { AuthContext } from '../../../src/contexts/AuthContext';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
    useRoute: () => ({ params: {} }) 
}));

(globalThis as any).fetch = jest.fn();

describe('Login Screen', () => {
    const mockLoginFn = jest.fn();

    beforeEach(() => {
        ((globalThis as any).fetch).mockClear();
        mockLoginFn.mockClear();
    });

    const renderLogin = () => {
        return render(
            <AuthContext.Provider value={{ userToken: null, role: null, login: mockLoginFn, logout: jest.fn() }}>
                <Login />
            </AuthContext.Provider>
        );
    };

    it('shows a local validation error if fields are empty', () => {
        renderLogin();
        
        fireEvent.press(screen.getByText('Log In'));
        
        expect(screen.getByText('Please fill in all fields.')).toBeTruthy();
    });

    it('logs in a CUSTOMER immediately upon valid credentials', async () => {
        ((globalThis as any).fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access: 'fake-customer-token' }),
        });
        ((globalThis as any).fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ role: 'CUSTOMER' }),
        });

        renderLogin();

        fireEvent.changeText(screen.getByPlaceholderText('Username'), 'TestUser');
        fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Password123');
        fireEvent.press(screen.getByText('Log In'));

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledTimes(2);
            expect(mockLoginFn).toHaveBeenCalledWith('fake-customer-token', 'CUSTOMER');
        });
    });

    it('shows the OTP modal for MERCHANT login instead of logging in directly', async () => {
        ((globalThis as any).fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access: 'fake-merchant-token' }),
        });
        ((globalThis as any).fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ role: 'MERCHANT' }),
        });

        renderLogin();

        fireEvent.changeText(screen.getByPlaceholderText('Username'), 'MerchantUser');
        fireEvent.changeText(screen.getByPlaceholderText('Password'), 'Password123');
        fireEvent.press(screen.getByText('Log In'));

        await waitFor(() => {
            expect(mockLoginFn).not.toHaveBeenCalled();
            expect(screen.getByText('Security Check')).toBeTruthy();
        });
    });

    it('renders the parsed API error when Django rejects credentials', async () => {
        ((globalThis as any).fetch).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'No active account found with the given credentials' }),
        });

        renderLogin();

        fireEvent.changeText(screen.getByPlaceholderText('Username'), 'WrongUser');
        fireEvent.changeText(screen.getByPlaceholderText('Password'), 'WrongPass');
        fireEvent.press(screen.getByText('Log In'));

        await waitFor(() => {
            expect(screen.getByText('No active account found with the given credentials')).toBeTruthy();
        });
    });
});