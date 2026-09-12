import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CheckCircle, XCircle } from 'lucide-react-native';

const PaymentStatus = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    
    // Data passed from Confirmation.tsx
    const { success, message } = route.params;

    const handleDone = () => {
        // Pop all the way back to the Dashboard tabs
        navigation.navigate('MainTabs'); 
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center px-6">
            <View className="items-center mb-8">
                {success ? (
                    <CheckCircle color="#16a34a" size={100} strokeWidth={1.5} />
                ) : (
                    <XCircle color="#E32C22" size={100} strokeWidth={1.5} />
                )}
            </View>

            <Text className="text-3xl font-extrabold text-dtb-navy text-center mb-4">
                {success ? 'Success!' : 'Transaction Failed'}
            </Text>
            
            <Text className="text-gray-500 text-center text-base mb-12 px-4">
                {message}
            </Text>

            <Pressable 
                onPress={handleDone} 
                className={`w-full py-5 rounded-xl items-center shadow-sm ${success ? 'bg-green-600' : 'bg-dtb-navy'}`}
            >
                <Text className="text-white font-bold text-lg">Back to Dashboard</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default PaymentStatus;