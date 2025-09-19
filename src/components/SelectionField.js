import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

const SelectionField = ({
  label,
  value,
  placeholder,
  icon,
  onPress,
  required = false,
  disabled = false,
  helperText = null,
  style = {}
}) => {
  return (
    <View style={[styles.selectionItem, style]}>
      <Text style={styles.selectionLabel}>
        {label} {required && '*'}
      </Text>
      <TouchableOpacity
        style={[
          styles.selectionButton,
          value && styles.selectionButtonSelected,
          disabled && styles.selectionButtonDisabled
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.selectionButtonContent}>
          <IconButton
            icon={icon}
            size={20}
            iconColor={value ? "#1976D2" : "#666"}
          />
          <Text style={[
            styles.selectionButtonText,
            value && styles.selectionButtonTextSelected,
            disabled && styles.selectionButtonTextDisabled
          ]}>
            {value || placeholder}
          </Text>
          <IconButton icon="chevron-right" size={16} iconColor="#999" />
        </View>
      </TouchableOpacity>
      {helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  selectionItem: {
    marginBottom: 16,
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  selectionButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  selectionButtonSelected: {
    borderColor: '#1976D2',
    backgroundColor: '#F3F8FF',
  },
  selectionButtonDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  selectionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  selectionButtonTextSelected: {
    color: '#1976D2',
    fontWeight: '500',
  },
  selectionButtonTextDisabled: {
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default SelectionField;
