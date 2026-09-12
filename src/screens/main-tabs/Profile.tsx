import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth'; 
import { User, Mail, ShieldCheck, LogOut, ChevronRight, UserRoundPen, Pencil } from 'lucide-react-native';
import { API_BASE_URL } from '../../config/api';

const Profile = () => {
    const { logout, userToken, role } = useAuth();
    const [verifiedRole, setVerifiedRole] = useState(role ? role.toUpperCase() : 'CUSTOMER');
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editUsername, setEditUsername] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('••••••••'); 

    useFocusEffect(
        useCallback(() => {
            const fetchProfileData = async () => {
                try {
                    const profileResponse = await fetch(`${API_BASE_URL}/profile/`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const pData = await profileResponse.json();
                    if (profileResponse.ok) {
                        setProfileData(pData);
                    }

                    const roleResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${userToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const rData = await roleResponse.json();
                    if (roleResponse.ok && rData?.role) {
                        setVerifiedRole(rData.role.toUpperCase());
                    }
                } catch (error) {
                    console.error("Network error fetching profile:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchProfileData();
        }, [userToken])
    );

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", onPress: logout, style: "destructive" }
            ]
        );
    };

    const handleEditProfile = () => {
        setEditFirstName(profileData?.first_name || '');
        setEditLastName(profileData?.last_name || '');
        setEditUsername(profileData?.username || '');
        setEditEmail(profileData?.email || '');
        setEditModalVisible(true);    
    };

    const submitProfileEdit = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/profile/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: editFirstName,
                    last_name: editLastName,
                    username: editUsername,
                    email: editEmail,
                    role: verifiedRole,
                })
            });

            const data = await response.json();

            if (response.ok) {
                setProfileData({ ...profileData, ...data });
                Alert.alert("Success", "Profile updated successfully.");
                setEditModalVisible(false);
            } else {
                Alert.alert("Update Failed", JSON.stringify(data));
            }
        } catch (error) {
            Alert.alert("Network Error", "Could not connect to the server.");
        } finally {
            setIsSaving(false);
        }
    };

    const FormInput = ({ label, value, onChangeText, secureTextEntry = false }: any) => (
        <View className="mb-4">
            <Text className="text-dtb-navy font-medium mb-1 ml-1">{label}</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-200">
                <TextInput
                    className="flex-1 text-dtb-navy text-base"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize="none"
                />
                <Pencil color="#4B5563" size={16} />
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-6 pt-4 pb-6 bg-dtb-red rounded-b-3xl shadow-md z-10">
                <Text className="text-center text-white text-2xl font-bold">My Profile</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#E32C22" className="mt-10" />
                ) : (
                    <View className="px-6 mt-6">
                        
                        {/* Premium Avatar Card */}
                        <View className="bg-white rounded-2xl p-6 items-center border border-gray-100 shadow-sm mb-8">
                            <View className="bg-red-50 p-4 rounded-full mb-3">
                                <User color="#E32C22" size={48} />
                            </View>
                            <Text className="text-xl font-bold text-dtb-navy">
                                {profileData?.username || profileData?.first_name || 'DTB User'}
                            </Text>
                            
                            {verifiedRole === 'MERCHANT' && profileData?.id && (
                                <Text className="text-dtb-red font-extrabold text-base mt-1">
                                    MER 0-{profileData.id}
                                </Text>
                            )}

                            <View className="bg-green-50 border border-green-100 px-3 py-1 rounded-full mt-3">
                                <Text className="text-green-700 text-xs font-bold uppercase tracking-wider">
                                    {verifiedRole} ACCOUNT
                                </Text>
                            </View>
                        </View>

                        <Text className="text-dtb-navy text-lg font-bold mb-4 ml-1">Account Details</Text>
                        
                        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
                            <View className="flex-row items-center p-4 border-b border-gray-100">
                                <View className="bg-gray-50 p-2 rounded-full mr-4">
                                    <Mail color="#9CA3AF" size={20} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-xs font-medium uppercase mb-1">Email Address</Text>
                                    <Text className="text-dtb-navy font-semibold text-base">
                                        {profileData?.email || 'Not provided'}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center p-4">
                                <View className="bg-gray-50 p-2 rounded-full mr-4">
                                    <ShieldCheck color="#9CA3AF" size={20} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-500 text-xs font-medium uppercase mb-1">Security</Text>
                                    <Text className="text-dtb-navy font-semibold text-base">Change Password</Text>
                                </View>
                                <ChevronRight color="#9CA3AF" size={20} />
                            </View>
                        </View>

                        {/* Updated Buttons */}
                        <Pressable 
                            onPress={handleEditProfile}
                            className="w-full bg-white py-4 rounded-xl flex-row justify-center items-center border border-gray-200 shadow-sm mb-4">
                            <UserRoundPen color="#1E3A8A" size={20} className="mr-2" />
                            <Text className="text-blue-900 font-bold text-lg">Edit Profile</Text>
                        </Pressable>

                        <Pressable 
                            onPress={handleLogout}
                            className="w-full bg-white py-4 rounded-xl flex-row justify-center items-center border border-red-100 shadow-sm mb-5">
                            <LogOut color="#E32C22" size={20} className="mr-2" />
                            <Text className="text-[#E32C22] font-bold text-lg">Log Out</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isEditModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[85%] shadow-lg">
                        <View className="flex-row items-center mb-6 border-b border-gray-100 pb-4">
                            <View className="bg-blue-100 p-3 rounded-full mr-4">
                                <User color="#E32C22" size={28} />
                            </View>
                            <View>
                                <Text className="text-2xl font-bold text-dtb-navy">Edit Profile</Text>
                                <Text className="text-gray-500 text-sm">Update your account information</Text>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <FormInput label="First Name" value={editFirstName} onChangeText={setEditFirstName} />
                            <FormInput label="Last Name" value={editLastName} onChangeText={setEditLastName} />
                            <FormInput label="Username" value={editUsername} onChangeText={setEditUsername} />
                            <FormInput label="Email" value={editEmail} onChangeText={setEditEmail} />
                            
                            <FormInput label="Password" value={editPassword} onChangeText={setEditPassword} secureTextEntry={true} />
                            
                            <View className="flex-row justify-end mt-4 mb-10 space-x-3">
                                <Pressable 
                                    onPress={() => setEditModalVisible(false)}
                                    className="px-6 py-3 rounded-lg border border-gray-300 bg-white mr-3"
                                >
                                    <Text className="text-gray-700 font-semibold">Cancel</Text>
                                </Pressable>
                                <Pressable 
                                    onPress={submitProfileEdit}
                                    disabled={isSaving}
                                    className={`px-6 py-3 rounded-lg flex-row items-center ${isSaving ? 'bg-red-400' : 'bg-[#E32C22]'}`}
                                >
                                    {isSaving ? <ActivityIndicator size="small" color="#fff" className="mr-2" /> : null}
                                    <Text className="text-white font-bold">Save Changes</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Profile;