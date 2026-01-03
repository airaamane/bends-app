/**
 * Curated Routes Screen
 * Browse curated Irish driving roads.
 */

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';

import { Colors, DifficultyColors, Typography, Spacing, Radius } from '@/constants/theme';
import { getAllRoutes } from '@/src/data/routes';
import type { CuratedRoute } from '@/src/models/types';

const routes = getAllRoutes();

export default function RoutesScreen() {
  function handleRoutePress(route: CuratedRoute) {
    router.push(`/route/${route.id}` as any);
  }

  function getDifficultyLabel(difficulty: CuratedRoute['difficulty']): string {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'moderate':
        return 'Moderate';
      case 'challenging':
        return 'Challenging';
    }
  }

  function renderRoute({ item }: { item: CuratedRoute }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.routeCard,
          pressed && styles.routeCardPressed,
        ]}
        onPress={() => handleRoutePress(item)}
      >
        <View style={styles.routeHeader}>
          <View style={styles.routeTitleContainer}>
            <Text style={styles.routeName}>{item.name}</Text>
            <Text style={styles.routeRegion}>{item.region}</Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: DifficultyColors[item.difficulty] + '20' },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: DifficultyColors[item.difficulty] },
              ]}
            >
              {getDifficultyLabel(item.difficulty)}
            </Text>
          </View>
        </View>

        <Text style={styles.routeDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.routeStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.lengthKm} km</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.durationMinutes} min</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {item.surfaceCondition === 'excellent'
                ? 'Great surface'
                : item.surfaceCondition === 'good'
                ? 'Good surface'
                : 'Variable surface'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Irish Driving Roads</Text>
        <Text style={styles.headerSubtitle}>
          {routes.length} curated routes for MX-5 enthusiasts
        </Text>
      </View>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={renderRoute}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Route Card
  routeCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  routeCardPressed: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  routeTitleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  routeName: {
    color: Colors.dark.text,
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    marginBottom: 2,
  },
  routeRegion: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  difficultyText: {
    fontSize: Typography.label.fontSize,
    fontWeight: '600',
  },
  routeDescription: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
    marginBottom: Spacing.md,
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {},
  statValue: {
    color: Colors.dark.textMuted,
    fontSize: Typography.label.fontSize,
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.textMuted,
    marginHorizontal: Spacing.sm,
  },
});
