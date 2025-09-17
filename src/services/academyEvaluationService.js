import { academyFirestoreService } from './academyFirestoreService';
import { academyUtils, validators } from '../utils/academyValidation';
import notificationService from './notificationService';
import auditLogService from './auditLogService';

class AcademyEvaluationService {
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

  // Validar academiaId antes de operações
  _validateAcademiaId(academiaId, operation) {
    const validation = validators.isValidAcademiaId(academiaId);
    if (!validation.valid) {
      throw new Error(`${operation}: ${validation.error}`);
    }
    return academiaId;
  }

  // Criar avaliação
  async createEvaluation(academiaId, evaluationData) {
    try {
      this._validateAcademiaId(academiaId, 'Criar avaliação');

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
        graduationResult: evaluationData.graduationResult || null
      };

      const evaluationId = await academyFirestoreService.create('evaluations', evaluation, academiaId);

      // Log de auditoria
      await auditLogService.logCreate(academiaId, 'evaluations', evaluationId, evaluation);

      // Notificar aluno sobre nova avaliação
      await this.notifyStudentEvaluation(evaluation.studentId, evaluation);

      // Se for avaliação de graduação aprovada, processar graduação
      if (evaluation.isGraduationEvaluation && evaluation.graduationResult === 'approved') {
        await this.processGraduation(academiaId, { ...evaluation, id: evaluationId });
      }

      console.log(`📊 Avaliação criada: ${evaluationId} para aluno ${evaluation.studentId} na academia ${academiaId}`);
      return { id: evaluationId, ...evaluation };
    } catch (error) {
      console.error('❌ Erro ao criar avaliação:', error);
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
  async getStudentEvaluations(academiaId, studentId, filters = {}) {
    try {
      this._validateAcademiaId(academiaId, 'Buscar avaliações do aluno');

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

      const evaluations = await academyFirestoreService.getDocuments(
        'evaluations',
        academiaId,
        queryFilters,
        { field: 'date', direction: 'desc' }
      );
      
      return evaluations;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do aluno:', error);
      throw error;
    }
  }

  // Buscar avaliações do instrutor
  async getInstructorEvaluations(academiaId, instructorId, filters = {}) {
    try {
      this._validateAcademiaId(academiaId, 'Buscar avaliações do instrutor');

      const queryFilters = [
        { field: 'instructorId', operator: '==', value: instructorId }
      ];

      if (filters.studentId) {
        queryFilters.push({ field: 'studentId', operator: '==', value: filters.studentId });
      }

      if (filters.type) {
        queryFilters.push({ field: 'type', operator: '==', value: filters.type });
      }

      const evaluations = await academyFirestoreService.getDocuments(
        'evaluations',
        academiaId,
        queryFilters,
        { field: 'date', direction: 'desc' }
      );
      
      return evaluations;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do instrutor:', error);
      throw error;
    }
  }

  // Processar graduação aprovada
  async processGraduation(academiaId, evaluation) {
    try {
      this._validateAcademiaId(academiaId, 'Processar graduação');

      // Buscar dados do aluno - usar coleção global users
      const student = await academyFirestoreService.getById('users', evaluation.studentId);
      const modality = await academyFirestoreService.getById('modalities', evaluation.modalityId, academiaId);

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

      // Criar registro de graduação na academia específica
      const graduationData = {
        studentId: evaluation.studentId,
        modalityId: evaluation.modalityId,
        fromLevel: currentGraduation,
        toLevel: nextGraduation,
        date: evaluation.date,
        instructorId: evaluation.instructorId,
        evaluationId: evaluation.id,
        notes: evaluation.comments
      };

      const graduationId = await academyFirestoreService.create('graduations', graduationData, academiaId);

      // Atualizar graduação atual do aluno na coleção global users
      await academyFirestoreService.update('users', evaluation.studentId, {
        currentGraduation: nextGraduation
      });

      // Log de auditoria para graduação
      await auditLogService.logGraduation(
        academiaId,
        graduationId,
        evaluation.studentId,
        currentGraduation,
        nextGraduation
      );

      // Notificar graduação
      await notificationService.notifyGraduation(
        evaluation.studentId,
        currentGraduation,
        nextGraduation,
        modality.name
      );

      console.log(`🎓 Graduação processada: ${evaluation.studentId} de ${currentGraduation} para ${nextGraduation} na academia ${academiaId}`);
      return { ...graduationData, id: graduationId };
    } catch (error) {
      console.error('❌ Erro ao processar graduação:', error);
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
      console.error('❌ Erro ao notificar avaliação:', error);
    }
  }

  // Gerar relatório de evolução do aluno
  async generateStudentProgressReport(academiaId, studentId, modalityId) {
    try {
      this._validateAcademiaId(academiaId, 'Gerar relatório de progresso');

      const evaluations = await this.getStudentEvaluations(academiaId, studentId, { modalityId });
      const graduations = await academyFirestoreService.getDocuments('graduations', academiaId, [
        { field: 'studentId', operator: '==', value: studentId },
        { field: 'modalityId', operator: '==', value: modalityId }
      ]);

      const report = {
        academiaId,
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
      console.error('❌ Erro ao gerar relatório de progresso:', error);
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
  async compareStudents(academiaId, studentIds, modalityId) {
    try {
      this._validateAcademiaId(academiaId, 'Comparar alunos');

      const comparisons = [];

      for (const studentId of studentIds) {
        const report = await this.generateStudentProgressReport(academiaId, studentId, modalityId);
        const student = await academyFirestoreService.getById('users', studentId);
        
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

      const classAverage = comparisons.length > 0 
        ? comparisons.reduce((sum, c) => sum + c.averageScore, 0) / comparisons.length 
        : 0;

      return {
        academiaId,
        modalityId,
        studentsCount: comparisons.length,
        comparisons,
        classAverage
      };
    } catch (error) {
      console.error('❌ Erro ao comparar alunos:', error);
      throw error;
    }
  }

  // Agendar próxima avaliação
  async scheduleNextEvaluation(academiaId, studentId, instructorId, modalityId, scheduledDate, type) {
    try {
      this._validateAcademiaId(academiaId, 'Agendar avaliação');

      const scheduleData = {
        studentId,
        instructorId,
        modalityId,
        scheduledDate: new Date(scheduledDate),
        type,
        status: 'scheduled'
      };

      const scheduleId = await academyFirestoreService.create('evaluation_schedules', scheduleData, academiaId);

      // Log de auditoria
      await auditLogService.logCreate(academiaId, 'evaluation_schedules', scheduleId, scheduleData);

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

      console.log(`📅 Avaliação agendada: ${scheduleId} para aluno ${studentId} na academia ${academiaId}`);
      return { id: scheduleId, ...scheduleData };
    } catch (error) {
      console.error('❌ Erro ao agendar avaliação:', error);
      throw error;
    }
  }

  // Método para usar o academiaId do contexto do usuário atual
  async withCurrentAcademia(operation) {
    try {
      const academiaId = academyUtils.getCurrentAcademiaId();
      return await operation(academiaId);
    } catch (error) {
      console.error('❌ Erro ao executar operação com academia atual:', error);
      throw error;
    }
  }
}

export default new AcademyEvaluationService();