/**
 * Route Detail Screen
 * Shows detailed information about a curated route.
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Colors, DifficultyColors, Typography, Spacing, Radius } from '@/constants/theme';
import { getRouteById } from '@/src/data/routes';
import type { CuratedRoute } from '@/src/models/types';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const route = id ? getRouteById(id) : undefined;

  if (!route) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Route not found</Text>
        </View>
      </View>
    );
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

  function getBestTimeLabel(time: CuratedRoute['bestTimeOfDay']): string {
    switch (time) {
      case 'morning':
        return 'Morning';
      case 'midday':
        return 'Midday';
      case 'evening':
        return 'Evening';
      case 'any':
        return 'Any time';
    }
  }

  function getSurfaceLabel(condition: CuratedRoute['surfaceCondition']): string {
    switch (condition) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'variable':
        return 'Variable';
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.routeName}>{route.name}</Text>
        <Text style={styles.routeRegion}>
          {route.region}, {route.country}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{route.lengthKm}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{route.durationMinutes}</Text>
          <Text style={styles.statLabel}>min</Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: DifficultyColors[route.difficulty] + '20' },
          ]}
        >
          <Text
            style={[styles.statValue, { color: DifficultyColors[route.difficulty] }]}
          >
            {getDifficultyLabel(route.difficulty)}
          </Text>
          <Text style={styles.statLabel}>difficulty</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Route</Text>
        <Text style={styles.description}>{route.description}</Text>
      </View>

      {/* Why Special */}
      <View style={styles.highlightCard}>
        <Text style={styles.highlightTitle}>Why It's Special</Text>
        <Text style={styles.highlightText}>{route.whySpecial}</Text>
      </View>

      {/* Details Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsGrid}>
          <DetailRow label="Best Time" value={getBestTimeLabel(route.bestTimeOfDay)} />
          <DetailRow label="Surface" value={getSurfaceLabel(route.surfaceCondition)} />
        </View>
      </View>

      {/* Surface Notes */}
      {route.surfaceNotes && (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Surface Notes</Text>
          <Text style={styles.notesText}>{route.surfaceNotes}</Text>
        </View>
      )}

      {/* Placeholder for future map */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>Map coming soon</Text>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  label: {
    color: Colors.dark.textMuted,
    fontSize: Typography.body.fontSize,
  },
  value: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.body.fontSize,
  },

  // Header
  header: {
    marginBottom: Spacing.xl,
  },
  routeName: {
    color: Colors.dark.text,
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    marginBottom: Spacing.xs,
  },
  routeRegion: {
    color: Colors.dark.textMuted,
    fontSize: Typography.body.fontSize,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
  },
  statLabel: {
    color: Colors.dark.textMuted,
    fontSize: Typography.label.fontSize,
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    marginBottom: Spacing.md,
  },
  description: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },

  // Highlight Card
  highlightCard: {
    backgroundColor: Colors.dark.accentMuted,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.accent,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.xl,
  },
  highlightTitle: {
    color: Colors.dark.accent,
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  highlightText: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },

  // Details Grid
  detailsGrid: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },

  // Notes
  notesCard: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  notesTitle: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  notesText: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
  },

  // Map Placeholder
  mapPlaceholder: {
    height: 150,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },
});
