import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, BanknoteArrowUp, Search, Check } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';
import { parseApiError } from '../../utils/errorHandler'; // Added helper

const PayScreen = () => {
    const navigation = useNavigation<any>();
    const { userToken } = useAuth();

    const [merchantList, setMerchantList] = useState<any[]>([]);
    const [merchantSearchQuery, setMerchantSearchQuery] = useState('');
    const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [isLoadingMerchants, setIsLoadingMerchants] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/mobile/merchants/`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    setMerchantList(data);
                } else {
                    const data = await response.json();
                    setFetchError(parseApiError(data, "Failed to load merchants."));
                }
            } catch (error) {
                setFetchError("Network error. Could not connect to server.");
            } finally {
                setIsLoadingMerchants(false);
            }
        };

        fetchMerchants();
    }, [userToken]);

    const filteredMerchants = merchantList.filter(m => {
        const formattedId = `MER 0-${m.id}`;
        const merchantName = m.name || m.username || '';
        return merchantName.toLowerCase().includes(merchantSearchQuery.toLowerCase()) || 
               formattedId.toLowerCase().includes(merchantSearchQuery.toLowerCase());
    });

    const isValidAmount = amount.trim() !== '' && !isNaN(Number(amount)) && Number(amount) > 0;

    const handleProceed = () => {
        if (!selectedMerchant) {
            Alert.alert("Missing Details", "Please select a merchant to pay.");
            return;
        }

        if (!isValidAmount) {
            Alert.alert("Invalid Amount", "Please enter a valid number greater than 0.");
            return;
        }

        navigation.navigate('Confirmation', {
            actionType: 'PAY',
            method: 'DTB Wallet', 
            target: selectedMerchant.email,
            targetName: selectedMerchant.name || selectedMerchant.username,
            amount: Number(amount)
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 px-6 pt-6">
                
                <View className="flex-row justify-between items-center mb-8">
                    <View className="flex-row items-center">
                        <View className="bg-red-50 p-3 rounded-full mr-3">
                            <BanknoteArrowUp color="#962323" size={24} />
                        </View>
                        <Text className="text-2xl font-bold text-dtb-navy">Pay Merchant</Text>
                    </View>
                    <Pressable onPress={() => navigation.goBack()} className="p-2 bg-gray-200 rounded-full">
                        <X color="#4B5563" size={20} />
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    
                    <View className="mb-8 z-10">
                        <Text className="text-dtb-navy font-semibold mb-3">Select Merchant</Text>
                        
                        {!selectedMerchant ? (
                            <View>
                                <View className="flex-row items-center bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-4 mb-2">
                                    <Search color="#9CA3AF" size={20} />
                                    <TextInput
                                        className="flex-1 ml-3 text-dtb-navy text-base"
                                        placeholder="Search by Name or MER 0- ID"
                                        placeholderTextColor="#9CA3AF"
                                        value={merchantSearchQuery}
                                        onChangeText={setMerchantSearchQuery}
                                    />
                                </View>
                                
                                {isLoadingMerchants ? (
                                    <ActivityIndicator size="small" color="#962323" className="mt-4" />
                                ) : fetchError ? (
                                    <Text className="text-red-500 text-center font-medium mt-2">{fetchError}</Text>
                                ) : (
                                    merchantSearchQuery.length > 0 && (
                                        <View className="bg-white border border-gray-200 rounded-xl overflow-hidden max-h-60 shadow-sm mt-1">
                                            <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                                {filteredMerchants.length > 0 ? (
                                                    filteredMerchants.map((merchant, index) => (
                                                        <Pressable 
                                                            key={merchant.id}
                                                            onPress={() => setSelectedMerchant(merchant)}
                                                            className="p-4 flex-row justify-between items-center"
                                                            style={index !== filteredMerchants.length - 1 ? { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' } : {}}
                                                        >
                                                            <View>
                                                                <Text className="text-dtb-navy font-bold text-base">{merchant.name || merchant.username}</Text>
                                                                <Text className="text-dtb-red font-medium text-xs mt-1">
                                                                    MER 0-{merchant.id}
                                                                </Text>
                                                            </View>
                                                        </Pressable>
                                                    ))
                                                ) : (
                                                    <Text className="p-4 text-center text-gray-500">No merchants found.</Text>
                                                )}
                                            </ScrollView>
                                        </View>
                                    )
                                )}
                            </View>
                        ) : (
                            <View style={{
                                backgroundColor: '#f0fdf4',
                                borderColor: '#bbf7d0',
                                borderWidth: 1,
                                borderRadius: 12,
                                padding: 20,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <View>
                                    <Text style={{ color: '#166534', fontWeight: 'bold', fontSize: 18 }}>
                                        {selectedMerchant.name || selectedMerchant.username}
                                    </Text>
                                    <Text style={{ color: '#16a34a', fontWeight: '500', fontSize: 14, marginTop: 4 }}>
                                        MER 0-{selectedMerchant.id}
                                    </Text>
                                </View>
                                <Pressable 
                                    onPress={() => { setSelectedMerchant(null); setMerchantSearchQuery(''); }} 
                                    style={{
                                        padding: 8,
                                        backgroundColor: '#ffffff',
                                        borderRadius: 999,
                                        borderWidth: 1,
                                        borderColor: '#bbf7d0'
                                    }}
                                >
                                    <X color="#166534" size={16} />
                                </Pressable>
                            </View>
                        )}
                    </View>

                    <View className="mb-8">
                        <Text className="text-dtb-navy font-semibold mb-2">Amount (KES)</Text>
                        <View className={`flex-row items-center bg-white border rounded-xl px-5 py-1 shadow-sm ${amount.length > 0 ? (isValidAmount ? 'border-green-500' : 'border-red-400') : 'border-gray-200'}`}>
                            <TextInput
                                className="flex-1 text-dtb-navy text-2xl font-bold py-3"
                                placeholder="0.00"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                            />
                            {isValidAmount && <Check color="#16a34a" size={24} />}
                        </View>
                    </View>

                </ScrollView>

                <View className="pb-8 pt-4">
                    <Pressable 
                        onPress={handleProceed} 
                        className="w-full py-5 rounded-xl items-center shadow-md bg-dtb-red"
                    >
                        <Text className="text-white font-bold text-lg">Proceed</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PayScreen;