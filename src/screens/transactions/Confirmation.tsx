import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';
import { ArrowLeft } from 'lucide-react-native';
// IMPORT THE ERROR HANDLER
import { parseApiError } from '../../utils/errorHandler';

const Confirmation = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { userToken } = useAuth();
    
    const { actionType, method, target, amount } = route.params;

    const [isProcessing, setIsProcessing] = useState(false);
    const [isWaitingForPin, setIsWaitingForPin] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        
        try {
            if (actionType === 'TOP_UP') {
                setIsWaitingForPin(true);
                await new Promise<void>(resolve => setTimeout(resolve, 2000));
                setIsWaitingForPin(false);

                const response = await fetch(`${API_BASE_URL}/mobile/top_up/`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, method, source: target })
                });

                const data = await response.json();

                if (response.ok) {
                    navigation.navigate('PaymentStatus', { success: true, message: `Successfully added KES ${amount} to your wallet.` });
                } else {
                    // THE FIX: Parse the error before sending it to the status screen
                    navigation.navigate('PaymentStatus', { success: false, message: parseApiError(data, "Transaction failed.") });
                }
            } 
            else if (actionType === 'PAY') {
                const response = await fetch(`${API_BASE_URL}/mobile/pay/`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, merchant_email: target })
                });

                const data = await response.json();

                if (response.ok) {
                    navigation.navigate('PaymentStatus', { success: true, message: `Successfully paid KES ${amount} to ${route.params.targetName}.` });
                } else {
                    // THE FIX: Parse the error before sending it to the status screen
                    navigation.navigate('PaymentStatus', { success: false, message: parseApiError(data, "Transaction failed.") });
                }
            }
        } catch (error) {
            navigation.navigate('PaymentStatus', { success: false, message: "Network error. Could not connect to the server." });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 px-6 pt-6">
            <View className="flex-row items-center mb-10">
                <Pressable onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft color="#4B5563" size={24} />
                </Pressable>
                <Text className="text-xl font-bold text-dtb-navy">Confirm Transaction</Text>
            </View>

            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                <Text className="text-center text-gray-500 mb-2">You are about to {actionType === 'TOP_UP' ? 'top up' : 'pay'}</Text>
                <Text className="text-center text-4xl font-extrabold text-dtb-navy mb-6">KES {amount}</Text>

                <View className="border-t border-gray-100 py-4 flex-row justify-between">
                    <Text className="text-gray-500 font-medium">Source</Text>
                    <Text className="text-dtb-navy font-bold">{method}</Text>
                </View>
                <View className="border-t border-gray-100 pt-4 flex-row justify-between">
                    <Text className="text-gray-500 font-medium">{actionType === 'TOP_UP' ? 'Account / Number' : 'Merchant'}</Text>
                    <Text className="text-dtb-navy font-bold">{actionType === 'TOP_UP' ? target : route.params.targetName}</Text>
                </View>
            </View>

            <View className="mt-auto mb-8">
                <Pressable  
                    onPress={handleConfirm} 
                    disabled={isProcessing} 
                    className={`w-full py-5 rounded-xl items-center shadow-md mb-4 ${isProcessing ? 'bg-dtb-red/70' : 'bg-dtb-red'}`} 
                >
                    {isProcessing ? (
                        <View className="flex-row items-center">
                            <ActivityIndicator color="#ffffff" className="mr-3" />
                            <Text className="text-white font-bold text-lg">{isWaitingForPin ? 'Check Phone for PIN...' : 'Processing...'}</Text>
                        </View>
                    ) : (
                        <Text className="text-white font-bold text-lg">Confirm & Pay</Text>
                    )}
                </Pressable>

                <Pressable 
                    onPress={() => navigation.goBack()}
                    disabled={isProcessing}
                    className="w-full py-5 rounded-xl items-center border border-gray-300 bg-white"
                >
                    <Text className="text-gray-600 font-bold text-lg">Cancel</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

export default Confirmation;