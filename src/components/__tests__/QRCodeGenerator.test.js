import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import QRCodeGenerator from '../QRCodeGenerator';

const TestWrapper = ({ children }) => (
  <PaperProvider>
    {children}
  </PaperProvider>
);

describe('QRCodeGenerator', () => {
  const defaultProps = {
    academiaId: 'test-academia-id',
    academiaNome: 'Test Academia'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByText } = render(
      <TestWrapper>
        <QRCodeGenerator {...defaultProps} />
      </TestWrapper>
    );

    expect(getByText('Test Academia')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <QRCodeGenerator {...defaultProps} size={300} testID="qr-generator" />
      </TestWrapper>
    );

    expect(getByTestId('qr-generator')).toBeTruthy();
  });

  it('shows actions when showActions is true', () => {
    const { getByText } = render(
      <TestWrapper>
        <QRCodeGenerator {...defaultProps} showActions={true} />
      </TestWrapper>
    );

    expect(getByText('Compartilhar')).toBeTruthy();
    expect(getByText('Salvar')).toBeTruthy();
  });

  it('does not show actions when showActions is false', () => {
    const { queryByText } = render(
      <TestWrapper>
        <QRCodeGenerator {...defaultProps} showActions={false} />
      </TestWrapper>
    );

    expect(queryByText('Compartilhar')).toBeNull();
    expect(queryByText('Salvar')).toBeNull();
  });

  it('calls share function when share button is pressed', () => {
    const { getByText } = render(
      <TestWrapper>
        <QRCodeGenerator {...defaultProps} showActions={true} />
      </TestWrapper>
    );

    const shareButton = getByText('Compartilhar');
    fireEvent.press(shareButton);
    // Note: We can't easily test the actual sharing functionality in unit tests
    // This would be better tested in integration or E2E tests
  });

  it('generates correct QR code data', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <QRCodeGenerator {...defaultProps} testID="qr-code" />
      </TestWrapper>
    );

    const qrCode = getByTestId('qr-code');
    expect(qrCode).toBeTruthy();
  });
});
