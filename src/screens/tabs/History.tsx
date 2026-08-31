import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import Star from 'lucide-react-native/icons/star';

const History = () => {
    const { userToken, role } = useAuth();
    const [verifiedRole, setVerifiedRole] = useState(role ? role.toUpperCase() : 'CUSTOMER');
    const [loadingRole, setLoadingRole] = useState(true);

    const transactions = [
        { id: 1, date: '2026-09-01', entity: 'Naivas Supermarket', amount: 'KES 4,500', status: 'PAID' },
        { id: 2, date: '2026-09-02', entity: 'KPLC Tokens', amount: 'KES 1,000', status: 'PAID' },
        { id: 3, date: '2026-09-03', entity: 'Quickmart', amount: 'KES 2,200', status: 'FAILED' },
    ];

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await fetch('http://10.0.2.2:8000/api/auth/me/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok && data?.role) {
                    setVerifiedRole(data.role.toUpperCase());
                }
            } catch (error) {
                console.error("Error fetching role:", error);
            } finally {
                setLoadingRole(false);
            }
        };
        fetchRole();
    }, [userToken]);

    return (
        <SafeAreaView className="flex-1 bg-dtb-white">
            <View className="px-6 py-4 bg-dtb-red">
                <Text className="text-white text-center text-2xl font-bold">
                    {verifiedRole === 'CUSTOMER' ? 'Transaction History' : 'Merchant Settlement'}
                </Text>
            </View>

            <ScrollView className="bg-dtb-orange px-6 pt-6 mb-4 flex-1">
                {loadingRole ? (
                     <ActivityIndicator size="large" color="#E32C22" className="mt-10" />
                ) : verifiedRole === 'CUSTOMER' ? (
                    transactions.map((txn) => (
                        <View key={txn.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row justify-between items-center mb-3">
                            <View>
                                <Text className="text-dtb-navy font-bold text-base">{txn.entity}</Text>
                                <Text className="text-gray-400 text-xs mt-1">{txn.date}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-dtb-navy font-extrabold">{txn.amount}</Text>
                                <Text className={`text-xs font-bold mt-1 ${txn.status === 'PAID' ? 'text-green-600' : 'text-dtb-red'}`}>
                                    {txn.status}
                                </Text>
                                <Star color="#90EE90" size={18} />
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row justify-between items-center mb-3">
                        <View>
                            <Text className="text-dtb-navy font-bold text-base">Merchant Settlement Summary</Text>
                            <Text className="text-gray-500 text-xs mt-1">All settled payouts will appear here.</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default History;