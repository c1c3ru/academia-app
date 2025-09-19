import academyCollectionsService from '../services/academyCollectionsService';

export const graduationRepository = {
  /**
   * Adiciona uma nova graduação e atualiza o perfil do aluno
   */
  addGraduation: async (academiaId, studentId, graduationData) => {
    try {
      console.log('Tentando salvar graduação:', { academiaId, studentId, graduationData });
      
      // Salvar graduação
      const graduationId = await academyCollectionsService.createDocument(academiaId, 'graduations', graduationData);
      console.log('Graduação salva com ID:', graduationId);

      // Atualizar perfil do aluno
      await academyCollectionsService.updateDocument(academiaId, 'students', studentId, {
        currentGraduation: graduationData.graduation,
        lastGraduationDate: graduationData.date,
        updatedAt: new Date()
      });
      console.log('Perfil do aluno atualizado');

      return { success: true, graduationId };
    } catch (error) {
      console.error('Erro detalhado ao salvar graduação:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Não foi possível salvar a graduação. Tente novamente.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para adicionar graduações. Contate o administrador.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Academia ou aluno não encontrado. Verifique os dados.';
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Carrega dados iniciais necessários para a tela de graduação
   */
  loadInitialData: async (academiaId, studentId) => {
    try {
      const [modalitiesData, instructorsData, studentData] = await Promise.all([
        academyCollectionsService.getModalities(academiaId),
        academyCollectionsService.getCollection(academiaId, 'instructors'),
        academyCollectionsService.getCollection(academiaId, 'students')
      ]);

      const student = studentData?.find(user => user.id === studentId);
      
      return {
        modalities: modalitiesData || [],
        instructors: instructorsData || [],
        currentGraduation: student?.currentGraduation || null
      };
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      throw new Error('Não foi possível carregar os dados necessários');
    }
  }
};

export default graduationRepository;
