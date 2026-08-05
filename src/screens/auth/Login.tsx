import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [authing, setAuth] = useState(false);
    
    // Simulation state for the presentation
    const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
    
    const navigation = useNavigation<any>();

    const handleLogin = () => {
        setAuth(true);
        console.log(`Mock Login: ${email} as ${role}`);
        
        // Simulate a successful login redirect to the Tab navigator
        setTimeout(() => {
            setAuth(false);
            navigation.navigate('MainTabs'); 
        }, 500);
    };

    return (
        <SafeAreaView className='flex-1 bg-[#E32C22] justify-center px-8'>
            <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className='flex-1 bg-[#E32C22] justify-center px-8'
        >
            <View className="flex-row items-center py-4 mb-2">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    className="p-2 -ml-2 rounded-full active:bg-black/10" 
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
            </View>

            <View className='w-full max-w-[450px] mx-auto'>
                {/* Header section */}
                <View className='w-full mb-8 justify-center'>
                    <Text className='text-4xl font-bold mb-2 text-white'>DTB Wallet</Text>
                    <Text className='text-lg text-red-100'>Bank with us. Bank on us.</Text>
                </View>

                {/* Role Simulator Toggle */}
                <View className="flex-row bg-red-800/50 p-1 rounded-lg mb-6">
                    <TouchableOpacity 
                        onPress={() => setRole('CUSTOMER')}
                        className={`flex-1 py-2 items-center rounded-md ${role === 'CUSTOMER' ? 'bg-white' : ''}`}
                    >
                        <Text className={`font-semibold ${role === 'CUSTOMER' ? 'text-[#E32C22]' : 'text-white'}`}>Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setRole('MERCHANT')}
                        className={`flex-1 py-2 items-center rounded-md ${role === 'MERCHANT' ? 'bg-white' : ''}`}
                    >
                        <Text className={`font-semibold ${role === 'MERCHANT' ? 'text-[#E32C22]' : 'text-white'}`}>Merchant</Text>
                    </TouchableOpacity>
                </View>

                {/* Input fields */}
                <View className='w-full mb-6'>
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
                    <View className="bg-white/10 rounded-lg p-2 mb-4">
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

                {/* Login Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={authing}
                    className='w-full bg-white my-2 rounded-lg p-4 items-center justify-center shadow-sm'
                >
                    <Text className='text-[#E32C22] font-bold text-lg'>
                        {authing ? 'Authenticating...' : 'Log In'}
                    </Text>
                </TouchableOpacity>

                {/* Link to Sign Up */}
                <View className='w-full flex-row items-center justify-center mt-8'>
                    <Text className='text-sm text-red-100'>Don't have a wallet? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text className='text-sm font-bold text-white underline'>Register Here</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
        </SafeAreaView>
        
    );
};

export default Login;