import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  iconName?: string;
}

export default function CustomInput({
  label,
  error,
  iconName,
  ...props
}: CustomInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {iconName && (
          <Ionicons
            name={iconName as any}
            size={20}
            color="white"
            style={styles.icon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.6)"
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: 'black',
    marginBottom: 6,
    fontSize: 14,
    fontWeight:"bold",
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: 'black',
    paddingVertical: 10,
  },
  error: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
});
