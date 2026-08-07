import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const History = () => {
    // Mock data based on the project scope requirements
    const transactions = [
        { id: 1, date: '2026-09-01', entity: 'Naivas Supermarket', amount: 'KES 4,500', status: 'PAID' },
        { id: 2, date: '2026-09-02', entity: 'KPLC Tokens', amount: 'KES 1,000', status: 'PAID' },
        { id: 3, date: '2026-09-03', entity: 'Quickmart', amount: 'KES 2,200', status: 'FAILED' },
    ];

     const [role,setRole] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');

    return (
        <SafeAreaView className="flex-1 bg-dtb-white">
             <View className="flex-row bg-dtb-yellow justify-center items-center mb-6">
                            <TouchableOpacity  onPress={() => setRole(role === 'CUSTOMER' ? 'MERCHANT' : 'CUSTOMER')}className="bg-black/20 px-4 py-2 rounded-full">
                                <Text className="text-white text-xs font-bold tracking-wider">TEST: SWITCH ROLE</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="px-6 py-4 bg-dtb-red">
                            <Text className="text-white text-2xl font-bold">
                                {role === 'CUSTOMER' ? 'Transaction History - Customer' : 'Transaction History -  Merchant'}
                            </Text>
                        </View>


            <ScrollView className=" bg-dtb-orange px-6 pt-6 mb-4">
            {role === 'CUSTOMER' ? 
            (transactions.map((txn) => (
                    <View key={txn.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row justify-between items-center mb-3">
                        <View>
                            <Text className="text-dtb-navy font-bold text-base">{txn.entity}</Text>
                            <Text className="text-gray-400 text-xs mt-1">{txn.date}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-dtb-navy font-extrabold">{txn.amount}</Text>
                            <Text className={`text-xs font-bold mt-1 ${txn.status === 'PAID' ? 'text-green-600' : 'text-dtb-red'}`}>
                                {txn.status}
                            </Text>
                        </View>
                    </View>
                )))
            :
            (<View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row justify-between items-center mb-3">
                <View>
                    <Text className="text-dtb-navy font-bold text-base">Merchant Settlement</Text>
                </View>
            </View>) }
                
            </ScrollView>
        </SafeAreaView>
    );
};

export default History;

