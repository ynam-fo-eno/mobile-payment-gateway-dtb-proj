import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { Clock, Eye, EyeOff, BanknoteArrowUp, Wallet, ArrowUp } from 'lucide-react-native';
import { API_BASE_URL } from '../../config/api';

const Dashboard = () => {
    const { role, logout, userToken } = useAuth(); 
    const navigation = useNavigation<any>();
    
    const [balance, setBalance] = useState<number | null>(null);
    const [pendingBalance, setPendingBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifiedRole, setVerifiedRole] = useState(role ? role.toUpperCase() : 'CUSTOMER');
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchDashboardData = async () => {
                try {
                    const walletResponse = await fetch(`${API_BASE_URL}/wallet/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
                    });
                    
                    if (walletResponse.ok) {
                        const walletData = await walletResponse.json();
                        const walletObj = Array.isArray(walletData) ? walletData[0] : walletData;
                        setBalance(walletObj?.balance ?? walletObj?.available_balance ?? 0);
                        setPendingBalance(walletObj?.pending_balance ?? 0);
                    }

                    const userResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
                    });

                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        if (userData?.role) setVerifiedRole(userData.role.toUpperCase());
                    }

                    const txResponse = await fetch(`${API_BASE_URL}/transactions/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
                    });

                    if (txResponse.ok) {
                        const txData = await txResponse.json();
                        setRecentTransactions(txData); // No longer sliced to 5
                    }
                } catch (error) {
                    console.error("Network error fetching dashboard data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchDashboardData();
        }, [userToken])
    );

    const toggleBalanceVisibility = () => setIsBalanceVisible(!isBalanceVisible);

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-4 pb-8 bg-dtb-red rounded-b-3xl shadow-md">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-2xl font-bold">
                            {verifiedRole === 'CUSTOMER' ? 'My Wallet' : 'Merchant Portal'}
                        </Text>
                        <Wallet className="-ml-5" color="#ffffff" size={24} />
                        <Pressable onPress={logout} className="bg-black/20 px-4 py-2 rounded-full">
                            <Text className="text-white text-xs font-bold tracking-wider">LOG OUT</Text>
                        </Pressable>
                    </View>

                    {verifiedRole === 'CUSTOMER' ? (
                        <View className="flex-row justify-between items-end">
                            <View>
                                <Text className="text-red-100 text-sm font-medium uppercase tracking-wider">Available Balance</Text>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" className="items-start mt-2" />
                                ) : (
                                    <Text className="text-white text-4xl font-extrabold mt-1">
                                        {isBalanceVisible 
                                            ? `KES ${balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}` 
                                            : '****'}
                                    </Text>
                                )}
                            </View>
                            <Pressable onPress={toggleBalanceVisibility} className="p-2 mb-1 bg-black/10 rounded-full">
                                {isBalanceVisible ? <EyeOff color="#ffffff" size={20} /> : <Eye color="#ffffff" size={20} />}
                            </Pressable>
                        </View>
                    ) : (
                        <View className="flex-row justify-between items-start">
                            <View>
                                <Text className="text-red-100 text-sm font-medium uppercase tracking-wider">Available</Text>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" className="items-start mt-2" />
                                ) : (
                                    <View className="flex-row items-center">
                                        <Text className="text-white text-3xl font-extrabold mt-1">
                                            {isBalanceVisible 
                                                ? `KES ${balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}` 
                                                : '****'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View className="items-end">
                                <View className="flex-row items-center justify-end">
                                    <Text className="text-red-100 text-sm font-medium uppercase tracking-wider mr-2">Pending</Text>
                                    <Pressable onPress={toggleBalanceVisibility} className="p-1.5 bg-black/10 rounded-full">
                                        {isBalanceVisible ? <EyeOff color="#ffffff" size={16} /> : <Eye color="#ffffff" size={16} />}
                                    </Pressable>
                                </View>
                                <Text className="text-dtb-yellow text-3xl font-extrabold mt-1">
                                    {isBalanceVisible ? `KES ${pendingBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}` : '****'}
                                </Text>  
                            </View>
                        </View>
                    )}
                </View>

                <View className="px-6 mt-8">
                    <Text className="text-dtb-navy text-lg font-bold mb-4">
                        {verifiedRole === 'CUSTOMER' ? 'Quick Actions' : 'Overview'}
                    </Text>

                    {verifiedRole === 'CUSTOMER' ? (
                        <View className="flex-row justify-center gap-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                            <Pressable onPress={() => navigation.navigate('TopUp')} className="items-center w-24">
                                <View className="bg-red-50 p-4 rounded-full mb-3">
                                    <ArrowUp color="#E32C22" size={32} />
                                </View>
                                <Text className="text-dtb-navy font-bold text-sm">Top Up</Text>
                            </Pressable>

                            <Pressable onPress={() => navigation.navigate('Pay')} className="items-center w-24">
                                <View className="bg-red-50 p-4 rounded-full mb-3">
                                    <BanknoteArrowUp color="#E32C22" size={32} />
                                </View>
                                <Text className="text-dtb-navy font-bold text-sm">Pay</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm items-center mb-8">
                            <Text className="text-gray-400 text-sm text-center">Settlement summary will go here.</Text>
                        </View>
                    )}
                </View>

                <View className="px-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-dtb-navy text-lg font-bold">Recent Transactions</Text>
                        <Clock color="#9CA3AF" size={18} />
                    </View>

                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((txn) => {
                            let counterpart = 'Unknown Entity';
                            
                            // 1. If it's a Top Up, just hardcode the text!
                            if (txn.transaction_type?.toUpperCase() === 'TOP_UP') {
                                counterpart = 'Wallet Top Up';
                            } 
                            // 2. Otherwise, do the normal Merchant/Customer logic
                            else if (verifiedRole === 'CUSTOMER') {
                                counterpart = txn.merchant_name || txn.merchant_username || txn.merchant?.name || txn.merchant?.username || (typeof txn.merchant === 'string' ? txn.merchant : 'Unknown Merchant');
                            } else {
                                counterpart = txn.customer_name || txn.customer_username || txn.customer?.name || txn.customer?.username || (typeof txn.customer === 'string' ? txn.customer : 'Unknown Customer');
                            }
                            
                            const rawStatus = txn.status ? txn.status.toUpperCase() : '';
                            let displayStatus = 'COMPLETED'; 
                            let statusColor = 'text-green-600';
                            
                            if (rawStatus === 'PAID' || rawStatus === 'COMPLETED' || rawStatus === 'SUCCESS') {
                                displayStatus = 'COMPLETED';
                                statusColor = 'text-green-600';
                            } else if (rawStatus === '-' || rawStatus === 'FAILED' || rawStatus === 'REJECTED') {
                                displayStatus = 'FAILED/REJECTED';
                                statusColor = 'text-dtb-red';
                            } else if (rawStatus === 'PENDING') {
                                displayStatus = 'PENDING';
                                statusColor = 'text-dtb-yellow';
                            }

                            const isIncoming = verifiedRole === 'MERCHANT' && txn.transaction_type?.toUpperCase() === 'PAYMENT';

                            return (
                                <View key={txn.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center mb-3">
                                    <View>
                                        <Text className="text-dtb-navy font-bold text-base">{counterpart}</Text>
                                        <Text className="text-gray-400 text-xs mt-1">
                                            {txn.created_at ? new Date(txn.created_at).toLocaleDateString() : 'Recent'}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className={`font-extrabold ${isIncoming ? 'text-green-600' : 'text-dtb-navy'}`}>
                                            {isIncoming ? '+' : '-'} KES {txn.amount}
                                        </Text>
                                        <Text className={`text-[10px] font-bold mt-1 ${statusColor}`}>
                                            {displayStatus}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <Text className="text-gray-400 text-center py-4">No recent activity.</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Dashboard;