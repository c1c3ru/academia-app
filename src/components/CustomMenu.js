import React from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Text, Icon } from 'react-native-elements';

const CustomMenu = ({ visible, onDismiss, anchor, children, style }) => {
  return (
    <View>
      {anchor}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <View style={[styles.menuContainer, style]}>
            {children}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const MenuItem = ({ onPress, title, titleStyle, style, ...props }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, style]}
      onPress={onPress}
      {...props}
    >
      <Text style={[styles.menuItemText, titleStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

CustomMenu.Item = MenuItem;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        ...Platform.select({

          ios: {

            shadowColor: '#000',

            shadowOffset: { width: 0, height: 2 },

            shadowOpacity: 0.1,

            shadowRadius: 4,

          },

          android: {

            elevation: 4,

          },

          web: {

            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',

          },

        }),
      },
    }),
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default CustomMenu;
