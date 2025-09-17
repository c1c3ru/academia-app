import { firestoreService } from './firestoreService';
import notificationService from './notificationService';

class EvaluationService {
  constructor() {
    this.evaluationTypes = {
      TECHNIQUE: 'technique',
      PHYSICAL: 'physical',
      DISCIPLINE: 'discipline',
      PROGRESS: 'progress',
      GRADUATION: 'graduation'
    };

    this.evaluationCriteria = {
      technique: [
        { name: 'Execução de Golpes', weight: 0.3 },
        { name: 'Postura e Equilíbrio', weight: 0.25 },
        { name: 'Coordenação', weight: 0.25 },
        { name: 'Precisão', weight: 0.2 }
      ],
      physical: [
        { name: 'Resistência', weight: 0.3 },
        { name: 'Força', weight: 0.25 },
        { name: 'Flexibilidade', weight: 0.25 },
        { name: 'Velocidade', weight: 0.2 }
      ],
      discipline: [
        { name: 'Pontualidade', weight: 0.3 },
        { name: 'Respeito', weight: 0.3 },
        { name: 'Dedicação', weight: 0.25 },
        { name: 'Comportamento', weight: 0.15 }
      ]
    };
  }

  // Criar avaliação
  async createEvaluation(evaluationData) {
    try {
      const evaluation = {
        studentId: evaluationData.studentId,
        instructorId: evaluationData.instructorId,
        modalityId: evaluationData.modalityId,
        type: evaluationData.type,
        date: new Date(evaluationData.date),
        scores: evaluationData.scores, // { criteriaName: score }
        overallScore: this.calculateOverallScore(evaluationData.scores, evaluationData.type),
        comments: evaluationData.comments || '',
        recommendations: evaluationData.recommendations || '',
        nextEvaluationDate: evaluationData.nextEvaluationDate ? new Date(evaluationData.nextEvaluationDate) : null,
        isGraduationEvaluation: evaluationData.isGraduationEvaluation || false,
        graduationResult: evaluationData.graduationResult || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const evaluationId = await firestoreService.addDocument('evaluations', evaluation);

      // Notificar aluno sobre nova avaliação
      await this.notifyStudentEvaluation(evaluation.studentId, evaluation);

      // Se for avaliação de graduação aprovada, processar graduação
      if (evaluation.isGraduationEvaluation && evaluation.graduationResult === 'approved') {
        await this.processGraduation(evaluation);
      }

      return { id: evaluationId, ...evaluation };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  }

  // Calcular nota geral
  calculateOverallScore(scores, type) {
    const criteria = this.evaluationCriteria[type] || [];
    let totalScore = 0;
    let totalWeight = 0;

    criteria.forEach(criterion => {
      const score = scores[criterion.name] || 0;
      totalScore += score * criterion.weight;
      totalWeight += criterion.weight;
    });

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) / 100 : 0;
  }

  // Buscar avaliações do aluno
  async getStudentEvaluations(studentId, filters = {}) {
    try {
      const queryFilters = [
        { field: 'studentId', operator: '==', value: studentId }
      ];

      if (filters.type) {
        queryFilters.push({ field: 'type', operator: '==', value: filters.type });
      }

      if (filters.startDate) {
        queryFilters.push({ field: 'date', operator: '>=', value: filters.startDate });
      }

      if (filters.endDate) {
        queryFilters.push({ field: 'date', operator: '<=', value: filters.endDate });
      }

      const evaluations = await firestoreService.getDocumentsWithFilters('evaluations', queryFilters);
      
      return evaluations.sort((a, b) => b.date.toDate() - a.date.toDate());
    } catch (error) {
      console.error('Erro ao buscar avaliações do aluno:', error);
      throw error;
    }
  }

  // Buscar avaliações do instrutor
  async getInstructorEvaluations(instructorId, filters = {}) {
    try {
      const queryFilters = [
        { field: 'instructorId', operator: '==', value: instructorId }
      ];

      if (filters.studentId) {
        queryFilters.push({ field: 'studentId', operator: '==', value: filters.studentId });
      }

      if (filters.type) {
        queryFilters.push({ field: 'type', operator: '==', value: filters.type });
      }

      const evaluations = await firestoreService.getDocumentsWithFilters('evaluations', queryFilters);
      
      return evaluations.sort((a, b) => b.date.toDate() - a.date.toDate());
    } catch (error) {
      console.error('Erro ao buscar avaliações do instrutor:', error);
      throw error;
    }
  }

  // Processar graduação aprovada
  async processGraduation(evaluation) {
    try {
      // Buscar dados do aluno
      const student = await firestoreService.getDocument('users', evaluation.studentId);
      const modality = await firestoreService.getDocument('modalities', evaluation.modalityId);

      if (!student || !modality) {
        throw new Error('Dados do aluno ou modalidade não encontrados');
      }

      const currentGraduation = student.currentGraduation || 'Branca';
      const graduationLevels = modality.graduationLevels || [];
      const currentIndex = graduationLevels.indexOf(currentGraduation);
      
      if (currentIndex === -1 || currentIndex >= graduationLevels.length - 1) {
        throw new Error('Graduação atual não encontrada ou já é a máxima');
      }

      const nextGraduation = graduationLevels[currentIndex + 1];

      // Criar registro de graduação
      const graduationData = {
        studentId: evaluation.studentId,
        modalityId: evaluation.modalityId,
        fromLevel: currentGraduation,
        toLevel: nextGraduation,
        date: evaluation.date,
        instructorId: evaluation.instructorId,
        evaluationId: evaluation.id,
        notes: evaluation.comments,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await firestoreService.addDocument('graduations', graduationData);

      // Atualizar graduação atual do aluno
      await firestoreService.updateDocument('users', evaluation.studentId, {
        currentGraduation: nextGraduation,
        updatedAt: new Date()
      });

      // Notificar graduação
      await notificationService.notifyGraduation(
        evaluation.studentId,
        currentGraduation,
        nextGraduation,
        modality.name
      );

      return graduationData;
    } catch (error) {
      console.error('Erro ao processar graduação:', error);
      throw error;
    }
  }

  // Notificar aluno sobre avaliação
  async notifyStudentEvaluation(studentId, evaluation) {
    try {
      const title = evaluation.isGraduationEvaluation 
        ? 'Avaliação de Graduação Realizada'
        : 'Nova Avaliação Disponível';
      
      const body = evaluation.isGraduationEvaluation && evaluation.graduationResult === 'approved'
        ? `Parabéns! Você foi aprovado na avaliação de graduação com nota ${evaluation.overallScore}`
        : `Sua avaliação foi realizada. Nota: ${evaluation.overallScore}`;

      await notificationService.saveNotificationToFirestore({
        userId: studentId,
        title,
        message: body,
        type: 'evaluation',
        data: { evaluationId: evaluation.id },
        isRead: false,
        createdAt: new Date()
      });

      await notificationService.sendLocalNotification(title, body, {
        type: 'evaluation',
        evaluationId: evaluation.id,
        screen: 'Evolução'
      });
    } catch (error) {
      console.error('Erro ao notificar avaliação:', error);
    }
  }

  // Gerar relatório de evolução do aluno
  async generateStudentProgressReport(studentId, modalityId) {
    try {
      const evaluations = await this.getStudentEvaluations(studentId, { modalityId });
      const graduations = await firestoreService.getDocumentsWithFilters('graduations', [
        { field: 'studentId', operator: '==', value: studentId },
        { field: 'modalityId', operator: '==', value: modalityId }
      ]);

      const report = {
        studentId,
        modalityId,
        totalEvaluations: evaluations.length,
        averageScore: 0,
        progressTrend: 'stable',
        strengths: [],
        weaknesses: [],
        recommendations: [],
        graduations: graduations.length,
        lastEvaluation: null,
        nextRecommendedEvaluation: null,
        evaluationHistory: []
      };

      if (evaluations.length > 0) {
        // Calcular média geral
        const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0);
        report.averageScore = Math.round((totalScore / evaluations.length) * 100) / 100;

        // Última avaliação
        report.lastEvaluation = evaluations[0];

        // Histórico de avaliações
        report.evaluationHistory = evaluations.map(evaluation => ({
          date: evaluation.date.toDate(),
          type: evaluation.type,
          score: evaluation.overallScore,
          comments: evaluation.comments
        }));

        // Analisar tendência de progresso
        if (evaluations.length >= 2) {
          const recentScores = evaluations.slice(0, 3).map(e => e.overallScore);
          const olderScores = evaluations.slice(-3).map(e => e.overallScore);
          
          const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
          const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
          
          if (recentAvg > olderAvg + 0.5) {
            report.progressTrend = 'improving';
          } else if (recentAvg < olderAvg - 0.5) {
            report.progressTrend = 'declining';
          }
        }

        // Analisar pontos fortes e fracos
        this.analyzeStrengthsAndWeaknesses(evaluations, report);

        // Próxima avaliação recomendada
        const lastEvalDate = report.lastEvaluation.date.toDate();
        const nextEvalDate = new Date(lastEvalDate);
        nextEvalDate.setMonth(nextEvalDate.getMonth() + 3); // 3 meses depois
        report.nextRecommendedEvaluation = nextEvalDate;
      }

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de progresso:', error);
      throw error;
    }
  }

  // Analisar pontos fortes e fracos
  analyzeStrengthsAndWeaknesses(evaluations, report) {
    const criteriaScores = {};
    
    evaluations.forEach(evaluation => {
      Object.entries(evaluation.scores).forEach(([criteria, score]) => {
        if (!criteriaScores[criteria]) {
          criteriaScores[criteria] = [];
        }
        criteriaScores[criteria].push(score);
      });
    });

    const criteriaAverages = {};
    Object.entries(criteriaScores).forEach(([criteria, scores]) => {
      criteriaAverages[criteria] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    // Ordenar por média
    const sortedCriteria = Object.entries(criteriaAverages)
      .sort(([,a], [,b]) => b - a);

    // Pontos fortes (3 melhores)
    report.strengths = sortedCriteria.slice(0, 3).map(([criteria, avg]) => ({
      criteria,
      average: Math.round(avg * 100) / 100
    }));

    // Pontos fracos (3 piores)
    report.weaknesses = sortedCriteria.slice(-3).map(([criteria, avg]) => ({
      criteria,
      average: Math.round(avg * 100) / 100
    }));

    // Recomendações baseadas nos pontos fracos
    report.recommendations = report.weaknesses.map(weakness => 
      `Focar no desenvolvimento de: ${weakness.criteria} (média atual: ${weakness.average})`
    );
  }

  // Comparar alunos (para instrutores)
  async compareStudents(studentIds, modalityId) {
    try {
      const comparisons = [];

      for (const studentId of studentIds) {
        const report = await this.generateStudentProgressReport(studentId, modalityId);
        const student = await firestoreService.getDocument('users', studentId);
        
        comparisons.push({
          student: {
            id: studentId,
            name: student.name,
            currentGraduation: student.currentGraduation
          },
          averageScore: report.averageScore,
          totalEvaluations: report.totalEvaluations,
          progressTrend: report.progressTrend,
          graduations: report.graduations,
          lastEvaluationDate: report.lastEvaluation?.date.toDate()
        });
      }

      // Ordenar por média de notas
      comparisons.sort((a, b) => b.averageScore - a.averageScore);

      return {
        modalityId,
        studentsCount: comparisons.length,
        comparisons,
        classAverage: comparisons.reduce((sum, c) => sum + c.averageScore, 0) / comparisons.length
      };
    } catch (error) {
      console.error('Erro ao comparar alunos:', error);
      throw error;
    }
  }

  // Agendar próxima avaliação
  async scheduleNextEvaluation(studentId, instructorId, modalityId, scheduledDate, type) {
    try {
      const scheduleData = {
        studentId,
        instructorId,
        modalityId,
        scheduledDate: new Date(scheduledDate),
        type,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const scheduleId = await firestoreService.addDocument('evaluation_schedules', scheduleData);

      // Notificar aluno sobre agendamento
      await notificationService.scheduleNotification(
        'Avaliação Agendada',
        `Sua avaliação de ${type} foi agendada para ${new Date(scheduledDate).toLocaleDateString()}`,
        new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000), // 1 dia antes
        {
          type: 'evaluation',
          scheduleId,
          screen: 'Evolução'
        }
      );

      return { id: scheduleId, ...scheduleData };
    } catch (error) {
      console.error('Erro ao agendar avaliação:', error);
      throw error;
    }
  }
}

export default new EvaluationService();
