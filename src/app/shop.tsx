import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { decorItems, type Decor } from '@/data/catalog';
import { useStore } from '@/store/AppStore';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function ShopScreen() {
  const { state, coins, dispatch, feedback } = useStore();
  const { colors } = useTheme();

  const buy = (item: Decor) => {
    if (item.premium && !state.profile.isPremium) {
      router.push('/premium');
      return;
    }
    if (coins < item.price) {
      feedback.warning();
      Alert.alert('Not enough coins', `You need ${item.price - coins} more coins. Complete habits and earn badges to collect more!`);
      return;
    }
    feedback.success();
    dispatch({ type: 'buyDecor', decorId: item.id, price: item.price });
  };

  return (
    <Screen>
      <ScreenHeader
        title="Garden shop"
        right={
          <View style={[styles.wallet, { backgroundColor: colors.coinSoft }]}>
            <AppText variant="label" color={colors.coin}>
              🪙 {coins}
            </AppText>
          </View>
        }
      />
      <AppText variant="body" tone="muted" align="center" style={styles.lead}>
        Earn 2 coins per habit, 5 for a perfect day, plus badge and challenge rewards.
      </AppText>
      <View style={styles.grid}>
        {decorItems.map((item) => {
          const isOwned = state.ownedDecor.includes(item.id);
          const isPlaced = state.placedDecor.includes(item.id);
          return (
            <Card key={item.id} style={styles.card}>
              {item.premium ? (
                <View style={[styles.premiumTag, { backgroundColor: colors.coinSoft }]}>
                  <AppText variant="micro" color={colors.coin}>
                    👑
                  </AppText>
                </View>
              ) : null}
              <View style={[styles.art, { backgroundColor: colors.surfaceAlt }]}>
                <AppText style={styles.emoji}>{item.emoji}</AppText>
              </View>
              <AppText variant="bodyBold" align="center" numberOfLines={1}>
                {item.name}
              </AppText>
              {isOwned ? (
                <Button
                  label={isPlaced ? 'In garden ✓' : 'Place'}
                  size="sm"
                  variant={isPlaced ? 'secondary' : 'primary'}
                  onPress={() => dispatch({ type: 'toggleDecor', decorId: item.id })}
                />
              ) : (
                <Button label={`🪙 ${item.price}`} size="sm" variant="secondary" onPress={() => buy(item)} isDisabled={!item.premium && coins < item.price} />
              )}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wallet: { paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radii.pill },
  lead: { marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  card: { width: '48%', gap: spacing.xs, alignItems: 'stretch' },
  premiumTag: { position: 'absolute', top: 8, right: 8, zIndex: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.sm },
  art: { height: 90, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 48, lineHeight: 58 },
});
