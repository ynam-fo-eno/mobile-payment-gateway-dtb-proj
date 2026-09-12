import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../config/api';

const History = () => {
    const { userToken, role } = useAuth();
    const [verifiedRole, setVerifiedRole] = useState(role ? role.toUpperCase() : 'CUSTOMER');
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    
    const [txType, setTxType] = useState<'ALL' | 'PAYMENT' | 'SETTLEMENT'>('ALL');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED/REJECTED'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useFocusEffect(
        useCallback(() => {
            const fetchHistoryData = async () => {
                try {
                    const userResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
                        headers: { 'Authorization': `Bearer ${userToken}` }
                    });
                    
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        if (userData?.role) setVerifiedRole(userData.role.toUpperCase());
                    }

                    const txResponse = await fetch(`${API_BASE_URL}/transactions/`, {
                        headers: { 'Authorization': `Bearer ${userToken}` }
                    });

                    if (txResponse.ok) {
                        const txData = await txResponse.json();
                        setTransactions(txData);
                    }
                } catch (error) {
                    console.error("Error fetching history data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchHistoryData();
        }, [userToken])
    );

    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            const matchType = txType === 'ALL' || txn.transaction_type?.toUpperCase() === txType;
            
            // Unify status logic for the filter exactly like the display
            const rawStatus = txn.status ? txn.status.toUpperCase() : '';
            let mappedStatus = 'COMPLETED';
            if (rawStatus === '-' || rawStatus === 'FAILED' || rawStatus === 'REJECTED') {
                mappedStatus = 'FAILED/REJECTED';
            } else if (rawStatus === 'PENDING') {
                mappedStatus = 'PENDING';
            }

            const matchStatus = statusFilter === 'ALL' || mappedStatus === statusFilter;
            return matchType && matchStatus;
        });
    }, [transactions, txType, statusFilter]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    const FilterChip = ({ label, current, target, onPress }: any) => (
        <Pressable 
            onPress={() => { onPress(target); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full mr-2 mb-2 ${current === target ? 'bg-dtb-red' : 'bg-gray-200'}`}
        >
            <Text className={`font-bold text-xs ${current === target ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-6 py-4 bg-dtb-red shadow-sm z-10">
                <Text className="text-white text-center text-2xl font-bold">
                    {verifiedRole === 'CUSTOMER' ? 'Transaction History' : 'Merchant Activity Log'}
                </Text>
            </View>

            <View className="px-6 pt-4 pb-2 border-b border-gray-200">
                {verifiedRole === 'MERCHANT' && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FilterChip label="All Types" current={txType} target="ALL" onPress={setTxType} />
                        <FilterChip label="Payments" current={txType} target="PAYMENT" onPress={setTxType} />
                        <FilterChip label="Settlements" current={txType} target="SETTLEMENT" onPress={setTxType} />
                    </ScrollView>
                )}
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <FilterChip label="All Status" current={statusFilter} target="ALL" onPress={setStatusFilter} />
                    <FilterChip label="Successful" current={statusFilter} target="COMPLETED" onPress={setStatusFilter} />
                    <FilterChip label="Pending" current={statusFilter} target="PENDING" onPress={setStatusFilter} />
                    <FilterChip label="Failed/Rejected" current={statusFilter} target="FAILED/REJECTED" onPress={setStatusFilter} />
                </ScrollView>

                <View className="flex-row items-center mt-2 mb-2">
                    <Text className="text-gray-500 text-xs font-medium mr-3">Per page:</Text>
                    {[5, 10, 20].map(num => (
                        <Pressable 
                            key={num}
                            onPress={() => { setItemsPerPage(num); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded-md mr-2 ${itemsPerPage === num ? 'bg-dtb-navy' : 'bg-gray-200'}`}
                        >
                            <Text className={`font-bold text-xs ${itemsPerPage === num ? 'text-white' : 'text-gray-600'}`}>{num}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <ScrollView className="px-6 flex-1" showsVerticalScrollIndicator={false}>
                {loading ? (
                     <ActivityIndicator size="large" color="#E32C22" className="mt-10" />
                ) : paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((txn) => {
                        // 1. Unified Counterpart extraction
                        let counterpart = 'Unknown Entity';
                        if (verifiedRole === 'CUSTOMER') {
                            counterpart = txn.merchant_name || txn.merchant_username || txn.merchant?.name || txn.merchant?.username || (typeof txn.merchant === 'string' ? txn.merchant : 'Unknown Merchant');
                        } else {
                            counterpart = txn.customer_name || txn.customer_username || txn.customer?.name || txn.customer?.username || (typeof txn.customer === 'string' ? txn.customer : 'Unknown Customer');
                        }
                        
                        // 2. Unified Status parsing
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

                        return (
                            <View key={txn.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-row justify-between items-center mb-3 mt-1">
                                <View className="flex-1 pr-3">
                                    <Text className="text-dtb-navy font-bold text-base">{counterpart}</Text>
                                    <Text className="text-gray-400 text-xs mt-1">
                                        {txn.created_at ? new Date(txn.created_at).toLocaleDateString() : 'Recent'}
                                    </Text>
                                    <Text className="text-gray-400 text-[10px] uppercase mt-1">{txn.transaction_type || 'PAYMENT'}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-dtb-navy font-extrabold text-base">KES {txn.amount}</Text>
                                    <Text className={`text-[10px] font-bold mt-1 ${statusColor}`}>
                                        {displayStatus}
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm items-center mt-4">
                        <Text className="text-gray-500 font-medium">No transactions found for this filter.</Text>
                    </View>
                )}

                {!loading && filteredTransactions.length > 0 && (
                    <View className="flex-row justify-between items-center py-6">
                        <Pressable 
                            disabled={currentPage === 1}
                            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200' : 'bg-dtb-red'}`}
                        >
                            <Text className={`font-bold ${currentPage === 1 ? 'text-gray-400' : 'text-white'}`}>Prev</Text>
                        </Pressable>
                        
                        <Text className="text-dtb-navy font-medium text-xs">
                            Page {currentPage} of {totalPages || 1}
                        </Text>

                        <Pressable 
                            disabled={currentPage === totalPages}
                            onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200' : 'bg-dtb-red'}`}
                        >
                            <Text className={`font-bold ${currentPage === totalPages ? 'text-gray-400' : 'text-white'}`}>Next</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default History;