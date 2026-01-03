/**
 * Home Screen
 * Main entry point with prominent Start Drive button.
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { getSessionCount, getCarProfile } from '@/src/services/database';
import type { CarProfile } from '@/src/models/types';

export default function HomeScreen() {
  const [driveCount, setDriveCount] = useState(0);
  const [profile, setProfile] = useState<CarProfile | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [count, carProfile] = await Promise.all([
        getSessionCount(),
        getCarProfile(),
      ]);
      setDriveCount(count);
      setProfile(carProfile);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async function handleStartDrive() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/drive');
  }

  function handleNavigation(path: string) {
    Haptics.selectionAsync();
    router.push(path as any);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MX5 Pocket</Text>
          <Text style={styles.subtitle}>Your pocket co-driver</Text>
        </View>

        {/* Car Profile Card (if set) */}
        {profile && (
          <Pressable
            style={styles.profileCard}
            onPress={() => handleNavigation('/profile')}
          >
            <Text style={styles.profileGeneration}>{profile.generation}</Text>
            <Text style={styles.profileEngine}>{profile.engine}L</Text>
          </Pressable>
        )}

        {/* Start Drive Button */}
        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
          ]}
          onPress={handleStartDrive}
        >
          <Text style={styles.startButtonText}>Start Drive</Text>
          <Text style={styles.startButtonSubtext}>Tap to begin recording</Text>
        </Pressable>

        {/* Quick Stats */}
        {driveCount > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{driveCount}</Text>
            <Text style={styles.statsLabel}>
              {driveCount === 1 ? 'drive recorded' : 'drives recorded'}
            </Text>
          </View>
        )}

        {/* Navigation Menu */}
        <View style={styles.menuContainer}>
          <MenuItem
            title="Drive History"
            subtitle="View past drives"
            onPress={() => handleNavigation('/history')}
            badge={driveCount > 0 ? String(driveCount) : undefined}
          />
          <MenuItem
            title="Routes"
            subtitle="Curated Irish roads"
            onPress={() => handleNavigation('/routes')}
          />
          <MenuItem
            title="Car Profile"
            subtitle={profile ? `${profile.generation} ${profile.engine}L` : 'Set up your MX-5'}
            onPress={() => handleNavigation('/profile')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  title,
  subtitle,
  onPress,
  badge,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        menuStyles.container,
        pressed && menuStyles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={menuStyles.textContainer}>
        <Text style={menuStyles.title}>{title}</Text>
        <Text style={menuStyles.subtitle}>{subtitle}</Text>
      </View>
      <View style={menuStyles.rightContainer}>
        {badge && (
          <View style={menuStyles.badge}>
            <Text style={menuStyles.badgeText}>{badge}</Text>
          </View>
        )}
        <Text style={menuStyles.arrow}>›</Text>
      </View>
    </Pressable>
  );
}

const menuStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
  },
  pressed: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    color: Colors.dark.text,
    fontSize: Typography.label.fontSize,
    fontWeight: '600',
  },
  arrow: {
    color: Colors.dark.textMuted,
    fontSize: 24,
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

  // Header
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  title: {
    color: Colors.dark.text,
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.dark.textMuted,
    fontSize: Typography.body.fontSize,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  profileGeneration: {
    color: Colors.dark.accent,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
  },
  profileEngine: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.body.fontSize,
  },

  // Start Button
  startButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: Spacing.xl,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  startButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    color: Colors.dark.text,
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  startButtonSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Typography.bodySmall.fontSize,
  },

  // Stats Card
  statsCard: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statsNumber: {
    color: Colors.dark.text,
    fontSize: Typography.hudMedium.fontSize,
    fontWeight: Typography.hudMedium.fontWeight,
  },
  statsLabel: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },

  // Menu
  menuContainer: {
    marginTop: Spacing.sm,
  },
});
