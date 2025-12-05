import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useWeb3 } from '@/hooks/useWeb3';
import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_STORAGE_KEY = '@user_id';

export default function RegisterScreen() {
  const router = useRouter();
  const { createWallet, importWallet, wallet, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [importMode, setImportMode] = useState(false);

  React.useEffect(() => {
    if (isConnected && wallet) {
      router.replace('/(tabs)/profile');
    }
  }, [isConnected, wallet]);

  const handleCreateWallet = async () => {
    try {
      setLoading(true);
      const newWallet = await createWallet();

      // Register with backend
      const response = await apiService.register({
        walletAddress: newWallet.address,
        name: name || undefined,
        email: email || undefined,
      });

      await AsyncStorage.setItem(USER_ID_STORAGE_KEY, response.userId);
      Alert.alert('Success', 'Wallet created successfully!');
      router.replace('/verify');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    if (!privateKey.trim()) {
      Alert.alert('Error', 'Please enter a private key');
      return;
    }

    try {
      setLoading(true);
      const importedWallet = await importWallet(privateKey.trim());

      // Register with backend
      const response = await apiService.register({
        walletAddress: importedWallet.address,
        name: name || undefined,
        email: email || undefined,
      });

      await AsyncStorage.setItem(USER_ID_STORAGE_KEY, response.userId);
      Alert.alert('Success', 'Wallet imported successfully!');
      router.replace('/verify');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to import wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome to Disaster Relief
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Create an account to receive donations or import an existing wallet
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Name (Optional)"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email (Optional)"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            {!importMode ? (
              <>
                <Button
                  mode="contained"
                  onPress={handleCreateWallet}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Create New Wallet
                </Button>
                <Button
                  mode="text"
                  onPress={() => setImportMode(true)}
                  style={styles.button}
                >
                  Import Existing Wallet
                </Button>
              </>
            ) : (
              <>
                <TextInput
                  label="Private Key"
                  value={privateKey}
                  onChangeText={setPrivateKey}
                  mode="outlined"
                  secureTextEntry
                  multiline
                  style={styles.input}
                  placeholder="Enter your private key"
                />
                <Button
                  mode="contained"
                  onPress={handleImportWallet}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Import Wallet
                </Button>
                <Button
                  mode="text"
                  onPress={() => {
                    setImportMode(false);
                    setPrivateKey('');
                  }}
                  style={styles.button}
                >
                  Create New Instead
                </Button>
              </>
            )}
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.warning}>
          ⚠️ Keep your private key safe. Never share it with anyone.
        </Text>
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  warning: {
    textAlign: 'center',
    color: '#d32f2f',
    marginTop: 16,
  },
});

