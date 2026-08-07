import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Payments = () => {
    const [role,setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER'); 
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleRequest = () => {
        console.log(`[NOTIFICATION] Requested KES ${amount} for ${description}`);
        setAmount('');
        setDescription('');
    };

    return (
        <SafeAreaView className="flex-1 bg-dtb-white">
            <View className="flex-row bg-dtb-yellow justify-center items-center mb-6">
                <TouchableOpacity  onPress={() => setRole(role === 'CUSTOMER' ? 'MERCHANT' : 'CUSTOMER')}className="bg-black/20 px-4 py-2 rounded-full">
                    <Text className="text-white text-xs font-bold tracking-wider">TEST: SWITCH ROLE</Text>
                </TouchableOpacity>
            </View>
            <View className="px-6 py-4 bg-dtb-red">
                <Text className="text-white text-2xl font-bold">
                    {role === 'CUSTOMER' ? 'Pending Approvals - Customer' : 'Request Payment - Merchant'}
                </Text>
            </View>

            <ScrollView className=" bg-dtb-orange px-6 pt-6">
                {role === 'CUSTOMER' ? (
                    // CUSTOMER VIEW: Approve/Reject List
                    <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <Text className="text-dtb-navy font-bold text-lg">Java House</Text>
                                <Text className="text-gray-500">Coffee and Pastries</Text>
                            </View>
                            <Text className="text-dtb-orange font-extrabold text-lg">KES 850</Text>
                        </View>
                        <View className="flex-row gap-x-4">
                            <TouchableOpacity className="flex-1 bg-dtb-navy py-3 rounded-lg items-center">
                                <Text className="text-white font-bold">Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 border border-dtb-red py-3 rounded-lg items-center">
                                <Text className="text-dtb-red font-bold">Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // MERCHANT VIEW: Create Request Form
                    <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <Text className="text-dtb-navy font-bold mb-2">Amount (KES)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-dtb-navy"
                            placeholder="e.g. 5000"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <Text className="text-dtb-navy font-bold mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 text-dtb-navy"
                            placeholder="e.g. Invoice #1024"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TouchableOpacity 
                            onPress={handleRequest}
                            className="bg-dtb-red w-full py-4 rounded-lg items-center"
                        >
                            <Text className="text-white font-bold text-lg">Send Request</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Payments;