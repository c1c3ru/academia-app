// Sistema de formatação internacionalizada para datas, números e moedas
// Centraliza formatação por idioma escolhido pelo usuário

/**
 * Mapeia idiomas da aplicação para códigos de localização
 */
const LOCALE_MAP = {
  pt: 'pt-BR',
  en: 'en-US', 
  es: 'es-ES'
};

/**
 * Configuração de moedas por localização
 */
const CURRENCY_MAP = {
  'pt-BR': 'BRL',
  'en-US': 'USD',
  'es-ES': 'EUR'
};

/**
 * Formatador de datas por idioma
 * @param {Date|string} date - Data a ser formatada
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @param {object} options - Opções do Intl.DateTimeFormat
 * @returns {string} Data formatada
 */
export const formatDate = (date, language = 'pt', options = {}) => {
  if (!date) return '';
  
  const locale = LOCALE_MAP[language] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  };

  return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
};

/**
 * Formatador de data/hora completa
 * @param {Date|string} date - Data a ser formatada
 * @param {string} language - Idioma ('pt', 'en', 'es')  
 * @returns {string} Data e hora formatadas
 */
export const formatDateTime = (date, language = 'pt') => {
  if (!date) return '';
  
  const locale = LOCALE_MAP[language] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatador de apenas a hora
 * @param {Date|string} date - Data a ser formatada
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @returns {string} Hora formatada
 */
export const formatTime = (date, language = 'pt') => {
  if (!date) return '';
  
  const locale = LOCALE_MAP[language] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatador de moeda por idioma
 * @param {number} amount - Valor a ser formatado
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @param {string} currency - Código da moeda (opcional, detecta por idioma)
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (amount, language = 'pt', currency = null) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '';
  
  const locale = LOCALE_MAP[language] || 'pt-BR';
  const currencyCode = currency || CURRENCY_MAP[locale] || 'BRL';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

/**
 * Formatador de números por idioma
 * @param {number} number - Número a ser formatado
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @param {object} options - Opções do Intl.NumberFormat
 * @returns {string} Número formatado
 */
export const formatNumber = (number, language = 'pt', options = {}) => {
  if (number === null || number === undefined || isNaN(number)) return '';
  
  const locale = LOCALE_MAP[language] || 'pt-BR';
  
  return new Intl.NumberFormat(locale, options).format(number);
};

/**
 * Formatador de porcentagem por idioma
 * @param {number} decimal - Valor decimal (0.15 para 15%)
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @returns {string} Porcentagem formatada
 */
export const formatPercentage = (decimal, language = 'pt') => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return '';
  
  const locale = LOCALE_MAP[language] || 'pt-BR';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(decimal);
};

/**
 * Formatador de data relativa (ex: "há 2 dias")
 * @param {Date|string} date - Data para comparação
 * @param {string} language - Idioma ('pt', 'en', 'es')
 * @returns {string} Data relativa formatada
 */
export const formatRelativeDate = (date, language = 'pt') => {
  if (!date) return '';
  
  const locale = LOCALE_MAP[language] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  
  try {
    // Use Intl.RelativeTimeFormat quando disponível
    if (typeof Intl.RelativeTimeFormat !== 'undefined') {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const diffTime = dateObj.getTime() - now.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (Math.abs(diffDays) < 1) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        return rtf.format(diffHours, 'hour');
      }
      
      return rtf.format(diffDays, 'day');
    }
  } catch (e) {
    console.warn('Intl.RelativeTimeFormat não disponível, usando formatação simples');
  }
  
  // Fallback para formatação simples
  return formatDate(date, language);
};

/**
 * Obtém configuração regional baseada no idioma
 * @param {string} language - Idioma ('pt', 'en', 'es')  
 * @returns {object} Configurações regionais
 */
export const getLocaleSettings = (language = 'pt') => {
  const locale = LOCALE_MAP[language] || 'pt-BR';
  const currency = CURRENCY_MAP[locale] || 'BRL';
  
  return {
    locale,
    currency,
    language,
    dateFormat: language === 'en' ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
    decimalSeparator: language === 'en' ? '.' : ',',
    thousandSeparator: language === 'en' ? ',' : '.'
  };
};

/**
 * Hook-like function para uso em componentes React
 * Requer o contexto de tema para obter o idioma atual
 */
export const createI18nFormatters = (getString) => {
  // Detecta idioma atual baseado no contexto
  const currentLanguage = getString('language') || 'pt';
  
  return {
    formatDate: (date, options) => formatDate(date, currentLanguage, options),
    formatDateTime: (date) => formatDateTime(date, currentLanguage),
    formatTime: (date) => formatTime(date, currentLanguage),
    formatCurrency: (amount, currency) => formatCurrency(amount, currentLanguage, currency),
    formatNumber: (number, options) => formatNumber(number, currentLanguage, options),
    formatPercentage: (decimal) => formatPercentage(decimal, currentLanguage),
    formatRelativeDate: (date) => formatRelativeDate(date, currentLanguage),
    getLocaleSettings: () => getLocaleSettings(currentLanguage)
  };
};

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatRelativeDate,
  getLocaleSettings,
  createI18nFormatters
};