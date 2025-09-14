import { create } from 'zustand';

const useAcademiaStore = create((set, get) => ({
  // Estado da academia
  academia: null,
  students: [],
  instructors: [],
  classes: [],
  modalities: [],
  
  // Estados de loading
  loading: {
    students: false,
    instructors: false,
    classes: false,
    modalities: false
  },

  // Ações da academia
  setAcademia: (academia) => set({ academia }),

  // Ações de estudantes
  setStudents: (students) => set({ students }),
  addStudent: (student) => set((state) => ({
    students: [...state.students, student]
  })),
  updateStudent: (id, updates) => set((state) => ({
    students: state.students.map(student => 
      student.id === id ? { ...student, ...updates } : student
    )
  })),
  removeStudent: (id) => set((state) => ({
    students: state.students.filter(student => student.id !== id)
  })),

  // Ações de instrutores
  setInstructors: (instructors) => set({ instructors }),
  addInstructor: (instructor) => set((state) => ({
    instructors: [...state.instructors, instructor]
  })),
  updateInstructor: (id, updates) => set((state) => ({
    instructors: state.instructors.map(instructor => 
      instructor.id === id ? { ...instructor, ...updates } : instructor
    )
  })),

  // Ações de turmas
  setClasses: (classes) => set({ classes }),
  addClass: (classItem) => set((state) => ({
    classes: [...state.classes, classItem]
  })),
  updateClass: (id, updates) => set((state) => ({
    classes: state.classes.map(classItem => 
      classItem.id === id ? { ...classItem, ...updates } : classItem
    )
  })),
  removeClass: (id) => set((state) => ({
    classes: state.classes.filter(classItem => classItem.id !== id)
  })),

  // Ações de modalidades
  setModalities: (modalities) => set({ modalities }),
  addModality: (modality) => set((state) => ({
    modalities: [...state.modalities, modality]
  })),

  // Ações de loading
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value }
  })),

  // Getters
  getStudentById: (id) => {
    const { students } = get();
    return students.find(student => student.id === id);
  },

  getClassById: (id) => {
    const { classes } = get();
    return classes.find(classItem => classItem.id === id);
  },

  getStudentsByClass: (classId) => {
    const { students } = get();
    return students.filter(student => 
      student.turmas && student.turmas.includes(classId)
    );
  },

  // Reset store
  reset: () => set({
    academia: null,
    students: [],
    instructors: [],
    classes: [],
    modalities: [],
    loading: {
      students: false,
      instructors: false,
      classes: false,
      modalities: false
    }
  })
}));

export default useAcademiaStore;
