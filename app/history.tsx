/**
 * Drive History Screen
 * Lists all past driving sessions.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { DriveSession } from '@/src/models/types';
import { getAllSessions } from '@/src/services/database';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<DriveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  async function loadSessions() {
    try {
      const data = await getAllSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadSessions();
  }

  function handleSessionPress(session: DriveSession) {
    router.push(`/summary/${session.id}` as any);
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-IE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-IE', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-IE', {
        day: 'numeric',
        month: 'short',
      });
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins} min`;
  }

  function formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  }

  function getScoreColor(score: number): string {
    if (score >= 85) return Colors.dark.success;
    if (score >= 70) return '#22C55E80';
    if (score >= 50) return Colors.dark.warning;
    return Colors.dark.error;
  }

  function renderSession({ item }: { item: DriveSession }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.sessionCard,
          pressed && styles.sessionCardPressed,
        ]}
        onPress={() => handleSessionPress(item)}
      >
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionDate}>{formatDate(item.startedAt)}</Text>
          <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.smoothnessScore) + '20' }]}>
            <Text style={[styles.scoreText, { color: getScoreColor(item.smoothnessScore) }]}>
              {item.smoothnessScore}
            </Text>
          </View>
        </View>

        <View style={styles.sessionStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatDistance(item.distanceMeters)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatDuration(item.durationSeconds)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.classificationStats.flowPct + item.classificationStats.tightPct}%</Text>
            <Text style={styles.statLabel}>Curves</Text>
          </View>
        </View>

        <Text style={styles.sessionInsight} numberOfLines={2}>
          {item.keyInsight}
        </Text>
      </Pressable>
    );
  }

  if (sessions.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No drives yet</Text>
        <Text style={styles.emptyText}>
          Start your first drive to see your history here.
        </Text>
        <Pressable
          style={styles.emptyButton}
          onPress={() => router.push('/drive')}
        >
          <Text style={styles.emptyButtonText}>Start Drive</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.dark.accent}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.dark.background,
  },
  emptyTitle: {
    color: Colors.dark.text,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.body.fontSize,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
  },
  emptyButtonText: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },

  // Session Card
  sessionCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sessionCardPressed: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sessionDate: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  scoreText: {
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.dark.textMuted,
    fontSize: Typography.label.fontSize,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.dark.border,
  },
  sessionInsight: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.bodySmall.fontSize,
    lineHeight: Typography.bodySmall.lineHeight,
  },
});
