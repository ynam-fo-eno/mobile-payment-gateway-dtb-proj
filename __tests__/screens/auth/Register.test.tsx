import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Register from '../../../src/screens/auth/Register';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() })
}));

((globalThis as any).fetch) = jest.fn();

describe('Register Screen', () => {
    
    beforeEach(() => {
        ((globalThis as any).fetch).mockClear();
        mockNavigate.mockClear();
    });

    it('fails local validation if passwords do not match', () => {
        const utils = render(<Register />) as any;

        fireEvent.changeText(utils.getByPlaceholderText('Full Name'), 'NewUser');
        fireEvent.changeText(utils.getByPlaceholderText('Email address'), 'test@test.com');
        fireEvent.changeText(utils.getByPlaceholderText('Password'), 'Secret123');
        fireEvent.changeText(utils.getByPlaceholderText('Confirm Password'), 'Secret456'); 
        
        fireEvent.press(utils.getByText('Create Account'));

        expect(utils.getByText('Passwords do not match.')).toBeTruthy();
        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('fails local validation for an invalid email', () => {
        const utils = render(<Register />) as any;

        fireEvent.changeText(utils.getByPlaceholderText('Full Name'), 'NewUser');
        fireEvent.changeText(utils.getByPlaceholderText('Email address'), 'not-an-email');
        fireEvent.changeText(utils.getByPlaceholderText('Password'), 'Secret123');
        fireEvent.changeText(utils.getByPlaceholderText('Confirm Password'), 'Secret123');
        
        fireEvent.press(utils.getByText('Create Account'));

        expect(utils.getByText('Please enter a valid email address.')).toBeTruthy();
        expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('navigates to Login on successful account creation', async () => {
        ((globalThis as any).fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'User created' }),
        });

        const utils = render(<Register />) as any;

        fireEvent.changeText(utils.getByPlaceholderText('Full Name'), 'ValidUser');
        fireEvent.changeText(utils.getByPlaceholderText('Email address'), 'valid@email.com');
        fireEvent.changeText(utils.getByPlaceholderText('Password'), 'Secret123');
        fireEvent.changeText(utils.getByPlaceholderText('Confirm Password'), 'Secret123');
        
        fireEvent.press(utils.getByText('Create Account'));

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('Login', { 
                successMessage: 'Account created successfully! Please log in.' 
            });
        });
    });

    it('displays parsed Django errors directly in the UI', async () => {
        ((globalThis as any).fetch).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ email: ["This email is already in use."] }),
        });

        const utils = render(<Register />) as any;

        fireEvent.changeText(utils.getByPlaceholderText('Full Name'), 'ExistingUser');
        fireEvent.changeText(utils.getByPlaceholderText('Email address'), 'taken@email.com');
        fireEvent.changeText(utils.getByPlaceholderText('Password'), 'Secret123');
        fireEvent.changeText(utils.getByPlaceholderText('Confirm Password'), 'Secret123');
        
        fireEvent.press(utils.getByText('Create Account'));

        await waitFor(() => {
            expect(utils.getByText('This email is already in use.')).toBeTruthy();
        });
    });
});