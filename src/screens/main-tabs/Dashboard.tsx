import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { Clock, Eye, EyeOff, BanknoteArrowUp, Wallet, ArrowUp } from 'lucide-react-native';
import { API_BASE_URL } from '../../config/api';

// Bulletproof Regex formatter that works on all Android/iOS devices
const formatMoney = (amount: any) => {
    const num = Number(amount);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Date Formatter: converts "2026-09-15" to "15th Sep 2026"
const formatCustomDate = (dateString: string) => {
    if (!dateString) return 'Recent';
    const d = new Date(dateString);
    const day = d.getDate();
    const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : (day % 100 - day % 10 !== 10 ? day % 10 : 0)];
    const month = d.toLocaleString('en-US', { month: 'short' });
    return `${day}${suffix} ${month} ${d.getFullYear()}`;
};

const Dashboard = () => {
    const { role, logout, userToken } = useAuth(); 
    const navigation = useNavigation<any>();
    
    const [balance, setBalance] = useState<number | null>(null);
    const [pendingBalance, setPendingBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    
    // New state for the settlement summary
    const [latestSettlement, setLatestSettlement] = useState<string>('No settlements yet.');
    
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const balanceOpacity = useRef(new Animated.Value(1)).current;

    const verifiedRole = role ? role.toUpperCase() : 'CUSTOMER';

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

                    const txResponse = await fetch(`${API_BASE_URL}/transactions/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
                    });

                    if (txResponse.ok) {
                        const txData = await txResponse.json();
                        setRecentTransactions(txData); 
                    }

                    // Fetch settlements ONLY if the user is a merchant
                    if (verifiedRole === 'MERCHANT') {
                        const settlementResponse = await fetch(`${API_BASE_URL}/payments/settlements/`, {
                            method: 'GET',
                            headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
                        });

                        if (settlementResponse.ok) {
                            const settlementData = await settlementResponse.json();
                            if (settlementData.length > 0) {
                                const recent = settlementData[0]; // Gets the newest one based on your backend ordering
                                setLatestSettlement(`Last settled: KES ${formatMoney(recent.amount)} on ${formatCustomDate(recent.created_at)}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Network error fetching dashboard data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchDashboardData();
        }, [userToken, verifiedRole])
    );

    const toggleBalanceVisibility = () => {
        Animated.timing(balanceOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            setIsBalanceVisible(!isBalanceVisible);
            Animated.timing(balanceOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
        });
    };

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
                                <Text className="text-red-100  font-bold text-2xl   tracking-wider">Available Balance</Text>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" className="items-start mt-2" />
                                ) : (
                                    <Animated.View style={{ opacity: balanceOpacity }}>
                                        <Text className="text-white text-4xl font-extrabold mt-1">
                                            {isBalanceVisible ? `KES ${formatMoney(balance)}` : '****'}
                                        </Text>
                                    </Animated.View>
                                )}
                            </View>
                            <Pressable onPress={toggleBalanceVisibility} className="p-2 mb-1 bg-black/10 rounded-full">
                                {isBalanceVisible ? <EyeOff color="#ffffff" size={20} /> : <Eye color="#ffffff" size={20} />}
                            </Pressable>
                        </View>
                    ) : (
                        <View className="flex-row justify-between items-end">
                            <View>
                                <Text className="text-red-100 text-1x1 font-bold  tracking-wider">Available Balance</Text>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" className="items-start mt-2" />
                                ) : (
                                    <Animated.View style={{ opacity: balanceOpacity }} className="flex-row items-center">
                                        <Text className="text-white text-3xl font-extrabold mt-1">
                                            {isBalanceVisible ? `KES ${formatMoney(balance)}` : '****'}
                                        </Text>
                                    </Animated.View>
                                )}
                            </View>
                            <View className="items-end">
                                <View className="flex-row items-center justify-end">
                                    <Text className="text-red-100 text-1x1 font-bold  tracking-wider mr-2">Pending Balance</Text>
                                    <Pressable onPress={toggleBalanceVisibility} className="p-1 bg-black/10 rounded-full mb-0.5">
                                        {isBalanceVisible ? <EyeOff color="#ffffff" size={16} /> : <Eye color="#ffffff" size={16} />}
                                    </Pressable>
                                </View>
                                <Text className="text-dtb-yellow text-3xl font-extrabold mt-1">
                                    {isBalanceVisible ? `KES ${formatMoney(pendingBalance)}` : '****'}
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
                            {/* Updated to display the fetched settlement data */}
                            <Text className={latestSettlement === 'No settlements yet.' ? "text-gray-400 text-sm text-center" : "text-dtb-navy font-bold text-sm text-center"}>
                                {latestSettlement}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="px-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-dtb-navy text-lg font-bold">Recent Transactions</Text>
                        <Clock color="#9CA3AF" size={18} />
                    </View>

                    {recentTransactions.length > 0 ? (
                        recentTransactions.slice(0, 5).map((txn) => {
                            let counterpart = 'Unknown Entity';
                            
                            const rawType = txn.transaction_type ? txn.transaction_type.toUpperCase() : '';
                            const rawDesc = txn.description ? txn.description.toLowerCase() : '';
                            
                            const isSelfCredit = txn.customer === txn.merchant; 
                            const isExplicitTopUp = rawType.includes('TOP') || rawType.includes('DEPOSIT') || rawDesc.includes('top');
                            
                            if (isExplicitTopUp || isSelfCredit) {
                                counterpart = 'Wallet Top Up';
                            } 
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

                            const isIncoming = verifiedRole === 'MERCHANT' || isExplicitTopUp || isSelfCredit;

                            return (
                                <View key={txn.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center mb-1.5">
                                    <View>
                                        <Text className="text-dtb-navy font-bold text-base">{counterpart}</Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">
                                            {formatCustomDate(txn.created_at)}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="font-extrabold text-dtb-navy">
                                            {isIncoming ? '+' : '-'} KES {formatMoney(txn.amount)}
                                        </Text>
                                        <Text className={`text-[10px] font-bold mt-0.5 ${statusColor}`}>
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