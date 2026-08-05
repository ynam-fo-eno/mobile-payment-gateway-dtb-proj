import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Splash = () => {
    const navigation = useNavigation<any>();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Replaces the splash screen in the stack with the Login screen
            navigation.replace('Login');
        }, 2500); 

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-[#d2232a]">
            <View className="items-center justify-center">
                <Text className="text-5xl font-extrabold text-[#f8f9fa] tracking-widest">
                    DTB
                </Text>
                <Text className="text-xl font-medium text-[#f1b719] mt-2">
                    Payment Gateway
                </Text>
                
                {/* Accent lines using the Orange and Navy Blue hex codes */}
                <View className="flex-row mt-6 gap-x-2">
                    <View className="w-12 h-1 bg-[#1d252d] rounded-full" />
                    <View className="w-12 h-1 bg-[#f05d22] rounded-full" />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Splash;