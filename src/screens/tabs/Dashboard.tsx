import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { ArrowDownToLine, ArrowUpFromLine, ScanLine, X, Clock, Star } from 'lucide-react-native';

// Mock data for the 5 most recent transactions
const RECENT_TRANSACTIONS = [
    { id: '1', date: 'Aug 28, 2026', entity: 'Naivas Supermarket', amount: '4,500.00', type: 'out' },
    { id: '2', date: 'Aug 27, 2026', entity: 'M-PESA Top Up', amount: '5,000.00', type: 'in' },
    { id: '3', date: 'Aug 26, 2026', entity: 'KPLC Tokens', amount: '1,000.00', type: 'out' },
    { id: '4', date: 'Aug 25, 2026', entity: 'ATM Withdrawal', amount: '2,000.00', type: 'out' },
    { id: '5', date: 'Aug 24, 2026', entity: 'Java House', amount: '850.00', type: 'out' },
];

const Dashboard = () => {
    const { role, logout, userToken } = useAuth(); 
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const [isModalVisible, setModalVisible] = useState(false);
    const [actionType, setActionType] = useState<'TOP_UP' | 'WITHDRAW' | 'PAY' | null>(null);
    const [merchantEmail, setMerchantEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                // Pointing to Kerry's unified wallet path for the balance check
                const response = await fetch('http://10.0.2.2:8000/api/wallet/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    const walletObj = Array.isArray(data) ? data[0] : data;
                    setBalance(walletObj?.balance ?? walletObj?.available_balance ?? 0);
                }
            } catch (error) {
                console.error("Network error fetching balance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, [userToken]);

    const openModal = (type: 'TOP_UP' | 'WITHDRAW' | 'PAY') => {
        setActionType(type);
        setMerchantEmail('');
        setAmount('');
        setModalVisible(true);
    };

    const handleTransaction = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid number greater than 0.");
            return;
        }

        setIsProcessing(true);

        try {
            let endpoint = '';
            let bodyData: any = { amount: Number(amount) };

            // Targeting your newly added additive backend routes!
            if (actionType === 'TOP_UP') {
                endpoint = 'http://10.0.2.2:8000/api/mobile/topup/'; 
            } else if (actionType === 'WITHDRAW') {
                endpoint = 'http://10.0.2.2:8000/api/mobile/withdraw/';
            } else if (actionType === 'PAY') {
                if (!merchantEmail) {
                    Alert.alert("Missing Details", "Please enter the merchant's email address.");
                    setIsProcessing(false);
                    return;
                }
                endpoint = 'http://10.0.2.2:8000/api/mobile/pay/';
                bodyData = { amount: Number(amount), merchant_email: merchantEmail.trim() };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });
            
            const data = await response.json();

            if (response.ok) {
                setBalance(data.new_balance ?? data.balance); 
                Alert.alert("Success!", data.message || `Operation completed successfully.`);
                setModalVisible(false);
            } else {
                Alert.alert("Failed", data.error || data.detail || "Could not process transaction.");
            }
        } catch (error) {
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-dtb-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View className="px-6 pt-4 pb-8 bg-dtb-red rounded-b-3xl shadow-md">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-2xl font-bold">
                            {role === 'CUSTOMER' ? 'My Wallet' : 'Merchant Portal'}
                        </Text>
                        
                        <Pressable onPress={logout} className="bg-black/20 px-4 py-2 rounded-full">
                            <Text className="text-white text-xs font-bold tracking-wider">LOG OUT</Text>
                        </Pressable>
                    </View>

                    {role === 'CUSTOMER' ? (
                        <View>
                            <Text className="text-red-100 text-sm font-medium uppercase tracking-wider">Available Balance</Text>
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" className="items-start mt-2" />
                            ) : (
                                <Text className="text-white text-4xl font-extrabold mt-1">
                                    KES {balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <View className="flex-row justify-between">
                            <View>
                                <Text className="text-red-100 text-sm font-medium uppercase tracking-wider">Available</Text>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" className="items-start mt-2" />
                                ) : (
                                    <Text className="text-white text-3xl font-extrabold mt-1">
                                        KES {balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                    </Text>
                                )}
                            </View>
                            <View className="items-end">
                                <Text className="text-red-100 text-sm font-medium uppercase tracking-wider">Pending</Text>
                                <Text className="text-dtb-yellow text-3xl font-extrabold mt-1">KES 0.00</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View className="px-6 mt-8">
                    <Text className="text-dtb-navy text-lg font-bold mb-4">
                        {role === 'CUSTOMER' ? 'Quick Actions' : 'Overview'}
                    </Text>
                    
                    {role === 'CUSTOMER' ? (
                        <View className="flex-row justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8">
                            <Pressable onPress={() => openModal('TOP_UP')} className="items-center flex-1">
                                <View className="bg-red-50 p-3 rounded-full mb-2">
                                    <ArrowDownToLine color="#E32C22" size={24} />
                                </View>
                                <Text className="text-dtb-navy font-semibold text-xs">Top Up</Text>
                            </Pressable>

                            <Pressable onPress={() => openModal('WITHDRAW')} className="items-center flex-1">
                                <View className="bg-red-50 p-3 rounded-full mb-2">
                                    <ArrowUpFromLine color="#E32C22" size={24} />
                                </View>
                                <Text className="text-dtb-navy font-semibold text-xs">Withdraw</Text>
                            </Pressable>

                            <Pressable onPress={() => openModal('PAY')} className="items-center flex-1">
                                <View className="bg-red-50 p-3 rounded-full mb-2">
                                    <ScanLine color="#E32C22" size={24} />
                                </View>
                                <Text className="text-dtb-navy font-semibold text-xs">Pay</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm items-center mb-8">
                            <Text className="text-gray-400 text-sm text-center">Settlement summary will go here.</Text>
                        </View>
                    )}
                </View>

                {/* Recent Transactions List */}
                <View className="px-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-dtb-navy text-lg font-bold">Recent Transactions</Text>
                        <Star color="#90EE90" size={18} />
                        <Clock color="#9CA3AF" size={18} />
                    </View>

                    {RECENT_TRANSACTIONS.map((txn) => (
                        <View key={txn.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center mb-3">
                            <View>
                                <Text className="text-dtb-navy font-bold text-base">{txn.entity}</Text>
                                <Text className="text-gray-400 text-xs mt-1">{txn.date}</Text>
                            </View>
                            <View className="items-end">
                                <Text className={`font-extrabold ${txn.type === 'in' ? 'text-green-600' : 'text-dtb-navy'}`}>
                                    {txn.type === 'in' ? '+' : '-'} KES {txn.amount}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Transaction Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-6">
                    <View className="bg-white w-full rounded-2xl p-6 shadow-lg">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-dtb-navy">
                                {actionType === 'TOP_UP' ? 'Top Up Wallet' : actionType === 'WITHDRAW' ? 'Withdraw Funds' : 'Pay Merchant'}
                            </Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <X color="#9CA3AF" size={24} />
                            </Pressable>
                        </View>

                        {actionType === 'PAY' && (
                            <View className="mb-4">
                                <Text className="text-dtb-navy font-semibold mb-2">Merchant Email</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-dtb-navy"
                                    placeholder="e.g. merchant@dtb.co.ke"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={merchantEmail}
                                    onChangeText={setMerchantEmail}
                                />
                            </View>
                        )}

                        <Text className="text-dtb-navy font-semibold mb-2">Amount (KES)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 text-dtb-navy text-lg font-bold"
                            placeholder="0.00"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <Pressable 
                            onPress={handleTransaction}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-lg items-center ${isProcessing ? 'bg-dtb-red/70' : 'bg-dtb-red'}`}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text className="text-white font-bold text-lg">
                                    {actionType === 'TOP_UP' ? 'Confirm Top Up' : actionType === 'WITHDRAW' ? 'Confirm Withdrawal' : 'Send Payment'}
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Dashboard;