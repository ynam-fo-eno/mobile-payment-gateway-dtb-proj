import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { ArrowDownToLine, ArrowUpFromLine, ScanLine, X, Clock, Search, Eye, EyeOff } from 'lucide-react-native';
import { API_BASE_URL } from '../../config/api';

const Dashboard = () => {
    const { role, logout, userToken } = useAuth(); 
    const [balance, setBalance] = useState<number | null>(null);
    const [pendingBalance, setPendingBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifiedRole, setVerifiedRole] = useState(role ? role.toUpperCase() : 'CUSTOMER');
    
    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
    
    // Privacy Toggle State
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    const [isModalVisible, setModalVisible] = useState(false);
    const [actionType, setActionType] = useState<'TOP_UP' | 'WITHDRAW' | 'PAY' | null>(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isWaitingForPin, setIsWaitingForPin] = useState(false);

    const [merchantList, setMerchantList] = useState<any[]>([]);
    const [merchantSearchQuery, setMerchantSearchQuery] = useState('');
    const [selectedMerchant, setSelectedMerchant] = useState<any>(null);

    const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'DTBBANK'>('MPESA');
    const [paymentTarget, setPaymentTarget] = useState('');

    const validateTarget = (method: 'MPESA' | 'DTBBANK', target: string) => {
        if (!target) return false;
        if (method === 'DTBBANK') {
            return /^\d{10}$/.test(target);
        } else {
            return /^((\+2547|\+2541)\d{8}|(07|01)\d{8})$/.test(target);
        }
    };
    const isValidTarget = validateTarget(paymentMethod, paymentTarget);

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
                        setRecentTransactions(txData.slice(0, 5));
                    }

                    const merchantsResponse = await fetch(`${API_BASE_URL}/mobile/merchants/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
                    });

                    if (merchantsResponse.ok) {
                        const mData = await merchantsResponse.json();
                        setMerchantList(mData);
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

    const openModal = (type: 'TOP_UP' | 'WITHDRAW' | 'PAY') => {
        setActionType(type);
        setMerchantSearchQuery('');
        setSelectedMerchant(null);
        setAmount('');
        setPaymentMethod('MPESA');
        setPaymentTarget('');
        setIsWaitingForPin(false);
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

            if (actionType === 'TOP_UP' || actionType === 'WITHDRAW') {
                if (!paymentTarget || !isValidTarget) {
                    Alert.alert("Invalid Details", "Please provide a valid account or phone number.");
                    setIsProcessing(false);
                    return;
                }
            }

            if (actionType === 'TOP_UP') {
                setIsWaitingForPin(true);
                await new Promise<void>(resolve => setTimeout(resolve, 2000));
                setIsWaitingForPin(false);

                endpoint = `${API_BASE_URL}/mobile/top_up/`; 
                bodyData = { ...bodyData, method: paymentMethod, source: paymentTarget };

            } else if (actionType === 'WITHDRAW') {
                endpoint = `${API_BASE_URL}/mobile/withdraw/`;
                bodyData = { ...bodyData, method: paymentMethod, destination: paymentTarget };
                
            } else if (actionType === 'PAY') {
                if (!selectedMerchant) {
                    Alert.alert("Missing Details", "Please select a merchant to pay.");
                    setIsProcessing(false);
                    return;
                }
                endpoint = `${API_BASE_URL}/mobile/pay/`;
                bodyData = { amount: Number(amount), merchant_email: selectedMerchant.email };
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
                
                let successMsg = data.message || "Operation completed successfully.";
                if (actionType === 'WITHDRAW') {
                    successMsg = `KES ${amount} successfully credited to ${paymentTarget}`;
                } else if (actionType === 'PAY') {
                    successMsg = `KES ${amount} successfully paid to ${selectedMerchant?.name}`;
                } else if (actionType === 'TOP_UP') {
                    successMsg = `KES ${amount} successfully deducted from ${paymentTarget} and added to your wallet`;
                }

                Alert.alert("Success!", successMsg);
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

    const filteredMerchants = merchantList.filter(m => {
        const formattedId = `MER 0-${m.id}`;
        return m.name.toLowerCase().includes(merchantSearchQuery.toLowerCase()) || 
               formattedId.toLowerCase().includes(merchantSearchQuery.toLowerCase());
    });

    const toggleBalanceVisibility = () => setIsBalanceVisible(!isBalanceVisible);

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-4 pb-8 bg-dtb-red rounded-b-3xl shadow-md">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-2xl font-bold">
                            {verifiedRole === 'CUSTOMER' ? 'My Wallet' : 'Merchant Portal'}
                        </Text>
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
                                    {isBalanceVisible 
                                        ? `KES ${pendingBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}` 
                                        : '****'}
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

                <View className="px-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-dtb-navy text-lg font-bold">Recent Transactions</Text>
                        <Clock color="#9CA3AF" size={18} />
                    </View>

                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((txn) => {
                            let counterpart = 'Unknown Entity';
                            if (verifiedRole === 'CUSTOMER') {
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

                        {(actionType === 'WITHDRAW' || actionType === 'TOP_UP') && (
                            <View className="mb-6">
                                <Text className="text-dtb-navy font-semibold mb-3">
                                    {actionType === 'TOP_UP' ? 'Select Source' : 'Select Destination'}
                                </Text>
                                <View className="flex-row gap-3 mb-4">
                                    <Pressable onPress={() => { setPaymentMethod('MPESA'); setPaymentTarget(''); }} className={`flex-1 py-3 rounded-lg items-center border ${paymentMethod === 'MPESA' ? 'bg-dtb-red border-dtb-red' : 'bg-gray-50 border-gray-200'}`}>
                                        <Text className={`font-bold text-xs ${paymentMethod === 'MPESA' ? 'text-white' : 'text-gray-500'}`}>M-PESA</Text>
                                    </Pressable>

                                    <Pressable onPress={() => { setPaymentMethod('DTBBANK'); setPaymentTarget(''); }} className={`flex-1 py-3 rounded-lg items-center border ${paymentMethod === 'DTBBANK' ? 'bg-dtb-red border-dtb-red' : 'bg-gray-50 border-gray-200'}`}>
                                        <Text className={`font-bold text-xs ${paymentMethod === 'DTBBANK' ? 'text-white' : 'text-gray-500'}`}>DTB Bank</Text>
                                    </Pressable>
                                </View>

                                <Text className="text-dtb-navy font-semibold mb-2">
                                    {paymentMethod === 'MPESA' ? 'Phone Number' : 'Account Number'}
                                </Text>
                                <TextInput
                                    className={`bg-gray-50 border rounded-lg px-4 py-3 mb-1 text-dtb-navy text-base font-medium ${
                                        paymentTarget.length > 0 ? (isValidTarget ? 'border-green-500' : 'border-red-500') : 'border-gray-200'
                                    }`}
                                    placeholder={paymentMethod === 'MPESA' ? '+2547... or 07...' : '10-digit Account No'}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType={paymentMethod === 'MPESA' ? 'phone-pad' : 'numeric'}
                                    value={paymentTarget}
                                    onChangeText={setPaymentTarget}
                                />
                                {paymentTarget.length > 0 && (
                                    <Text className={`text-xs font-bold mb-2 ${isValidTarget ? 'text-green-600' : 'text-red-500'}`}>
                                        {isValidTarget ? 'Valid' : 'Invalid, try again please'}
                                    </Text>
                                )}
                            </View>
                        )}

                        {actionType === 'PAY' && (
                            <View className="mb-6">
                                <Text className="text-dtb-navy font-semibold mb-2">Select Merchant</Text>
                                {!selectedMerchant ? (
                                    <View>
                                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-2">
                                            <Search color="#9CA3AF" size={20} />
                                            <TextInput
                                                className="flex-1 ml-3 text-dtb-navy"
                                                placeholder="Search by Name or MER 0- ID"
                                                placeholderTextColor="#9CA3AF"
                                                value={merchantSearchQuery}
                                                onChangeText={setMerchantSearchQuery}
                                            />
                                        </View>
                                        
                                        {merchantSearchQuery.length > 0 && (
                                            <View className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-40">
                                                <ScrollView nestedScrollEnabled={true}>
                                                    {filteredMerchants.length > 0 ? (
                                                        filteredMerchants.map((merchant, index) => (
                                                            <Pressable 
                                                                key={merchant.id}
                                                                onPress={() => setSelectedMerchant(merchant)}
                                                                className={`p-3 flex-row justify-between items-center ${index !== filteredMerchants.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                            >
                                                                <View>
                                                                    <Text className="text-dtb-navy font-bold">{merchant.name}</Text>
                                                                    <Text className="text-dtb-red font-medium text-xs mt-1">
                                                                        MER 0-{merchant.id}
                                                                    </Text>
                                                                </View>
                                                            </Pressable>
                                                        ))
                                                    ) : (
                                                        <Text className="p-3 text-center text-gray-500">No merchants found.</Text>
                                                    )}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View className="bg-green-50 border border-green-200 rounded-lg p-4 flex-row justify-between items-center">
                                        <View>
                                            <Text className="text-green-800 font-bold">{selectedMerchant.name}</Text>
                                            <Text className="text-green-600 font-medium text-xs mt-1">MER 0-{selectedMerchant.id}</Text>
                                        </View>
                                        <Pressable onPress={() => setSelectedMerchant(null)} className="p-2 bg-white rounded-full border border-green-200">
                                            <X color="#166534" size={16} />
                                        </Pressable>
                                    </View>
                                )}
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

                        <Pressable  onPress={handleTransaction} disabled={isProcessing} className={`w-full py-4 rounded-lg items-center ${isProcessing ? (isWaitingForPin ? 'bg-dtb-yellow/90' : 'bg-dtb-red/70') : 'bg-dtb-red'}`} >
                            {isProcessing ? (
                                <View className="flex-row items-center">
                                    <ActivityIndicator color="#ffffff" className="mr-2" />
                                    <Text className="text-white font-bold text-lg">
                                        {isWaitingForPin ? 'Waiting for PIN...' : 'Processing...'}
                                    </Text>
                                </View>
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