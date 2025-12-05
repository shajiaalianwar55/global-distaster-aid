import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useWeb3 } from '@/hooks/useWeb3';
import { apiService, UserProfile } from '@/services/api';
import { blockchainService } from '@/services/blockchain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_STORAGE_KEY = '@user_id';

export default function ProfileScreen() {
  const router = useRouter();
  const { wallet, disconnect, isConnected } = useWeb3();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<string>('0');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [wallet]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const storedUserId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
      
      if (!storedUserId || !wallet) {
        setLoading(false);
        return;
      }

      setUserId(storedUserId);
      const userProfile = await apiService.getUserProfile(storedUserId);
      setProfile(userProfile);

      // Load blockchain balance
      if (wallet.address) {
        try {
          const recipientBalance = await blockchainService.getRecipientBalance(wallet.address);
          setBalance(recipientBalance);
        } catch (error) {
          console.error('Error loading balance:', error);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    router.push('/verify');
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnect();
            await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
            router.replace('/register');
          },
        },
      ]
    );
  };

  if (!isConnected || !wallet) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Not Connected
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/register')}
          style={styles.button}
        >
          Connect Wallet
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Profile
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.label}>
            Wallet Address
          </Text>
          <Text variant="bodyMedium" style={styles.value}>
            {wallet.address}
          </Text>

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.label}>
            Verification Status
          </Text>
          {profile?.verified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
              {profile.zoneType && (
                <Text variant="bodySmall" style={styles.zoneType}>
                  {profile.zoneType === 'disaster' ? '🌍 Disaster Zone' : '⚔️ War Zone'}
                </Text>
              )}
            </View>
          ) : (
            <View>
              <Text variant="bodyMedium" style={styles.notVerified}>
                Not Verified
              </Text>
              <Button
                mode="contained"
                onPress={handleVerify}
                style={styles.verifyButton}
              >
                Verify Location
              </Button>
            </View>
          )}

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.label}>
            Donation Balance
          </Text>
          <Text variant="headlineSmall" style={styles.balance}>
            {parseFloat(balance).toFixed(4)} ETH
          </Text>

          {profile?.verified && parseFloat(balance) > 0 && (
            <Button
              mode="outlined"
              onPress={() => {
                // Implement withdrawal
                Alert.alert('Withdrawal', 'Withdrawal feature coming soon');
              }}
              style={styles.withdrawButton}
            >
              Withdraw
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.label}>
            Total Donations Received
          </Text>
          <Text variant="headlineSmall" style={styles.balance}>
            ${profile?.totalDonationsReceived.toFixed(2) || '0.00'}
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleDisconnect}
        style={styles.disconnectButton}
        textColor="#d32f2f"
      >
        Disconnect Wallet
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  label: {
    marginBottom: 8,
    color: '#666',
  },
  value: {
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  divider: {
    marginVertical: 16,
  },
  verifiedBadge: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  verifiedText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  zoneType: {
    marginTop: 4,
    color: '#666',
  },
  notVerified: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  verifyButton: {
    marginTop: 8,
  },
  balance: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 8,
  },
  withdrawButton: {
    marginTop: 16,
  },
  disconnectButton: {
    margin: 16,
    marginTop: 8,
  },
});

