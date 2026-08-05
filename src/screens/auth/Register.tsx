import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [creating, setCreating] = useState(false);
    const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
    
    const navigation = useNavigation<any>();

    const handleRegister = () => {
        setCreating(true);
        console.log(`Mock Register: ${name}, ${email} as ${role}`);
        setTimeout(() => {
            setCreating(false);
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
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
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

                <View className='w-full mb-6'>
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
                    <View className="bg-white/10 rounded-lg p-2 mb-4">
                        <TextInput
                            placeholder='Secure Password'
                            placeholderTextColor='#fca5a5'
                            className='w-full text-white px-4 py-3 text-base'
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry 
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={creating}
                    className='w-full bg-white my-2 rounded-lg p-4 items-center justify-center shadow-sm'
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