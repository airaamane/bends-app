/**
 * Post-Drive Summary Screen
 * Shows metrics, smoothness score, and key insight after a drive.
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { Colors, ClassificationColors, Typography, Spacing, Radius } from '@/constants/theme';
import type { DriveSession } from '@/src/models/types';
import { getSessionById } from '@/src/services/database';

export default function SummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<DriveSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [id]);

  async function loadSession() {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getSessionById(id);
      setSession(data);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}m ${secs}s`;
  }

  function formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getScoreColor(score: number): string {
    if (score >= 85) return Colors.dark.success;
    if (score >= 70) return '#22C55E80'; // Lighter green
    if (score >= 50) return Colors.dark.warning;
    return Colors.dark.error;
  }

  function getScoreLabel(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Session not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>Go Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with date */}
        <Text style={styles.dateText}>{formatDate(session.startedAt)}</Text>

        {/* Smoothness Score */}
        <View style={styles.scoreContainer}>
          <View
            style={[
              styles.scoreCircle,
              { borderColor: getScoreColor(session.smoothnessScore) },
            ]}
          >
            <Text
              style={[
                styles.scoreValue,
                { color: getScoreColor(session.smoothnessScore) },
              ]}
            >
              {session.smoothnessScore}
            </Text>
          </View>
          <Text style={styles.scoreLabel}>Smoothness</Text>
          <Text
            style={[
              styles.scoreDescription,
              { color: getScoreColor(session.smoothnessScore) },
            ]}
          >
            {getScoreLabel(session.smoothnessScore)}
          </Text>
        </View>

        {/* Key Insight */}
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>KEY INSIGHT</Text>
          <Text style={styles.insightText}>{session.keyInsight}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDuration(session.durationSeconds)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatDistance(session.distanceMeters)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        </View>

        {/* Road Classification Breakdown */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Road Breakdown</Text>
          <View style={styles.classificationGrid}>
            <ClassificationBar
              label="Straight"
              percentage={session.classificationStats.straightPct}
              color={ClassificationColors.Straight}
            />
            <ClassificationBar
              label="Flow"
              percentage={session.classificationStats.flowPct}
              color={ClassificationColors.Flow}
            />
            <ClassificationBar
              label="Tight"
              percentage={session.classificationStats.tightPct}
              color={ClassificationColors.Tight}
            />
            <ClassificationBar
              label="Transition"
              percentage={session.classificationStats.transitionPct}
              color={ClassificationColors.Transition}
            />
          </View>
        </View>

        {/* Done Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ClassificationBar({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) {
  return (
    <View style={barStyles.container}>
      <View style={barStyles.labelRow}>
        <Text style={barStyles.label}>{label}</Text>
        <Text style={barStyles.percentage}>{percentage}%</Text>
      </View>
      <View style={barStyles.track}>
        <View
          style={[
            barStyles.fill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    color: Colors.dark.text,
    fontSize: Typography.bodySmall.fontSize,
  },
  percentage: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Loading/Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.body.fontSize,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  backButtonText: {
    color: Colors.dark.accent,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },

  // Header
  dateText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  // Score
  scoreContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scoreLabel: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  scoreDescription: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
  },

  // Insight
  insightCard: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  insightLabel: {
    color: Colors.dark.textMuted,
    fontSize: Typography.label.fontSize,
    fontWeight: Typography.label.fontWeight,
    letterSpacing: Typography.label.letterSpacing,
    marginBottom: Spacing.sm,
  },
  insightText: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },

  // Sections
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    marginBottom: Spacing.md,
  },
  classificationGrid: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },

  // Button
  buttonContainer: {
    marginTop: Spacing.md,
  },
  doneButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
