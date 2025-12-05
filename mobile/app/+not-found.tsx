import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <Text variant="headlineMedium" style={styles.title}>
        This screen doesn't exist.
      </Text>
      <Link href="/(tabs)/" asChild>
        <Button mode="contained">Go to home screen</Button>
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

