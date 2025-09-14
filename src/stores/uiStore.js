import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // Estado da UI
  theme: 'light',
  language: 'pt',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true
  },
  drawer: {
    isOpen: false
  },
  modals: {
    profile: false,
    settings: false,
    loading: false
  },
  
  // Ações do tema
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),

  // Ações de idioma
  setLanguage: (language) => set({ language }),

  // Ações de notificações
  updateNotifications: (updates) => set((state) => ({
    notifications: { ...state.notifications, ...updates }
  })),

  // Ações do drawer
  openDrawer: () => set((state) => ({
    drawer: { ...state.drawer, isOpen: true }
  })),
  closeDrawer: () => set((state) => ({
    drawer: { ...state.drawer, isOpen: false }
  })),
  toggleDrawer: () => set((state) => ({
    drawer: { ...state.drawer, isOpen: !state.drawer.isOpen }
  })),

  // Ações de modais
  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
  })),
  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),
  closeAllModals: () => set((state) => ({
    modals: Object.keys(state.modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
  })),

  // Estado de loading global
  setGlobalLoading: (loading) => set((state) => ({
    modals: { ...state.modals, loading }
  }))
}));

export default useUIStore;
