import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      userProfile: null,
      academia: null,
      loading: true,
      isAuthenticated: false,

      // Ações
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setUserProfile: (userProfile) => set({ userProfile }),

      setAcademia: (academia) => set({ academia }),

      setLoading: (loading) => set({ loading }),

      // Login
      login: (user, userProfile = null) => set({
        user,
        userProfile,
        isAuthenticated: true,
        loading: false
      }),

      // Logout
      logout: () => set({
        user: null,
        userProfile: null,
        academia: null,
        isAuthenticated: false,
        loading: false
      }),

      // Atualizar perfil
      updateProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates }
      })),

      // Getters
      getUserType: () => {
        const { userProfile } = get();
        if (!userProfile) return 'student';
        
        let userType = userProfile.userType || userProfile.tipo || 'student';
        
        // Mapear valores em português para inglês
        if (userType === 'instrutor') return 'instructor';
        if (userType === 'aluno') return 'student';
        if (userType === 'administrador') return 'admin';
        
        return userType;
      },

      isComplete: () => {
        const { user, userProfile, academia } = get();
        return !!(user && userProfile && academia);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        academia: state.academia,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
