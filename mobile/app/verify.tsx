import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useLocation } from '@/hooks/useLocation';
import { useWeb3 } from '@/hooks/useWeb3';
import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_STORAGE_KEY = '@user_id';

export default function VerifyScreen() {
  const router = useRouter();
  const { wallet } = useWeb3();
  const { getCurrentLocation, hasPermission, requestPermission, loading: locationLoading } = useLocation();
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);

  const handleVerify = async () => {
    if (!wallet) {
      Alert.alert('Error', 'Please connect your wallet first');
      router.replace('/register');
      return;
    }

    try {
      setVerifying(true);

      // Request permission if needed
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Location permission is required to verify you are in a disaster or war zone.'
          );
          return;
        }
      }

      // Get current location
      const location = await getCurrentLocation();

      // Get user ID
      const userId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please register again.');
        router.replace('/register');
        return;
      }

      // Verify location with backend
      const response = await apiService.verifyLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        userId: userId,
      });

      if (response.verified) {
        setVerificationStatus('verified');
        Alert.alert(
          'Verification Successful!',
          `You have been verified as being in a ${response.zoneType} zone. You can now receive donations.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/profile'),
            },
          ]
        );
      } else if (response.requiresReview) {
        setVerificationStatus('pending');
        Alert.alert(
          'Verification Pending',
          'Your location is being reviewed by our team. You will be notified once verification is complete.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/profile'),
            },
          ]
        );
      } else {
        setVerificationStatus('failed');
        Alert.alert(
          'Verification Failed',
          response.message || 'We could not verify that you are in a disaster or war zone. Please try again later.'
        );
      }
    } catch (error: any) {
      setVerificationStatus('failed');
      Alert.alert('Error', error.message || 'Failed to verify location');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Location Verification
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Verify that you are in a disaster or war zone to receive donations
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.infoText}>
              🔒 Your exact location will NOT be shared with anyone. We only use it to verify that you are in a recognized disaster or war zone.
            </Text>

            <View style={styles.statusContainer}>
              {verificationStatus === 'verified' && (
                <Text variant="titleLarge" style={styles.verifiedText}>
                  ✓ Verified
                </Text>
              )}
              {verificationStatus === 'pending' && (
                <Text variant="titleLarge" style={styles.pendingText}>
                  ⏳ Pending Review
                </Text>
              )}
              {verificationStatus === 'failed' && (
                <Text variant="titleLarge" style={styles.failedText}>
                  ✗ Verification Failed
                </Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleVerify}
              loading={verifying || locationLoading}
              disabled={verifying || locationLoading}
              style={styles.button}
            >
              {verifying || locationLoading ? 'Verifying...' : 'Verify Location'}
            </Button>

            <Text variant="bodySmall" style={styles.note}>
              Note: Verification may take a few moments. If your location cannot be automatically verified, it will be reviewed by our team.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  infoText: {
    marginBottom: 24,
    color: '#666',
    lineHeight: 24,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verifiedText: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  pendingText: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  failedText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
  },
  note: {
    marginTop: 24,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

