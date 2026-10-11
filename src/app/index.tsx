import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Écran temporaire de l'étape 1 : il sera remplacé par la Collection à l'étape 6.
export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>
          RAP<Text style={styles.accent}>DEX</Text>
        </Text>
        <Text style={styles.subtitle}>Étape 1 : le squelette fonctionne.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15111D',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    color: '#F3EEE6',
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -1,
  },
  accent: {
    color: '#FFD23F',
  },
  subtitle: {
    color: '#B3A9C2',
    fontSize: 16,
    textAlign: 'center',
  },
});
