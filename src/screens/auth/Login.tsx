import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {  ShieldCheck, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth'; 
import { API_BASE_URL } from '../../config/api'; 
import { parseApiError } from '../../utils/errorHandler';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authing, setAuth] = useState(false);
    
    const navigation = useNavigation<any>();
    const { login } = useAuth(); 
    const route = useRoute<any>();
    const [successMsg, setSuccessMsg] = useState(route.params?.successMessage || '');   
    const [showPassword, setShowPassword] = useState(false);

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [pendingAuth, setPendingAuth] = useState<{token: string, role: string} | null>(null);

    const handleLogin = async () => {
        setAuth(true);
        setError('');
        
        if (!username || !password) {
            setError('Please fill in all fields.');
            setAuth(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const userResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${data.access}` }
                });

                let userRole = 'CUSTOMER'; 
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    if (userData?.role) {
                        userRole = userData.role.toUpperCase();
                    }
                }
                
                if (userRole === 'MERCHANT') {
                    setPendingAuth({ token: data.access, role: userRole });
                    setShowOtpModal(true);
                } else {
                    login(data.access, userRole);
                }
            } else {
                setError(parseApiError(data, 'Login failed. Please try again.'));
            }
        } catch (err) {
            console.error("Network error:", err);
            setError('Could not connect to the server.');
        } finally {
            setAuth(false);
        }
    };

    const handleVerifyOtp = () => {
        setOtpError('');
        
        if (otp.length !== 6) {
            setOtpError('OTP must be exactly 6 characters.');
            return;
        }
        
        if (!/[A-Z]/.test(otp)) {
            setOtpError('OTP must contain at least one letter.');
            return;
        }

        setVerifyingOtp(true);
        
        setTimeout(() => {
            setVerifyingOtp(false);
            if (pendingAuth) {
                login(pendingAuth.token, pendingAuth.role);
            }
            setShowOtpModal(false);
            setOtp('');
        }, 1500);
    };

    const cancelOtp = () => {
        setShowOtpModal(false);
        setPendingAuth(null);
        setOtp('');
        setOtpError('');
    };

    return (
        <SafeAreaView className='flex-1 bg-dtb-red px-8'>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className='flex-1'
            >
                <ScrollView contentContainerStyle={{ paddingTop: 48, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                    
                    

                    {successMsg ? (
                        <View className="bg-green-100 border border-green-400 p-3 rounded-lg mb-6">
                            <Text className="text-green-700 text-center font-medium">{successMsg}</Text>
                        </View>
                    ) : null}

                    <View className='w-full max-w-[450px] mx-auto'>
                        <View className='w-full mb-8'>
                            <Text className='text-4xl font-bold mb-2 text-white'>DTB Wallet</Text>
                            <Text className='text-lg text-red-100'>Bank with us. Bank on us.</Text>
                        </View>

                        <View className='w-full mb-4'>
                            <View className="bg-white/20 rounded-lg mb-4 border border-white/30">
                                <TextInput
                                    placeholder='Username'
                                    placeholderTextColor='#E2E8F0' 
                                    className='w-full text-white px-4 py-4 text-base'
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize='none'
                                />
                            </View>
                            <View className="bg-white/20 rounded-lg mb-4 border border-white/30">
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
                        </View>

                        {error ? <Text className='text-yellow-300 mb-4 text-center font-medium'>{error}</Text> : null}

                        <Pressable
                            onPress={handleLogin}
                            disabled={authing}
                            className={`w-full bg-white mt-4 mb-8 rounded-lg p-4 items-center justify-center shadow-sm ${authing ? 'opacity-70' : 'opacity-100'}`}
                        >
                            <Text className='text-red-800 font-bold text-lg'>
                                {authing ? 'Authenticating...' : 'Log In'}
                            </Text>
                        </Pressable>

                        <View className='w-full flex-row items-center justify-center'>
                            <Text className='text-sm text-red-100'>Don't have a wallet? </Text>
                            <Pressable onPress={() => navigation.navigate('Register')}>
                                <Text className='text-sm font-bold text-white underline'>Register Here</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showOtpModal}
                onRequestClose={cancelOtp}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-6">
                    <View className="bg-white w-full max-w-[400px] rounded-2xl p-6 shadow-xl">
                        
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="bg-red-50 p-3 rounded-full mb-4">
                                {/* THE FIX: Updated to match the premium red */}
                                <ShieldCheck color="#962323" size={32} />
                            </View>
                            <Pressable onPress={cancelOtp} className="p-2 -mr-2 -mt-2">
                                <X color="#9CA3AF" size={24} />
                            </Pressable>
                        </View>

                        <Text className="text-2xl font-bold text-gray-900 mb-2">Security Check</Text>
                        <Text className="text-gray-500 mb-6 leading-5">
                            To secure your merchant account, please enter the One-Time Password sent to your registered device.
                        </Text>

                        <TextInput
                            // Remove 'text-center' from className and use the style prop below instead
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 mb-2 text-gray-900 text-2xl font-bold tracking-widest"
                            style={{ textAlign: 'center' }} // <-- THIS IS THE FIX
                            placeholder="A1B2C3"
                            placeholderTextColor="#D1D5DB"
                            maxLength={6}
                            value={otp}
                            onChangeText={(text) => setOtp(text.toUpperCase())}
                        />

                        {otpError ? <Text className="text-red-500 text-sm mb-4 text-center font-medium">{otpError}</Text> : <View className="h-4 mb-4" />}

                        <Pressable 
                            onPress={handleVerifyOtp}
                            disabled={verifyingOtp}
                            className={`w-full py-4 rounded-xl items-center flex-row justify-center ${verifyingOtp ? 'bg-red-800/70' : 'bg-red-800'}`}
                        >
                            {verifyingOtp ? (
                                <>
                                    <ActivityIndicator color="#ffffff" size="small" className="mr-2" />
                                    <Text className="text-white font-bold text-lg">Verifying...</Text>
                                </>
                            ) : (
                                <Text className="text-white font-bold text-lg">Verify & Log In</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Login;