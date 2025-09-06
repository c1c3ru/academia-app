import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Menu, Button } from 'react-native-paper';
import { countries } from '../data/countries';

export default function PhonePicker({ 
  selectedCountry, 
  phoneNumber, 
  onPhoneChange,
  label = "Telefone",
  placeholder = "Digite o número"
}) {
  const [showCountryMenu, setShowCountryMenu] = useState(false);

  const selectedCountryData = countries.find(c => c.code === selectedCountry) || countries[0];

  const handleCountrySelect = (country) => {
    onPhoneChange(country.code, phoneNumber);
    setShowCountryMenu(false);
  };

  const handlePhoneNumberChange = (number) => {
    // Remover caracteres não numéricos exceto espaços e hífens
    const cleanNumber = number.replace(/[^\d\s\-\(\)]/g, '');
    onPhoneChange(selectedCountry, cleanNumber);
  };

  return (
    <View style={styles.container}>
      <View style={styles.phoneContainer}>
        {/* Seletor de código do país */}
        <Menu
          visible={showCountryMenu}
          onDismiss={() => setShowCountryMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowCountryMenu(true)}
              style={styles.countryButton}
              contentStyle={styles.countryButtonContent}
              labelStyle={styles.countryButtonLabel}
            >
              {selectedCountryData.phoneCode}
            </Button>
          }
          contentStyle={styles.menuContent}
        >
          {countries.map((country) => (
            <Menu.Item
              key={country.code}
              onPress={() => handleCountrySelect(country)}
              title={`${country.name} ${country.phoneCode}`}
              titleStyle={styles.menuItemTitle}
            />
          ))}
        </Menu>

        {/* Campo de número */}
        <TextInput
          label={label}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          mode="outlined"
          style={styles.phoneInput}
          placeholder={placeholder}
          keyboardType="phone-pad"
          maxLength={20}
        />
      </View>
    </View>
  );
}

const styles = {
  container: {
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  countryButton: {
    minWidth: 80,
    height: 56,
    justifyContent: 'center',
  },
  countryButtonContent: {
    height: 56,
    justifyContent: 'center',
  },
  countryButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  menuContent: {
    maxHeight: 300,
    backgroundColor: 'white',
  },
  menuItemTitle: {
    fontSize: 14,
  },
};
