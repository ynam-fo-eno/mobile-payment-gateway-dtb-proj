import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const navigation = useNavigation<any>();
    const { login } = useAuth(); // Using context to auto-login after successful registration

    const handleRegister = async () => {
        // 1. Validation: Empty fields
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        // 2. Validation: Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // 3. Validation: Password strength
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        // 4. Validation: Passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setCreating(true);
        setError('');

        try {
            const response = await fetch('http://10.0.2.2:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    fullname: name,         
                    email: email,
                    pword: password,        
                    user_role: role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to login and pass a success message parameter
                navigation.navigate('Login', { successMessage: 'Account created successfully! Please log in.' });
            } else {
                setError(data.message || 'Failed to create account.');
            }
        } catch (err) {
            console.error("Network error:", err);
            setError('Could not connect to the server.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <SafeAreaView className='flex-1 bg-[#E32C22] justify-center px-8'>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className='flex-1 justify-center'
            >
                <View className="flex-row items-center py-4 mb-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-black/10">
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>
                </View>

                <View className='w-full max-w-[450px] mx-auto'>
                    <View className='w-full mb-8 justify-center'>
                        <Text className='text-4xl font-bold mb-2 text-white'>Create Wallet</Text>
                        <Text className='text-lg text-red-100'>Join the DTB digital ecosystem.</Text>
                    </View>

                    {/* Role Simulator Toggle */}
                    <View className="flex-row bg-red-800/50 p-1 rounded-lg mb-6">
                        <TouchableOpacity 
                            onPress={() => setRole('CUSTOMER')}
                            className={`flex-1 py-2 items-center rounded-md ${role === 'CUSTOMER' ? 'bg-white' : ''}`}
                        >
                            <Text className={`font-semibold ${role === 'CUSTOMER' ? 'text-[#E32C22]' : 'text-white'}`}>Personal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setRole('MERCHANT')}
                            className={`flex-1 py-2 items-center rounded-md ${role === 'MERCHANT' ? 'bg-white' : ''}`}
                        >
                            <Text className={`font-semibold ${role === 'MERCHANT' ? 'text-[#E32C22]' : 'text-white'}`}>Business</Text>
                        </TouchableOpacity>
                    </View>

                    <View className='w-full mb-4'>
                        <View className="bg-white/10 rounded-lg p-2 mb-4">
                            <TextInput
                                placeholder='Full Name or Business Name'
                                placeholderTextColor='#fca5a5'
                                className='w-full text-white px-4 py-3 text-base'
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                        <View className="bg-white/10 rounded-lg p-2 mb-4">
                            <TextInput
                                placeholder='Email address'
                                placeholderTextColor='#fca5a5'
                                className='w-full text-white px-4 py-3 text-base'
                                value={email}
                                onChangeText={setEmail}
                                keyboardType='email-address'
                                autoCapitalize='none'
                            />
                        </View>
                       {/* Password Input with Toggle */}
                        <View className="bg-white/10 rounded-lg p-2 mb-4">
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                className='w-full text-white px-4 py-3 text-base'
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 py-2"
                            >
                                <Text className="text-dtb-red font-bold text-xs">
                                    {showPassword ? 'HIDE' : 'SHOW'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password Input with Toggle */}
                        <View className="bg-white/10 rounded-lg p-2 mb-4">
                            <TextInput
                                className="w-full text-white px-4 py-3 text-base"
                                placeholder="Confirm Password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 py-2"
                            >
                                <Text className="text-dtb-red font-bold text-xs">
                                    {showConfirmPassword ? 'HIDE' : 'SHOW'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Error Message Display */}
                    {error ? <Text className='text-yellow-300 mb-4 text-center font-medium'>{error}</Text> : null}

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={creating}
                        className={`w-full bg-white my-2 rounded-lg p-4 items-center justify-center shadow-sm ${creating ? 'opacity-70' : 'opacity-100'}`}
                    >
                        <Text className='text-[#E32C22] font-bold text-lg'>
                            {creating ? 'Creating...' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Register;