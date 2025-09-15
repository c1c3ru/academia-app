import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, languages, getThemeForUserType } from '../utils/theme';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('pt');
  const [theme, setTheme] = useState(() => getThemeForUserType('student', false));

  // Load saved preferences on app start
  useEffect(() => {
    loadPreferences();
  }, []);

  // Update theme when dark mode or user type changes
  useEffect(() => {
    updateThemeForCurrentUser();
  }, [isDarkMode]);

  const updateThemeForCurrentUser = () => {
    // Use getThemeForUserType with 'student' as default to ensure all properties are available
    const defaultTheme = getThemeForUserType('student', isDarkMode);
    setTheme(defaultTheme);
  };

  const loadPreferences = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedLanguage = await AsyncStorage.getItem('language');
      
      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      }
      
      if (savedLanguage && languages[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      if (languages[languageCode]) {
        setCurrentLanguage(languageCode);
        await AsyncStorage.setItem('language', languageCode);
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const getString = (key) => {
    return languages[currentLanguage]?.strings[key] || languages.pt.strings[key] || key;
  };

  // Function to manually update theme (called when user type changes)
  const updateUserTheme = React.useCallback((userType) => {
    const newTheme = getThemeForUserType(userType, isDarkMode);
    setTheme(newTheme);
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    currentLanguage,
    theme,
    languages,
    toggleDarkMode,
    changeLanguage,
    getString,
    updateUserTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};