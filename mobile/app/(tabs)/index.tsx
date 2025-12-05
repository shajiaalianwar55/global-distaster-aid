import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useWeb3 } from '@/hooks/useWeb3';
import { apiService, UserProfile } from '@/services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { wallet, isConnected } = useWeb3();
  const [recipients, setRecipients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    try {
      setLoading(true);
      const data = await apiService.getVerifiedRecipients();
      setRecipients(data);
    } catch (error) {
      console.error('Error loading recipients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = recipients.filter((recipient) =>
    recipient.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Disaster Relief
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Connect your wallet to start donating
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/register')}
          style={styles.button}
        >
          Get Started
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Verified Recipients
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Help those in need by donating to verified disaster zone residents
        </Text>
      </View>

      <Searchbar
        placeholder="Search recipients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <View style={styles.recipientsList}>
          {filteredRecipients.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="bodyLarge">No verified recipients found</Text>
              </Card.Content>
            </Card>
          ) : (
            filteredRecipients.map((recipient) => (
              <Card
                key={recipient.userId}
                style={styles.card}
                onPress={() => router.push(`/donate/${recipient.userId}`)}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium">
                      {recipient.walletAddress.slice(0, 6)}...
                      {recipient.walletAddress.slice(-4)}
                    </Text>
                    {recipient.verified && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>✓ Verified</Text>
                      </View>
                    )}
                  </View>
                  {recipient.zoneType && (
                    <Text variant="bodySmall" style={styles.zoneType}>
                      {recipient.zoneType === 'disaster' ? '🌍 Disaster Zone' : '⚔️ War Zone'}
                    </Text>
                  )}
                  <Text variant="bodyMedium" style={styles.donations}>
                    Total Donations: ${recipient.totalDonationsReceived.toFixed(2)}
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => router.push(`/donate/${recipient.userId}`)}>
                    Donate
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </View>
      )}
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
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  loader: {
    marginTop: 48,
  },
  recipientsList: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  zoneType: {
    marginTop: 4,
    color: '#666',
  },
  donations: {
    marginTop: 8,
    fontWeight: '600',
  },
});

