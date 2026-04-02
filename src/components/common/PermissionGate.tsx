import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Linking} from 'react-native';
import {theme} from '../../theme/theme';
import {usePermissions, MicPermissionState} from '../../hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
}

export function PermissionGate({children}: PermissionGateProps) {
  const {micPermission, requestMicPermission} = usePermissions();

  if (micPermission === 'granted') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🎤</Text>
        <Text style={styles.title}>Microphone Access</Text>
        <Text style={styles.description}>
          Tuner needs access to your microphone to detect the pitch of your
          instrument.
        </Text>

        {micPermission === 'blocked' ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.7}>
            <Text style={styles.buttonText}>Open Settings</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={requestMicPermission}
            activeOpacity={0.7}>
            <Text style={styles.buttonText}>Allow Microphone</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.background,
    letterSpacing: 0.5,
  },
});
