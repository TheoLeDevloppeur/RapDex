import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArtistCard, CARD_RATIO } from '@/components/card/artist-card';
import { CardBack } from '@/components/card/card-back';
import { FixedText } from '@/components/fixed-text';
import { PrimaryButton } from '@/components/primary-button';
import { BottomFade, Burst, Flash } from '@/components/reveal/burst';
import { Ticket } from '@/components/reveal/ticket';
import { getArtist } from '@/data/artists';
import { cardVariant } from '@/data/card-variant';
import { useCollection } from '@/hooks/use-collection';
import { colors, fonts, genres, radius, space, touch, type } from '@/theme/theme';

/**
 * Le temps fort : le billet monte, le talon se déchire, le billet devient le dos
 * de la carte, la carte se retourne, puis le tampon « Nouvelle carte » tombe.
 * Environ 2 secondes ; une touche n'importe où passe directement à la fin.
 */
const T = { ticket: 60, tear: 760, card: 1080, flip: 1420, stamp: 2050 } as const;

const toCollection = () => (router.canGoBack() ? router.back() : router.replace('/'));

const vibrate = (fn: () => Promise<void>) => {
  if (Platform.OS !== 'web') fn().catch(() => {});
};

export default function RevealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries } = useCollection();
  const { width, height } = useWindowDimensions();
  // Centre vertical de la carte, mesuré une fois la mise en page faite.
  const [stageCenter, setStageCenter] = useState(height * 0.38);
  /** Mouvement réduit : pas d'animation du tout, même pour la fin. */
  const calm = useRef(false);
  const artist = getArtist(id);
  const entry = entries.find((e) => e.id === id);

  const [done, setDone] = useState(false);
  const [count, setCount] = useState(Math.max(0, entries.length - 1));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finished = useRef(false);

  // Valeurs animées de la séquence.
  const ticketY = useSharedValue(600);
  const ticketOpacity = useSharedValue(0);
  const ticketScale = useSharedValue(1);
  const tear = useSharedValue(0);
  const cardScale = useSharedValue(0.5);
  const cardOpacity = useSharedValue(0);
  const flip = useSharedValue(0);
  const burstOpacity = useSharedValue(0);
  const burstScale = useSharedValue(0.3);
  const burstRotation = useSharedValue(0);
  const flash = useSharedValue(0);
  const stampScale = useSharedValue(2.6);
  const stampOpacity = useSharedValue(0);
  const outro = useSharedValue(0);

  const total = entries.length;

  useEffect(() => {
    if (!artist || !entry) return;
    AccessibilityInfo.announceForAccessibility(`Nouvelle carte : ${artist.name}. ${total} cartes dans ta collection.`);

    let cancelled = false;
    // Réglage lu en direct (quelques millisecondes) avant de lancer la séquence.
    // On ne saute pas l'animation pour les lecteurs d'écran : le test renvoie des
    // faux positifs (toujours vrai sur le web), et l'annonce ci-dessus suffit.
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (cancelled) return;
        if (__DEV__) console.log(`[Révélation] mouvement réduit : ${reduceMotion}`);
        if (reduceMotion) {
          calm.current = true;
          showEnd();
        } else {
          play();
        }
      });

    return () => {
      cancelled = true;
      clearTimers();
    };
    // La séquence ne se joue qu'une fois, à l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function play() {
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    const ease = Easing.bezier(0.3, 1.25, 0.4, 1);

    at(T.ticket, () => {
      ticketOpacity.value = withTiming(1, { duration: 250 });
      ticketY.value = withSpring(0, { damping: 13, stiffness: 140 });
    });
    at(T.tear, () => {
      tear.value = withTiming(1, { duration: 650, easing: Easing.in(Easing.quad) });
      vibrate(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    });
    at(T.card, () => {
      ticketOpacity.value = withTiming(0, { duration: 250 });
      ticketScale.value = withTiming(0.7, { duration: 300 });
      cardOpacity.value = withTiming(1, { duration: 220 });
      cardScale.value = withSpring(1, { damping: 12, stiffness: 180 });
    });
    at(T.flip, () => {
      flip.value = withTiming(180, { duration: 800, easing: ease });
      burstOpacity.value = withTiming(0.55, { duration: 450 });
      burstScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
      burstRotation.value = withRepeat(withTiming(360, { duration: 36000, easing: Easing.linear }), -1);
      flash.value = withDelay(
        250,
        withSequence(withTiming(0.85, { duration: 60 }), withTiming(0, { duration: 500 }))
      );
    });
    at(T.flip + 350, () => vibrate(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)));
    at(T.stamp, () => {
      stampOpacity.value = withTiming(1, { duration: 120 });
      // Coup de tampon : arrive vite, dépasse un peu, se pose.
      stampScale.value = withTiming(1, { duration: 300, easing: Easing.bezier(0.3, 1.5, 0.5, 1) });
      vibrate(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
      // Filet de sécurité : le flash est éteint quoi qu'il arrive, la carte finit nette.
      flash.value = withTiming(0, { duration: 150 });
      outro.value = withDelay(100, withTiming(1, { duration: 350 }));
      finish();
    });
  }

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function finish() {
    if (finished.current) return;
    finished.current = true;
    setDone(true);
    timers.current.push(setTimeout(() => setCount(total), calm.current ? 0 : 260));
  }

  /** Affiche directement l'état final (toucher pour passer, ou mouvement réduit). */
  function showEnd() {
    clearTimers();
    ticketOpacity.value = 0;
    cardOpacity.value = 1;
    cardScale.value = 1;
    flip.value = 180;
    burstOpacity.value = 0.55;
    burstScale.value = 1;
    if (!calm.current) burstRotation.value = withRepeat(withTiming(360, { duration: 36000, easing: Easing.linear }), -1);
    flash.value = 0;
    stampOpacity.value = 1;
    stampScale.value = 1;
    outro.value = calm.current ? 1 : withTiming(1, { duration: 200 });
    finish();
  }

  const skip = () => {
    if (finished.current) return;
    vibrate(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    showEnd();
  };

  const ticketStyle = useAnimatedStyle(() => ({
    opacity: ticketOpacity.value,
    transform: [{ translateY: ticketY.value }, { scale: ticketScale.value }, { rotate: '-5deg' }],
  }));
  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tear.value * 18 }, { rotate: `${tear.value * 2}deg` }],
  }));
  const stubStyle = useAnimatedStyle(() => ({
    opacity: 1 - tear.value,
    transform: [{ translateX: tear.value * 50 }, { translateY: tear.value * 320 }, { rotate: `${tear.value * 42}deg` }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));
  // Deux faces : le dos est visible avant 90°, la face après.
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 90 ? 1 : 0,
    transform: [{ perspective: 1100 }, { rotateY: `${flip.value}deg` }],
  }));
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value >= 90 ? 1 : 0,
    transform: [{ perspective: 1100 }, { rotateY: `${flip.value - 180}deg` }],
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }, { rotate: `${burstRotation.value}deg` }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const stampStyle = useAnimatedStyle(() => ({
    opacity: stampOpacity.value,
    transform: [{ rotate: '10deg' }, { scale: stampScale.value }],
  }));
  const outroStyle = useAnimatedStyle(() => ({
    opacity: outro.value,
    transform: [{ translateY: (1 - outro.value) * 12 }],
  }));

  if (!artist || !entry) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.missing}>
          <Text style={type.heading}>Carte introuvable</Text>
          <PrimaryButton label="Voir ma collection" onPress={toCollection} />
        </View>
      </SafeAreaView>
    );
  }

  const { ink: inkIndex } = cardVariant(artist);
  const cardInks = genres[artist.genre].inks[inkIndex];
  const band = cardInks.stock;
  const cardWidth = Math.min(width * 0.6, 240);
  // Assez grand pour couvrir tout l'écran depuis le centre de la carte, même en tournant.
  const burstSize = Math.hypot(width, height) * 2;
  const fadeHeight = height * 0.5;

  return (
    <View style={styles.screen} accessibilityViewIsModal>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.burst,
          { width: burstSize, height: burstSize, left: width / 2 - burstSize / 2, top: stageCenter - burstSize / 2 },
          burstStyle,
        ]}>
        <Burst size={burstSize} color={band} />
      </Animated.View>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.bottomFade, { height: fadeHeight }]}>
        <BottomFade width={width} height={fadeHeight} />
      </View>

      <SafeAreaView style={styles.content}>
      <Pressable
        style={styles.stage}
        onPress={skip}
        accessible={false}
        onLayout={(e) => setStageCenter(e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2)}>
        <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.center, ticketStyle]}>
          <Ticket artist={artist} date={entry.addedAt} band={band} mainStyle={mainStyle} stubStyle={stubStyle} />
        </Animated.View>

        <Animated.View style={[styles.center, cardStyle]}>
          <View style={{ width: cardWidth, height: cardWidth * CARD_RATIO }}>
            <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, styles.face, backStyle]}>
              <CardBack width={cardWidth} background={cardInks.ink} mark={cardInks.stock} />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.face, frontStyle]}>
              <ArtistCard artist={artist} width={cardWidth} size="full" addedAt={entry.addedAt} />
            </Animated.View>
            <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.stamp, stampStyle]}>
              <FixedText style={styles.stampText}>Nouvelle carte</FixedText>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.center, flashStyle]}>
          <Flash size={cardWidth * 2.2} />
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.copy, outroStyle]}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.3}>
          Nouvelle carte{' '}!
        </Text>
        <Text style={[type.body, { color: colors.brume }]}>
          <Text style={styles.strong}>{artist.name}</Text> rejoint ta collection
        </Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            <Text style={{ color: colors.surligneur }}>{count}</Text> {count > 1 ? 'cartes' : 'carte'}
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.actions, outroStyle]} pointerEvents={done ? 'auto' : 'none'}>
        <PrimaryButton label="Voir ma collection" onPress={toCollection} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: '/card/[id]', params: { id: artist.id } })}
          style={({ pressed }) => [styles.ghost, pressed && { backgroundColor: colors.coulisse }]}>
          <Text style={styles.ghostText}>Voir la carte</Text>
        </Pressable>
      </Animated.View>

      {!done && (
        <Text style={styles.skip} accessibilityElementsHidden importantForAccessibility="no">
          Touche pour passer
        </Text>
      )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fond opaque : rien de l'écran précédent ne transparaît.
  screen: { flex: 1, backgroundColor: colors.nuit, overflow: 'hidden' },
  content: { flex: 1 },
  burst: { position: 'absolute' },
  bottomFade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  stage: { flex: 1, overflow: 'visible' },
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  face: { backfaceVisibility: 'hidden' },
  stamp: {
    position: 'absolute',
    top: -34,
    right: -26,
    backgroundColor: colors.surligneur,
    borderRadius: 7,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.encre,
    paddingHorizontal: 11,
    paddingVertical: 7,
    boxShadow: `0 0 0 3px ${colors.surligneur}, 0 8px 20px -6px rgba(0,0,0,0.6)`,
  },
  stampText: { fontFamily: fonts.display, fontSize: 22, color: colors.encre, textTransform: 'uppercase', includeFontPadding: false },
  copy: { alignItems: 'center', gap: 6, paddingHorizontal: space.lg },
  title: { ...type.title, fontSize: 36, lineHeight: 34 },
  strong: { fontFamily: fonts.bodySemiBold, color: colors.papier },
  countPill: { marginTop: space.xs, backgroundColor: colors.coulisse, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.sm },
  countText: { fontFamily: fonts.monoSemiBold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.papier },
  actions: { gap: space.sm + 2, padding: space.lg, paddingTop: space.xl },
  ghost: {
    minHeight: touch.min + 4,
    borderRadius: radius.md + 2,
    borderWidth: 1.5,
    borderColor: colors.trait,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.papier },
  skip: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.brume,
  },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: space.xl },
});
