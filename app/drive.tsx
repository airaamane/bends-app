/**
 * Drive Screen - The core HUD for active driving sessions.
 * Shows live speed, road classification, gear suggestions.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, ClassificationColors, RevZoneColors, Typography, Spacing, Radius } from '@/constants/theme';
import type { HudState } from '@/src/models/types';
import {
  checkLocationPermission,
  requestLocationPermission,
  isLocationServicesEnabled,
} from '@/src/services/location';
import {
  startSession,
  stopSession,
  isSessionActive,
  getCurrentSampleCount,
} from '@/src/services/session-recorder';
import { saveSession } from '@/src/services/database';

type ScreenState = 'checking' | 'permission_needed' | 'ready' | 'recording' | 'stopping';

export default function DriveScreen() {
  const [screenState, setScreenState] = useState<ScreenState>('checking');
  const [hudState, setHudState] = useState<HudState>({
    speedKmh: 0,
    classification: 'Straight',
    gearBand: '2nd',
    revZone: 'optimal',
    isRecording: false,
  });
  const [sampleCount, setSampleCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Update sample count periodically
  useEffect(() => {
    if (screenState !== 'recording') return;

    const interval = setInterval(() => {
      setSampleCount(getCurrentSampleCount());
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [screenState]);

  async function checkPermissions() {
    setScreenState('checking');

    // Check if location services are enabled
    const servicesEnabled = await isLocationServicesEnabled();
    if (!servicesEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable Location Services in your device settings to use MX5 Pocket.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    // Check permission status
    const status = await checkLocationPermission();
    if (status === 'granted') {
      setScreenState('ready');
    } else {
      setScreenState('permission_needed');
    }
  }

  async function handleRequestPermission() {
    const status = await requestLocationPermission();
    if (status === 'granted') {
      setScreenState('ready');
    } else {
      Alert.alert(
        'Permission Required',
        'Location permission is required to track your driving session. Please enable it in Settings.',
        [{ text: 'OK' }]
      );
    }
  }

  const handleHudUpdate = useCallback((state: HudState) => {
    setHudState(state);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Session error:', error);
    Alert.alert('Error', error.message);
    setScreenState('ready');
  }, []);

  async function handleStartDrive() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setElapsedSeconds(0);
      setSampleCount(0);
      await startSession(handleHudUpdate, handleError);
      setScreenState('recording');
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start driving session. Please try again.');
    }
  }

  async function handleStopDrive() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setScreenState('stopping');

      const session = await stopSession();

      if (session) {
        // Save to database
        await saveSession(session);
        // Navigate to summary
        router.replace(`/summary/${session.id}` as any);
      } else {
        setScreenState('ready');
      }
    } catch (error) {
      console.error('Failed to stop session:', error);
      Alert.alert('Error', 'Failed to save session. Please try again.');
      setScreenState('ready');
    }
  }

  function handleCancel() {
    if (screenState === 'recording') {
      Alert.alert(
        'End Drive?',
        'Are you sure you want to end this driving session?',
        [
          { text: 'Continue Driving', style: 'cancel' },
          { text: 'End Drive', style: 'destructive', onPress: handleStopDrive },
        ]
      );
    } else {
      router.back();
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Permission needed state
  if (screenState === 'permission_needed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Location Access Required</Text>
          <Text style={styles.permissionText}>
            MX5 Pocket needs access to your location to track your driving session
            and provide real-time road classification.
          </Text>
          <Text style={styles.permissionNote}>
            Your data stays on your device. No tracking, no servers.
          </Text>
          <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Loading/checking state
  if (screenState === 'checking' || screenState === 'stopping') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
          <Text style={styles.loadingText}>
            {screenState === 'stopping' ? 'Saving session...' : 'Checking permissions...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Ready to start / Recording
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} hitSlop={20}>
          <Text style={styles.headerButton}>
            {screenState === 'recording' ? 'End' : 'Back'}
          </Text>
        </Pressable>
        {screenState === 'recording' && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording</Text>
          </View>
        )}
      </View>

      {/* Main HUD */}
      <View style={styles.hudContainer}>
        {/* Speed Display */}
        <View style={styles.speedContainer}>
          <Text style={styles.speedValue}>{hudState.speedKmh}</Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>

        {/* Classification */}
        <View
          style={[
            styles.classificationBadge,
            { backgroundColor: ClassificationColors[hudState.classification] + '20' },
          ]}
        >
          <Text
            style={[
              styles.classificationText,
              { color: ClassificationColors[hudState.classification] },
            ]}
          >
            {hudState.classification.toUpperCase()}
          </Text>
        </View>

        {/* Gear & Rev Info */}
        {screenState === 'recording' && (
          <View style={styles.gearRevContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>GEAR</Text>
              <Text style={styles.infoValue}>{hudState.gearBand}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>REVS</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: RevZoneColors[hudState.revZone] },
                ]}
              >
                {hudState.revZone === 'optimal'
                  ? 'GOOD'
                  : hudState.revZone === 'below'
                  ? 'LOW'
                  : 'HIGH'}
              </Text>
            </View>
          </View>
        )}

        {/* Session Stats */}
        {screenState === 'recording' && (
          <View style={styles.statsRow}>
            <Text style={styles.statText}>{formatDuration(elapsedSeconds)}</Text>
            <Text style={styles.statDivider}>•</Text>
            <Text style={styles.statText}>{sampleCount} samples</Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {screenState === 'ready' ? (
          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStartDrive}
          >
            <Text style={styles.startButtonText}>Start Drive</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.stopButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStopDrive}
          >
            <Text style={styles.stopButtonText}>Stop & Save</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.body.fontSize,
  },

  // Permission
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  permissionTitle: {
    color: Colors.dark.text,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  permissionText: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.body.fontSize,
    textAlign: 'center',
    lineHeight: Typography.body.lineHeight,
  },
  permissionNote: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  permissionButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    marginTop: Spacing.lg,
  },
  permissionButtonText: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  cancelButtonText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.body.fontSize,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    color: Colors.dark.accent,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.error,
  },
  recordingText: {
    color: Colors.dark.error,
    fontSize: Typography.bodySmall.fontSize,
    fontWeight: '500',
  },

  // HUD
  hudContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  speedValue: {
    color: Colors.dark.text,
    fontSize: Typography.hudLarge.fontSize,
    fontWeight: Typography.hudLarge.fontWeight,
    lineHeight: Typography.hudLarge.lineHeight,
    fontVariant: ['tabular-nums'],
  },
  speedUnit: {
    color: Colors.dark.textMuted,
    fontSize: Typography.hudLabel.fontSize,
    fontWeight: Typography.hudLabel.fontWeight,
    letterSpacing: Typography.hudLabel.letterSpacing,
    textTransform: 'uppercase',
    marginTop: -Spacing.sm,
  },

  // Classification
  classificationBadge: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    marginBottom: Spacing.xl,
  },
  classificationText: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    letterSpacing: 2,
  },

  // Gear & Rev
  gearRevContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.dark.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    minWidth: 100,
  },
  infoLabel: {
    color: Colors.dark.textMuted,
    fontSize: Typography.label.fontSize,
    fontWeight: Typography.label.fontWeight,
    letterSpacing: Typography.label.letterSpacing,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    color: Colors.dark.text,
    fontSize: Typography.hudMedium.fontSize,
    fontWeight: Typography.hudMedium.fontWeight,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },
  statDivider: {
    color: Colors.dark.textMuted,
  },

  // Actions
  actionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  startButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  startButtonText: {
    color: Colors.dark.text,
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: Colors.dark.error,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  stopButtonText: {
    color: Colors.dark.text,
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
