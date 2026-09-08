import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    
    const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const navigation = useNavigation<any>();
    const { login } = useAuth(); 

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        setCreating(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    username: name, 
                    email: email,
                    password: password,
                    password_confirm: confirmPassword,
                    role: role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigation.navigate('Login', { successMessage: 'Account created successfully! Please log in.' });
            } else {
                let errorMessage = 'Failed to create account.';
                if (data.message || data.detail) {
                    errorMessage = data.message || data.detail;
                } else if (data && typeof data === 'object') {
                    const firstKey = Object.keys(data)[0]; 
                    if (firstKey) {
                        const errorContent = data[firstKey];
                        if (Array.isArray(errorContent)) {
                            errorMessage = `${firstKey}: ${errorContent[0]}`;
                        } else if (typeof errorContent === 'string') {
                            errorMessage = `${firstKey}: ${errorContent}`;
                        }
                    }
                }
                setError(errorMessage);
            }
        } catch (err) {
            console.error("Network error:", err);
            setError('Could not connect to the server.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <SafeAreaView className='flex-1 bg-red-800 px-8'>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className='flex-1'
            >
                <ScrollView contentContainerStyle={{ paddingTop: 32, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                    
                    <View className="flex-row items-center mb-6">
                        <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full active:bg-black/10">
                            <ArrowLeft color="white" size={24} />
                        </Pressable>
                    </View>

                    <View className='w-full max-w-[450px] mx-auto'>
                        <View className='w-full mb-8'>
                            <Text className='text-4xl font-bold mb-2 text-white'>Create Wallet</Text>
                            <Text className='text-lg text-red-100'>Join the DTB digital ecosystem.</Text>
                        </View>

                        {/* Accordion Dropdown over pill buttons */}
                        <View className="mb-6">
                            <Text className="text-red-100 text-sm font-medium mb-2 uppercase tracking-wider">Account Type</Text>
                            <Pressable 
                                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="bg-white/20 border border-white/30 p-4 rounded-lg flex-row justify-between items-center"
                            >
                                <Text className="text-white font-bold text-base">
                                    {role === 'CUSTOMER' ? 'Personal Account' : 'Business Account'}
                                </Text>
                                <Text className="text-white font-bold tracking-widest">{isDropdownOpen ? '▲' : '▼'}</Text>
                            </Pressable>
                            
                            {isDropdownOpen && (
                                <View className="bg-red-900 border border-white/20 rounded-lg mt-2 overflow-hidden shadow-lg">
                                    <Pressable 
                                        onPress={() => { setRole('CUSTOMER'); setIsDropdownOpen(false); }}
                                        className={`p-4 border-b border-white/10 ${role === 'CUSTOMER' ? 'bg-black/20' : ''}`}
                                    >
                                        <Text className="text-white font-medium">Personal Account</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => { setRole('MERCHANT'); setIsDropdownOpen(false); }}
                                        className={`p-4 ${role === 'MERCHANT' ? 'bg-black/20' : ''}`}
                                    >
                                        <Text className="text-white font-medium">Business Account</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        <View className='w-full mb-4'>
                            <View className="bg-white/20 rounded-lg border border-white/30 mb-4">
                                <TextInput
                                    placeholder={role === 'MERCHANT' ? 'Business Name' : 'Full Name'}
                                    placeholderTextColor='#E2E8F0'
                                    className='w-full text-white px-4 py-4 text-base'
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize='words'
                                />
                            </View>

                            <View className="bg-white/20 rounded-lg border border-white/30 mb-4">
                                <TextInput
                                    placeholder='Email address'
                                    placeholderTextColor='#E2E8F0'
                                    className='w-full text-white px-4 py-4 text-base'
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                />
                            </View>

                            <View className="bg-white/20 rounded-lg border border-white/30 mb-4">
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#E2E8F0"
                                    className='w-full text-white px-4 py-4 text-base'
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
                                    <Text className="text-white font-bold text-xs tracking-wider">
                                        {showPassword ? 'HIDE' : 'SHOW'}
                                    </Text>
                                </Pressable>
                            </View>

                            <View className="bg-white/20 rounded-lg border border-white/30 mb-4">
                                <TextInput
                                    className="w-full text-white px-4 py-4 text-base"
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#E2E8F0"
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-4">
                                    <Text className="text-white font-bold text-xs tracking-wider">
                                        {showConfirmPassword ? 'HIDE' : 'SHOW'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {error ? <Text className='text-yellow-300 mb-4 text-center font-medium'>{error}</Text> : null}

                        <Pressable
                            onPress={handleRegister}
                            disabled={creating}
                            className={`w-full bg-white mt-4 mb-8 rounded-lg p-4 items-center justify-center shadow-sm ${creating ? 'opacity-70' : 'opacity-100'}`}
                        >
                            <Text className='text-red-800 font-bold text-lg'>
                                {creating ? 'Creating...' : 'Create Account'}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Register; 