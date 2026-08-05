import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Dashboard = () => {
    // Development toggle to easily test both states
    const [role, setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');

    return (
        <SafeAreaView className="flex-1 bg-dtb-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header Card */}
                <View className="px-6 pt-4 pb-8 bg-dtb-red rounded-b-3xl shadow-md">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-2xl font-bold">
                            {role === 'CUSTOMER' ? 'My Wallet' : 'Merchant Portal'}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => setRole(role === 'CUSTOMER' ? 'MERCHANT' : 'CUSTOMER')}
                            className="bg-black/20 px-4 py-2 rounded-full"
                        >
                            <Text className="text-white text-xs font-bold tracking-wider">TEST: SWITCH ROLE</Text>
                        </TouchableOpacity>
                    </View>

                    {role === 'CUSTOMER' ? (
                        <View>
                            <Text className="text-red-100 text-sm font-medium uppercase tracking-wider">Available Balance</Text>
                            <Text className="text-white text-4xl font-extrabold mt-1">KES 12,500</Text>
                        </View>
                    ) : (
                        <View className="flex-row justify-between">
                            <View>
                                <Text className="text-red-100 text-sm font-medium uppercase tracking-wider">Available</Text>
                                <Text className="text-white text-3xl font-extrabold mt-1">KES 45,000</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-red-100 text-sm font-medium uppercase tracking-wider">Pending</Text>
                                <Text className="text-dtb-yellow text-3xl font-extrabold mt-1">KES 5,000</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Quick Actions / Recent Snapshot */}
                <View className="px-6 mt-8">
                    <Text className="text-dtb-navy text-lg font-bold mb-4">
                        {role === 'CUSTOMER' ? 'Quick Actions' : 'Overview'}
                    </Text>
                    <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm items-center">
                        <Text className="text-gray-400 text-sm text-center">
                            {role === 'CUSTOMER' 
                                ? 'Top up functionality (mock) will go here.' 
                                : 'Settlement summary will go here.'}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Dashboard;