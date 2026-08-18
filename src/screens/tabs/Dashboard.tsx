import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { ArrowDownToLine, ArrowUpFromLine, ScanLine, X } from 'lucide-react-native';

const Dashboard = () => {
    const { role, logout, userToken } = useAuth(); 
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isModalVisible, setModalVisible] = useState(false);
    const [actionType, setActionType] = useState<'TOP_UP' | 'WITHDRAW' | 'PAY' | null>(null);
    const [merchantEmail, setMerchantEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const response = await fetch('http://10.0.2.2:8000/api/wallet/data/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setBalance(data.balance);
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

        if (actionType === 'TOP_UP') {
            try {
                const response = await fetch('http://10.0.2.2:8000/api/wallet/topup/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ amount: Number(amount) })
                });
                
                const data = await response.json();

                if (response.ok) {
                    setBalance(data.new_balance); // Instantly update the UI balance!
                    Alert.alert("Success!", `KES ${amount} has been added to your wallet.`);
                    setModalVisible(false);
                } else {
                    Alert.alert("Transaction Failed", data.error || "Could not process top up.");
                }
            } catch (error) {
                Alert.alert("Network Error", "Could not connect to the server.");
            }
        } else if (actionType === 'WITHDRAW') {
            try {
                const response = await fetch('http://10.0.2.2:8000/api/wallet/withdraw/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ amount: Number(amount) })
                });
                
                const data = await response.json();

                if (response.ok) {
                    setBalance(data.new_balance); // Instantly update the UI balance!
                    Alert.alert("Success!", `KES ${amount} has been withdrawn.`);
                    setModalVisible(false);
                } else {
                    // This will catch the "Insufficient funds" error from Django
                    Alert.alert("Transaction Failed", data.error || "Could not process withdrawal.");
                }
            } catch (error) {
                Alert.alert("Network Error", "Could not connect to the server.");
            }
        } else if (actionType === 'PAY') {
            if (!merchantEmail) {
                Alert.alert("Missing Details", "Please enter the merchant's email address.");
                setIsProcessing(false);
                return;
            }

            try {
                const response = await fetch('http://10.0.2.2:8000/api/wallet/pay/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        amount: Number(amount),
                        merchant_email: merchantEmail.trim() // Send the email to Django!
                    })
                });
                
                const data = await response.json();

                if (response.ok) {
                    setBalance(data.new_balance); // Instantly update the customer's balance
                    Alert.alert("Payment Successful!", data.message);
                    setModalVisible(false);
                } else {
                    Alert.alert("Payment Failed", data.error || "Could not process payment.");
                }
            } catch (error) {
                Alert.alert("Network Error", "Could not connect to the server.");
            }
        }

        setIsProcessing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-dtb-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header Card */}
                <View className="px-6 pt-4 pb-8 bg-dtb-red rounded-b-3xl shadow-md">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white text-2xl font-bold">
                            {role === 'CUSTOMER' ? 'My Wallet' : 'Merchant Portal'}
                        </Text>
                        
                        <TouchableOpacity onPress={logout} className="bg-black/20 px-4 py-2 rounded-full">
                            <Text className="text-white text-xs font-bold tracking-wider">LOG OUT</Text>
                        </TouchableOpacity>
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

                {/* Quick Actions / Recent Snapshot */}
                <View className="px-6 mt-8">
                    <Text className="text-dtb-navy text-lg font-bold mb-4">
                        {role === 'CUSTOMER' ? 'Quick Actions' : 'Overview'}
                    </Text>
                    
                    {role === 'CUSTOMER' ? (
                        <View className="flex-row justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <TouchableOpacity onPress={() => openModal('TOP_UP')} className="items-center flex-1">
                                <View className="bg-red-50 p-3 rounded-full mb-2">
                                    <ArrowDownToLine color="#E32C22" size={24} />
                                </View>
                                <Text className="text-dtb-navy font-semibold text-xs">Top Up</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => openModal('WITHDRAW')} className="items-center flex-1">
                                <View className="bg-red-50 p-3 rounded-full mb-2">
                                    <ArrowUpFromLine color="#E32C22" size={24} />
                                </View>
                                <Text className="text-dtb-navy font-semibold text-xs">Withdraw</Text>
                            </TouchableOpacity>

                            {/* Action: Pay */}
                            <TouchableOpacity onPress={() => openModal('PAY')} className="items-center flex-1">
                                <View className="bg-red-50 p-3 rounded-full mb-2">
                                    <ScanLine color="#E32C22" size={24} />
                                </View>
                                <Text className="text-dtb-navy font-semibold text-xs">Pay</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm items-center">
                            <Text className="text-gray-400 text-sm text-center">Settlement summary will go here.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

          {/* Transaction Modal */}
    <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
    >
        {/* 1. The dark transparent overlay */}
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
            
            {/* 2. The white modal card */}
            <View className="bg-white w-full rounded-2xl p-6 shadow-lg">
                
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-bold text-dtb-navy">
                        {actionType === 'TOP_UP' ? 'Top Up Wallet' : actionType === 'WITHDRAW' ? 'Withdraw Funds' : 'Pay Merchant'}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <X color="#9CA3AF" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Only show Merchant Email input if action is PAY */}
                {actionType === 'PAY' && (
                    <View className="mb-4">
                        <Text className="text-dtb-navy font-semibold mb-2">Merchant Email</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-dtb-navy"
                            placeholder="e.g. blindmansees@gmail.com"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={merchantEmail}
                            onChangeText={setMerchantEmail}
                        />
                    </View>
                )}

                {/* Amount Input */}
                <Text className="text-dtb-navy font-semibold mb-2">Amount (KES)</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 text-dtb-navy text-lg font-bold"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />

                {/* Confirm Button */}
                <TouchableOpacity 
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
                </TouchableOpacity>

            </View>
        </View>
    </Modal>
        </SafeAreaView>
    );
};

export default Dashboard;