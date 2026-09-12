import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { Search, Check, X } from 'lucide-react-native';
import { API_BASE_URL } from '../../config/api';

const Payments = () => {
    const { userToken, role } = useAuth(); 
    const [verifiedRole, setVerifiedRole] = useState(role ? role.toUpperCase() : 'CUSTOMER');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- MERCHANT STATES (Creating Requests) ---
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [customerList, setCustomerList] = useState<any[]>([]);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // --- CUSTOMER STATES (Approving Requests) ---
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            const fetchPaymentData = async () => {
                try {
                    // 1. Verify Role
                    const userResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
                    });
                    
                    let currentRole = verifiedRole;
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        if (userData?.role) {
                            currentRole = userData.role.toUpperCase();
                            setVerifiedRole(currentRole);
                        }
                    }

                    // 2. Fetch specific data based on role
                    if (currentRole === 'CUSTOMER') {
                        const reqResponse = await fetch(`${API_BASE_URL}/payments/pending/`, {
                            headers: { 'Authorization': `Bearer ${userToken}` }
                        });
                        if (reqResponse.ok) setPendingRequests(await reqResponse.json());
                    } else {
                        const custResponse = await fetch(`${API_BASE_URL}/payments/customers/`, {
                            headers: { 'Authorization': `Bearer ${userToken}` }
                        });
                        if (custResponse.ok) setCustomerList(await custResponse.json());
                    }
                } catch (error) {
                    console.error("Error fetching payment data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPaymentData();
        }, [userToken])
    );

    // --- MERCHANT ACTION ---
    const handleSendRequest = async () => {
        if (!selectedCustomer || !amount || !description) {
            Alert.alert("Error", "Please select a customer, enter an amount, and add a description.");
            return;
        }
        setIsProcessing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/payments/request/`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${userToken}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    customer: selectedCustomer.id, 
                    amount: Number(amount), 
                    description 
                })
            });
            
            if (response.ok) {
                Alert.alert("Success", "Payment request sent successfully!");
                setSelectedCustomer(null);
                setAmount('');
                setDescription('');
                setCustomerSearchQuery('');
            } else {
                const data = await response.json();
                Alert.alert("Failed", data.error || "Could not send request.");
            }
        } catch (error) {
            Alert.alert("Error", "Network connection failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- CUSTOMER ACTIONS ---
    const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
        Alert.alert(
            `Confirm ${action}`,
            `Are you sure you want to ${action} this request?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Yes", 
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            const endpoint = `${API_BASE_URL}/payments/${action}/${requestId}/`;
                            const response = await fetch(endpoint, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${userToken}` }
                            });
                            
                            if (response.ok) {
                                Alert.alert("Success", `Request ${action}d successfully.`);
                                setPendingRequests(prev => prev.filter(req => req.id !== requestId));
                            } else {
                                const data = await response.json();
                                Alert.alert("Failed", data.error || `Could not ${action} request.`);
                            }
                        } catch (error) {
                            Alert.alert("Error", "Network connection failed.");
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    // --- THE BULLETPROOF SEARCH FIX ---
    const filteredCustomers = customerList.filter(c => {
        const query = customerSearchQuery.toLowerCase().trim(); // Ignores accidental spaces
        const customerName = (c.name || c.username || '').toLowerCase();
        const customerEmail = (c.email || '').toLowerCase();
        
        return customerName.includes(query) || customerEmail.includes(query);
    });

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-6 py-4 bg-dtb-red shadow-sm z-10">
                <Text className="text-white text-center text-2xl font-bold">
                    {verifiedRole === 'CUSTOMER' ? 'Pending Approvals' : 'Create Payment Request'}
                </Text>
            </View>

            <ScrollView className="px-6 pt-6 flex-1">
                {loading ? (
                    <ActivityIndicator size="large" color="#E32C22" className="mt-10" />
                ) : verifiedRole === 'CUSTOMER' ? (
                    pendingRequests.length > 0 ? (
                        pendingRequests.map((req) => (
                            <View key={req.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-4">
                                <View className="flex-row justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-dtb-navy font-bold text-lg">
                                            {req.merchant_name || `Merchant ID: ${req.merchant}`}
                                        </Text>
                                        <Text className="text-gray-500 text-sm mt-1">{req.description}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-dtb-orange font-extrabold text-xl">KES {req.amount}</Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-x-4">
                                    <Pressable 
                                        onPress={() => handleRequestAction(req.id, 'approve')}
                                        disabled={isProcessing}
                                        className={`flex-1 bg-green-600 py-3 rounded-lg flex-row justify-center items-center ${isProcessing ? 'opacity-70' : 'opacity-100'}`}
                                    >
                                        <Check color="white" size={18} className="mr-2" />
                                        <Text className="text-white font-bold">Approve</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => handleRequestAction(req.id, 'reject')}
                                        disabled={isProcessing}
                                        className={`flex-1 bg-dtb-red py-3 rounded-lg flex-row justify-center items-center ${isProcessing ? 'opacity-70' : 'opacity-100'}`}
                                    >
                                        <X color="white" size={18} className="mr-2" />
                                        <Text className="text-white font-bold">Reject</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm items-center">
                            <Text className="text-gray-500 font-medium">You have no pending requests.</Text>
                        </View>
                    )
                ) : (
                    <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
                        <Text className="text-dtb-navy font-bold mb-2">Request Payment From</Text>
                        {!selectedCustomer ? (
                            <View className="mb-4">
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <Search color="#9CA3AF" size={20} />
                                    <TextInput
                                        className="flex-1 ml-3 text-dtb-navy"
                                        placeholder="Search customer by name or email..."
                                        placeholderTextColor="#9CA3AF"
                                        value={customerSearchQuery}
                                        onChangeText={setCustomerSearchQuery}
                                    />
                                </View>
                                {customerSearchQuery.length > 0 && (
                                    <View className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-1 max-h-40">
                                        <ScrollView nestedScrollEnabled={true}>
                                            {filteredCustomers.map((cust) => (
                                                <Pressable 
                                                    key={cust.id}
                                                    onPress={() => setSelectedCustomer(cust)}
                                                    className="p-3 border-b border-gray-100"
                                                >
                                                    <Text className="text-dtb-navy font-bold">{cust.name || cust.username}</Text>
                                                    <Text className="text-gray-500 text-xs">{cust.email}</Text>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-row justify-between items-center mb-4">
                                <View>
                                    <Text className="text-blue-900 font-bold">{selectedCustomer.name || selectedCustomer.username}</Text>
                                    <Text className="text-blue-700 text-xs">{selectedCustomer.email}</Text>
                                </View>
                                <Pressable onPress={() => setSelectedCustomer(null)} className="p-2 bg-white rounded-full border border-blue-200">
                                    <X color="#1E3A8A" size={16} />
                                </Pressable>
                            </View>
                        )}

                        <Text className="text-dtb-navy font-bold mb-2">Amount (KES)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-dtb-navy text-lg font-bold"
                            placeholder="Enter Amount"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <Text className="text-dtb-navy font-bold mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 text-dtb-navy"
                            placeholder="Enter payment description"
                            placeholderTextColor="#9CA3AF"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Pressable 
                            onPress={handleSendRequest}
                            disabled={isProcessing}
                            className={`bg-dtb-red w-full py-4 rounded-lg items-center ${isProcessing ? 'opacity-70' : 'opacity-100'}`}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Submit Request</Text>
                            )}
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Payments;