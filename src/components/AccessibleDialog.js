import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Modal, Pressable } from 'react-native';
import { Portal, Dialog } from 'react-native-paper';

const AccessibleDialog = ({ visible, onDismiss, children, style, ...props }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      // Para web, garantir que o diálogo tenha foco adequado
      const timer = setTimeout(() => {
        if (dialogRef.current) {
          // Remove aria-hidden de elementos focáveis dentro do diálogo
          const focusableElements = dialogRef.current.querySelectorAll(
            'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
          );
          
          focusableElements.forEach(element => {
            // Remove aria-hidden se existir
            if (element.hasAttribute('aria-hidden')) {
              element.removeAttribute('aria-hidden');
            }
            
            // Garante que elementos focáveis não tenham aria-hidden
            let parent = element.parentElement;
            while (parent && parent !== dialogRef.current) {
              if (parent.hasAttribute('aria-hidden') && parent.getAttribute('aria-hidden') === 'true') {
                // Se o pai tem aria-hidden, remove do elemento focável
                element.setAttribute('aria-hidden', 'false');
                break;
              }
              parent = parent.parentElement;
            }
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onDismiss}
      overlayStyle={[styles.dialog, style]}
      {...props}
    >
      <View ref={dialogRef}>
        {children}
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  dialog: {
    ...(Platform.OS === 'web' && {
      // Garantir z-index adequado para web
      zIndex: 1000,
    }),
  },
});

export default AccessibleDialog;
