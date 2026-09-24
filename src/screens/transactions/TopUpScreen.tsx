import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, ArrowUp, Check } from 'lucide-react-native';

const TopUpScreen = () => {
    const navigation = useNavigation<any>();

    const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'DTBBANK'>('MPESA');
    const [paymentTarget, setPaymentTarget] = useState('');
    const [amount, setAmount] = useState('');

    const validateTarget = (method: 'MPESA' | 'DTBBANK', target: string) => {
        if (!target) return false;
        if (method === 'DTBBANK') {
            return /^\d{10}$/.test(target);
        } else {
            return /^((\+2547|\+2541)\d{8}|(07|01)\d{8})$/.test(target);
        }
    };
    const isValidTarget = validateTarget(paymentMethod, paymentTarget);
    const isValidAmount = amount.trim() !== '' && !isNaN(Number(amount)) && Number(amount) > 0;

    const handleProceed = () => {
        if (!isValidAmount) {
            Alert.alert("Invalid Amount", "Please enter a valid number greater than 0.");
            return;
        }

        if (!paymentTarget || !isValidTarget) {
            Alert.alert("Invalid Details", "Please provide a valid account or phone number.");
            return;
        }

        navigation.navigate('Confirmation', {
            actionType: 'TOP_UP',
            method: paymentMethod,
            target: paymentTarget,
            amount: Number(amount)
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 px-6 pt-6">
                <View className="flex-row justify-between items-center mb-8">
                    <View className="flex-row items-center">
                        <View className="bg-red-50 p-3 rounded-full mr-3">
                            <ArrowUp color="#962323" size={24} />
                        </View>
                        <Text className="text-2xl font-bold text-dtb-navy">Top Up Wallet</Text>
                    </View>
                    <Pressable onPress={() => navigation.goBack()} className="p-2 bg-gray-200 rounded-full">
                        <X color="#4B5563" size={20} />
                    </Pressable>
                </View>

                <View className="mb-8">
                    <Text className="text-dtb-navy font-semibold mb-3">Select Source</Text>
                    <View className="flex-row gap-4 mb-5">
                        {paymentMethod === 'MPESA' ? (
                            <Pressable className="flex-1 py-4 rounded-xl items-center border bg-dtb-red border-dtb-red shadow-sm">
                                <Text className="font-bold text-sm text-white">M-PESA</Text>
                            </Pressable>
                        ) : (
                            <Pressable onPress={() => { setPaymentMethod('MPESA'); setPaymentTarget(''); }} className="flex-1 py-4 rounded-xl items-center border bg-white border-gray-200 shadow-sm">
                                <Text className="font-bold text-sm text-gray-500">M-PESA</Text>
                            </Pressable>
                        )}

                        {paymentMethod === 'DTBBANK' ? (
                            <Pressable className="flex-1 py-4 rounded-xl items-center border bg-dtb-red border-dtb-red shadow-sm">
                                <Text className="font-bold text-sm text-white">DTB Bank</Text>
                            </Pressable>
                        ) : (
                            <Pressable onPress={() => { setPaymentMethod('DTBBANK'); setPaymentTarget(''); }} className="flex-1 py-4 rounded-xl items-center border bg-white border-gray-200 shadow-sm">
                                <Text className="font-bold text-sm text-gray-500">DTB Bank</Text>
                            </Pressable>
                        )}
                    </View>

                    <Text className="text-dtb-navy font-semibold mb-2">{paymentMethod === 'MPESA' ? 'Phone Number' : 'Account Number'}</Text>
                    <View className={`flex-row items-center bg-white border rounded-xl px-5 py-1 mb-2 ${paymentTarget.length > 0 ? (isValidTarget ? 'border-green-500' : 'border-red-400') : 'border-gray-200'}`}>
                        <TextInput
                            className="flex-1 text-dtb-navy text-lg font-medium py-3"
                            placeholder={paymentMethod === 'MPESA' ? '+2547... or 07...' : '10-digit Account No'}
                            placeholderTextColor="#9CA3AF"
                            keyboardType={paymentMethod === 'MPESA' ? 'phone-pad' : 'numeric'}
                            value={paymentTarget}
                            onChangeText={setPaymentTarget}
                        />
                        {isValidTarget && <Check color="#16a34a" size={22} />}
                    </View>
                </View>

                <View className="mb-8">
                    <Text className="text-dtb-navy font-semibold mb-2">Amount (KES)</Text>
                    <View className={`flex-row items-center bg-white border rounded-xl px-5 py-1 shadow-sm ${amount.length > 0 ? (isValidAmount ? 'border-green-500' : 'border-red-400') : 'border-gray-200'}`}>
                        <TextInput
                            className="flex-1 text-dtb-navy text-2xl font-bold py-3"
                            placeholder="0.00"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        {isValidAmount && <Check color="#16a34a" size={24} />}
                    </View>
                </View>

                <View className="pb-8 pt-4">
                    <Pressable onPress={handleProceed} className="w-full py-5 rounded-xl items-center shadow-md bg-dtb-red">
                        <Text className="text-white font-bold text-lg">Proceed</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default TopUpScreen;