import { Redirect } from 'expo-router';
import { useWeb3 } from '@/hooks/useWeb3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

const USER_ID_STORAGE_KEY = '@user_id';

export default function Index() {
  const { isConnected } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [hasUserId, setHasUserId] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
      setHasUserId(!!userId);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isConnected && hasUserId) {
    return <Redirect href="/(tabs)/profile" />;
  }

  if (isConnected) {
    return <Redirect href="/verify" />;
  }

  return <Redirect href="/register" />;
}

