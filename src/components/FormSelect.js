import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Button, Text, Icon } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import CustomMenu from './CustomMenu';

const FormSelect = ({
  label,
  value,
  onSelect,
  options = [],
  error,
  touched,
  placeholder = "Selecione uma opção",
  disabled = false,
  style
}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (selectedValue) => {
    onSelect(selectedValue);
    closeMenu();
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const hasError = touched && error;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <CustomMenu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            disabled={disabled}
            style={[
              styles.button,
              hasError && styles.buttonError,
              disabled && styles.buttonDisabled
            ]}
            contentStyle={styles.buttonContent}
            labelStyle={[
              styles.buttonLabel,
              !value && styles.placeholderText
            ]}
            icon={() => (
              <Ionicons 
                name={visible ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={hasError ? "#F44336" : "#666"} 
              />
            )}
          >
            {getDisplayValue()}
          </Button>
        }
      >
        {options.map((option) => (
          <CustomMenu.Item
            key={option.value}
            onPress={() => handleSelect(option.value)}
            title={option.label}
            titleStyle={value === option.value ? styles.selectedOption : null}
          />
        ))}
      </CustomMenu>

      {hasError && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    justifyContent: 'flex-start',
  },
  buttonError: {
    borderColor: '#F44336',
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  buttonLabel: {
    color: '#333',
    textAlign: 'left',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  selectedOption: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormSelect;
