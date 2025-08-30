import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { formatters } from '../utils/validation';

const FormInput = ({
  label,
  value,
  onChangeText,
  error,
  touched,
  onBlur,
  formatter,
  maxLength,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text) => {
    let formattedText = text;
    
    // Aplicar formatação se especificada
    if (formatter && formatters[formatter]) {
      formattedText = formatters[formatter](text);
    }
    
    // Aplicar limite de caracteres
    if (maxLength && formattedText.length > maxLength) {
      formattedText = formattedText.substring(0, maxLength);
    }
    
    onChangeText(formattedText);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const hasError = touched && error;

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        mode="outlined"
        error={hasError}
        style={[
          styles.input,
          hasError && styles.inputError,
          isFocused && styles.inputFocused
        ]}
        theme={{
          colors: {
            primary: hasError ? '#F44336' : '#2196F3',
            error: '#F44336'
          }
        }}
        {...props}
      />
      
      {hasError && (
        <HelperText type="error" visible={hasError} style={styles.errorText}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
  },
  inputFocused: {
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormInput;
