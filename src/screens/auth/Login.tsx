import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth'; 

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authing, setAuth] = useState(false);
    
    const navigation = useNavigation<any>();
    const { login } = useAuth(); 
    const route = useRoute<any>();
    const [successMsg, setSuccessMsg] = useState(route.params?.successMessage || '');   

    const handleLogin = async () => {
        setAuth(true);
        setError('');
        
        if (!username || !password) {
            setError('Please fill in all fields.');
            setAuth(false);
            return;
        }

        try {
            const response = await fetch('http://10.0.2.2:8000/api/auth/login/', {
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
                const fetchedRole = data.role || (data.user && data.user.role) || 'CUSTOMER';
                const userRole = fetchedRole.toUpperCase();
                login(data.access, userRole);
            } else {
                setError(data.detail || data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error("Network error:", err);
            setError('Could not connect to the server.');
        } finally {
            setAuth(false);
        }
    };

    return (
        <SafeAreaView className='flex-1 bg-[#E32C22] justify-center px-8'>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className='flex-1 justify-center'
            >
                {successMsg ? (
                    <View className="bg-green-100 border border-green-400 p-3 rounded-lg mb-4">
                        <Text className="text-green-700 text-center font-medium">{successMsg}</Text>
                    </View>
                ) : null}
                
                <View className="flex-row items-center py-4 mb-2">
                    <Pressable 
                        onPress={() => navigation.goBack()} 
                        className="p-2 -ml-2 rounded-full active:bg-black/10" 
                    >
                        <ArrowLeft color="white" size={24} />
                    </Pressable>
                </View>

                <View className='w-full max-w-[450px] mx-auto'>
                    <View className='w-full mb-8 justify-center'>
                        <Text className='text-4xl font-bold mb-2 text-white'>DTB Wallet</Text>
                        <Text className='text-lg text-red-100'>Bank with us. Bank on us.</Text>
                    </View>

                    <View className='w-full mb-4'>
                        <View className="bg-white/10 rounded-lg p-2 mb-4">
                            <TextInput
                                placeholder='Username'
                                placeholderTextColor='#fca5a5'
                                className='w-full text-white px-4 py-3 text-base'
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize='none'
                            />
                        </View>
                        <View className="bg-white/10 rounded-lg p-2">
                            <TextInput
                                placeholder='Password'
                                placeholderTextColor='#fca5a5'
                                className='w-full text-white px-4 py-3 text-base'
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry 
                            />
                        </View>
                    </View>

                    {error ? <Text className='text-yellow-300 mb-4 text-center font-medium'>{error}</Text> : null}

                    <Pressable
                        onPress={handleLogin}
                        disabled={authing}
                        className={`w-full bg-white my-2 rounded-lg p-4 items-center justify-center shadow-sm ${authing ? 'opacity-70' : 'opacity-100'}`}
                    >
                        <Text className='text-[#E32C22] font-bold text-lg'>
                            {authing ? 'Authenticating...' : 'Log In'}
                        </Text>
                    </Pressable>

                    <View className='w-full flex-row items-center justify-center mt-8'>
                        <Text className='text-sm text-red-100'>Don't have a wallet? </Text>
                        <Pressable onPress={() => navigation.navigate('Register')}>
                            <Text className='text-sm font-bold text-white underline'>Register Here</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Login;