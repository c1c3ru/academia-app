import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import ActionButton, { ActionButtonGroup } from '../ActionButton';

const TestWrapper = ({ children }) => (
  <PaperProvider>
    {children}
  </PaperProvider>
);

describe('ActionButton', () => {
  const defaultProps = {
    onPress: jest.fn(),
    children: 'Test Button'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <TestWrapper>
        <ActionButton {...defaultProps} />
      </TestWrapper>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <ActionButton onPress={mockOnPress}>Test Button</ActionButton>
      </TestWrapper>
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'danger'];
    
    variants.forEach(variant => {
      const { getByText } = render(
        <TestWrapper>
          <ActionButton variant={variant} onPress={jest.fn()}>
            {variant} Button
          </ActionButton>
        </TestWrapper>
      );
      
      expect(getByText(`${variant} Button`)).toBeTruthy();
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['small', 'medium', 'large'];
    
    sizes.forEach(size => {
      const { getByText } = render(
        <TestWrapper>
          <ActionButton size={size} onPress={jest.fn()}>
            {size} Button
          </ActionButton>
        </TestWrapper>
      );
      
      expect(getByText(`${size} Button`)).toBeTruthy();
    });
  });

  it('renders with icon', () => {
    const { getByText } = render(
      <TestWrapper>
        <ActionButton icon="plus" onPress={jest.fn()}>
          Button with Icon
        </ActionButton>
      </TestWrapper>
    );

    expect(getByText('Button with Icon')).toBeTruthy();
  });

  it('is disabled when loading', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <ActionButton loading onPress={mockOnPress}>
          Loading Button
        </ActionButton>
      </TestWrapper>
    );

    const button = getByText('Loading Button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <ActionButton disabled onPress={mockOnPress}>
          Disabled Button
        </ActionButton>
      </TestWrapper>
    );

    const button = getByText('Disabled Button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});

describe('ActionButtonGroup', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <ActionButtonGroup>
          <ActionButton onPress={jest.fn()}>Button 1</ActionButton>
          <ActionButton onPress={jest.fn()}>Button 2</ActionButton>
        </ActionButtonGroup>
      </TestWrapper>
    );

    expect(getByText('Button 1')).toBeTruthy();
    expect(getByText('Button 2')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <TestWrapper>
        <ActionButtonGroup style={customStyle} testID="button-group">
          <ActionButton onPress={jest.fn()}>Button</ActionButton>
        </ActionButtonGroup>
      </TestWrapper>
    );

    const group = getByTestId('button-group');
    expect(group.props.style).toContainEqual(expect.objectContaining(customStyle));
  });
});
