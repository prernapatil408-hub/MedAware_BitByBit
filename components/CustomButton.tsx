import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOW } from '../utils/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  fullWidth?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: Props) {
  const getColors = (): [string, string] => {
    switch (variant) {
      case 'secondary':
        return [COLORS.secondary, '#16A34A'];
      case 'danger':
        return ['#EF4444', '#DC2626'];
      default:
        return [COLORS.primary, '#1D4ED8'];
    }
  };

  const textColor = variant === 'outline' ? COLORS.primary : 'white';

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </>
  );

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.outline,
          fullWidth && styles.fullWidth,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        style,
        disabled && styles.disabled,
        SHADOW.button,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <LinearGradient colors={getColors()} style={styles.gradient}>
        {content}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    marginVertical: 8,
    minHeight: 54,
    overflow: 'hidden',
  },
  fullWidth: { width: '100%' },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outline: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
