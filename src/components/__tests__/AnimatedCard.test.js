import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Animated } from 'react-native';
import AnimatedCard from '../AnimatedCard';

const TestWrapper = ({ children }) => (
  <PaperProvider>
    {children}
  </PaperProvider>
);

// Animated is already mocked in setup.js

describe('AnimatedCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedCard>
          <div>Test Content</div>
        </AnimatedCard>
      </TestWrapper>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <TestWrapper>
        <AnimatedCard style={customStyle} testID="animated-card">
          <div>Content</div>
        </AnimatedCard>
      </TestWrapper>
    );

    const card = getByTestId('animated-card');
    expect(card.props.style).toContainEqual(expect.objectContaining(customStyle));
  });

  it('starts animation with default delay', () => {
    render(
      <TestWrapper>
        <AnimatedCard>
          <div>Content</div>
        </AnimatedCard>
      </TestWrapper>
    );

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('starts animation with custom delay', () => {
    const customDelay = 500;
    render(
      <TestWrapper>
        <AnimatedCard delay={customDelay}>
          <div>Content</div>
        </AnimatedCard>
      </TestWrapper>
    );

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('renders with elevation prop', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AnimatedCard elevation={8} testID="animated-card">
          <div>Content</div>
        </AnimatedCard>
      </TestWrapper>
    );

    expect(getByTestId('animated-card')).toBeTruthy();
  });
});
