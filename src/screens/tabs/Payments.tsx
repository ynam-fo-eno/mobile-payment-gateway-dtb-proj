import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import Star from 'lucide-react-native/icons/star';

const Payments = () => {
    const { role } = useAuth(); 
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleRequest = () => {
        console.log(`[NOTIFICATION] Requested KES ${amount} for ${description}`);
        setAmount('');
        setDescription('');
    };

    return (
        <SafeAreaView className="flex-1 bg-dtb-white">
            <View className="px-6 py-4 bg-dtb-red">
                <Text className="text-white text-2xl font-bold">
                    {role === 'CUSTOMER' ? 'Pending Approvals' : 'Request Payment'}
                </Text>
            </View>

            <ScrollView className="bg-dtb-orange px-6 pt-6 flex-1">
                {role === 'CUSTOMER' ? (
                    // CUSTOMER VIEW: Approve/Reject List
                    <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <Text className="text-dtb-navy font-bold text-lg">Java House</Text>
                                <Text className="text-gray-500">Coffee and Pastries</Text>
                            </View>
                            <View>
                                <Text className="text-dtb-orange font-extrabold text-lg">KES 850</Text>
                                <Star color="#90EE90" size={18} />
                            </View>
                            
                        </View>
                        <View className="flex-row gap-x-4">
                            <Pressable className="flex-1 bg-dtb-navy py-3 rounded-lg items-center">
                                <Text className="text-white font-bold">Approve</Text>
                            </Pressable>
                            <Pressable className="flex-1 border border-dtb-red py-3 rounded-lg items-center">
                                <Text className="text-dtb-red font-bold">Reject</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    // MERCHANT VIEW: Create Request Form
                    <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <Text className="text-dtb-navy font-bold mb-2">Amount (KES)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-dtb-navy"
                            placeholder="e.g. 5000"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <Text className="text-dtb-navy font-bold mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 text-dtb-navy"
                            placeholder="e.g. Invoice #1024"
                            placeholderTextColor="#9CA3AF"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Pressable 
                            onPress={handleRequest}
                            className="bg-dtb-red w-full py-4 rounded-lg items-center"
                        >
                            <Text className="text-white font-bold text-lg">Send Request</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Payments;