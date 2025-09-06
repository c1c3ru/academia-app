import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Menu, Button, List } from 'react-native-paper';
import { countries, getStatesByCountry } from '../data/countries';

export default function CountryStatePicker({ 
  selectedCountry, 
  selectedState, 
  onCountryChange, 
  onStateChange,
  countryLabel = "País",
  stateLabel = "Estado/Região"
}) {
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showStateMenu, setShowStateMenu] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);

  useEffect(() => {
    if (selectedCountry) {
      const states = getStatesByCountry(selectedCountry);
      setAvailableStates(states);
      
      // Se o estado selecionado não existe no novo país, limpar
      if (selectedState && !states.find(state => state.code === selectedState)) {
        onStateChange('', '');
      }
    } else {
      setAvailableStates([]);
    }
  }, [selectedCountry]);

  const handleCountrySelect = (country) => {
    onCountryChange(country.code, country.name);
    setShowCountryMenu(false);
  };

  const handleStateSelect = (state) => {
    onStateChange(state.code, state.name);
    setShowStateMenu(false);
  };

  const selectedCountryData = countries.find(c => c.code === selectedCountry);
  const selectedStateData = availableStates.find(s => s.code === selectedState);

  return (
    <View style={styles.container}>
      {/* Seletor de País */}
      <Menu
        visible={showCountryMenu}
        onDismiss={() => setShowCountryMenu(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setShowCountryMenu(true)}
            style={styles.picker}
            contentStyle={styles.pickerContent}
          >
            {selectedCountryData ? selectedCountryData.name : countryLabel}
          </Button>
        }
        contentStyle={styles.menuContent}
      >
        {countries.map((country) => (
          <Menu.Item
            key={country.code}
            onPress={() => handleCountrySelect(country)}
            title={`${country.name} (${country.phoneCode})`}
            titleStyle={styles.menuItemTitle}
          />
        ))}
      </Menu>

      {/* Seletor de Estado */}
      {availableStates.length > 0 && (
        <Menu
          visible={showStateMenu}
          onDismiss={() => setShowStateMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowStateMenu(true)}
              style={[styles.picker, styles.statePicker]}
              contentStyle={styles.pickerContent}
              disabled={!selectedCountry}
            >
              {selectedStateData ? selectedStateData.name : stateLabel}
            </Button>
          }
          contentStyle={styles.menuContent}
        >
          {availableStates.map((state) => (
            <Menu.Item
              key={state.code}
              onPress={() => handleStateSelect(state)}
              title={state.name}
              titleStyle={styles.menuItemTitle}
            />
          ))}
        </Menu>
      )}
    </View>
  );
}

const styles = {
  container: {
    marginBottom: 12,
  },
  picker: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  statePicker: {
    marginTop: 4,
  },
  pickerContent: {
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    height: 48,
  },
  menuContent: {
    maxHeight: 300,
    backgroundColor: 'white',
  },
  menuItemTitle: {
    fontSize: 14,
  },
};
