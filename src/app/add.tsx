import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { PrimaryButton } from '@/components/primary-button';
import { ARTISTS } from '@/data/artists';
import { useCollection } from '@/hooks/use-collection';
import { colors, space, type } from '@/theme/theme';

// Écran provisoire de l'étape 6 : la vraie recherche arrive à l'étape 7.
export default function AddScreen() {
  const { has, add } = useCollection();

  const addRandom = () => {
    const free = ARTISTS.filter((a) => !has(a.id));
    if (free.length) add(free[Math.floor(Math.random() * free.length)].id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <BackButton />
      </View>
      <View style={styles.body}>
        <Text style={type.title}>Qui as-tu vu en concert ?</Text>
        <Text style={type.bodySmall}>La recherche d’artistes arrive à l’étape 7. En attendant, ce bouton ajoute un artiste au hasard.</Text>
      </View>
      <View style={styles.cta}>
        <PrimaryButton icon="+" label="Ajouter un artiste au hasard" onPress={addRandom} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nuit },
  topbar: { paddingHorizontal: space.sm, minHeight: 54, justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: space.lg, gap: space.md },
  cta: { padding: space.lg },
});
