/**
 * Car Profile Screen
 * Configure MX-5 generation and engine for tuned guidance.
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { CarProfile, MX5Generation, EngineSize } from '@/src/models/types';
import { getCarProfile, saveCarProfile } from '@/src/services/database';

const generations: { value: MX5Generation; label: string; years: string }[] = [
  { value: 'NA', label: 'NA', years: '1989-1997' },
  { value: 'NB', label: 'NB', years: '1998-2005' },
  { value: 'NC', label: 'NC', years: '2005-2015' },
  { value: 'ND', label: 'ND', years: '2015-present' },
];

const engines: { value: EngineSize; label: string; available: MX5Generation[] }[] = [
  { value: '1.5', label: '1.5L', available: ['ND'] },
  { value: '1.6', label: '1.6L', available: ['NA', 'NB'] },
  { value: '1.8', label: '1.8L', available: ['NA', 'NB', 'NC'] },
  { value: '2.0', label: '2.0L', available: ['NC', 'ND'] },
];

export default function ProfileScreen() {
  const [selectedGeneration, setSelectedGeneration] = useState<MX5Generation | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<EngineSize | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await getCarProfile();
      if (profile) {
        setSelectedGeneration(profile.generation);
        setSelectedEngine(profile.engine);
        setHasProfile(true);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleGenerationSelect(gen: MX5Generation) {
    Haptics.selectionAsync();
    setSelectedGeneration(gen);
    // Reset engine if not available for new generation
    if (selectedEngine) {
      const engine = engines.find((e) => e.value === selectedEngine);
      if (engine && !engine.available.includes(gen)) {
        setSelectedEngine(null);
      }
    }
  }

  function handleEngineSelect(engine: EngineSize) {
    Haptics.selectionAsync();
    setSelectedEngine(engine);
  }

  async function handleSave() {
    if (!selectedGeneration || !selectedEngine) {
      Alert.alert('Incomplete', 'Please select both generation and engine size.');
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const profile: CarProfile = {
        id: 'default',
        generation: selectedGeneration,
        engine: selectedEngine,
        transmission: 'manual',
        createdAt: Date.now(),
      };
      await saveCarProfile(profile);
      router.back();
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  }

  function getAvailableEngines(): typeof engines {
    if (!selectedGeneration) return [];
    return engines.filter((e) => e.available.includes(selectedGeneration));
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your MX-5</Text>
        <Text style={styles.headerSubtitle}>
          Configure your car to get tuned driving guidance.
        </Text>
      </View>

      {/* Generation Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generation</Text>
        <View style={styles.optionsGrid}>
          {generations.map((gen) => (
            <Pressable
              key={gen.value}
              style={[
                styles.optionCard,
                selectedGeneration === gen.value && styles.optionCardSelected,
              ]}
              onPress={() => handleGenerationSelect(gen.value)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selectedGeneration === gen.value && styles.optionLabelSelected,
                ]}
              >
                {gen.label}
              </Text>
              <Text
                style={[
                  styles.optionSubtext,
                  selectedGeneration === gen.value && styles.optionSubtextSelected,
                ]}
              >
                {gen.years}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Engine Selection */}
      {selectedGeneration && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine</Text>
          <View style={styles.optionsRow}>
            {getAvailableEngines().map((engine) => (
              <Pressable
                key={engine.value}
                style={[
                  styles.engineCard,
                  selectedEngine === engine.value && styles.optionCardSelected,
                ]}
                onPress={() => handleEngineSelect(engine.value)}
              >
                <Text
                  style={[
                    styles.engineLabel,
                    selectedEngine === engine.value && styles.optionLabelSelected,
                  ]}
                >
                  {engine.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Transmission Note */}
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Transmission</Text>
        <Text style={styles.noteText}>
          Manual only for MVP. Automatic support coming soon.
        </Text>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            (!selectedGeneration || !selectedEngine) && styles.saveButtonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSave}
          disabled={!selectedGeneration || !selectedEngine}
        >
          <Text style={styles.saveButtonText}>
            {hasProfile ? 'Update Profile' : 'Save Profile'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.body.fontSize,
  },

  // Header
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    color: Colors.dark.text,
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    color: Colors.dark.textSecondary,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    marginBottom: Spacing.md,
  },

  // Options Grid
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.accentMuted,
  },
  optionLabel: {
    color: Colors.dark.text,
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    marginBottom: Spacing.xs,
  },
  optionLabelSelected: {
    color: Colors.dark.accent,
  },
  optionSubtext: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },
  optionSubtextSelected: {
    color: Colors.dark.textSecondary,
  },

  // Engine Options
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  engineCard: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  engineLabel: {
    color: Colors.dark.text,
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
  },

  // Note
  noteCard: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  noteTitle: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  noteText: {
    color: Colors.dark.textMuted,
    fontSize: Typography.bodySmall.fontSize,
  },

  // Button
  buttonContainer: {
    marginTop: Spacing.md,
  },
  saveButton: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.dark.surface,
    opacity: 0.5,
  },
  saveButtonText: {
    color: Colors.dark.text,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
