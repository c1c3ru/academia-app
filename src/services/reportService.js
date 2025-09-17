import { firestoreService } from './firestoreService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class ReportService {
  constructor() {
    this.reportTypes = {
      ATTENDANCE: 'attendance',
      PAYMENTS: 'payments',
      STUDENTS: 'students',
      CLASSES: 'classes',
      FINANCIAL: 'financial',
      GRADUATIONS: 'graduations'
    };
  }

  // Relatório de frequência por período
  async generateAttendanceReport(startDate, endDate, filters = {}) {
    try {
      const checkins = await firestoreService.getDocumentsWithFilters('checkins', [
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate }
      ]);

      const students = await firestoreService.getCollection('users');
      const classes = await firestoreService.getCollection('classes');

      const report = {
        period: { startDate, endDate },
        totalCheckins: checkins.length,
        studentsData: [],
        classesData: [],
        summary: {
          totalStudents: 0,
          activeStudents: 0,
          averageAttendance: 0,
          mostActiveClass: null,
          leastActiveClass: null
        }
      };

      // Agrupar por aluno
      const studentStats = {};
      checkins.forEach(checkin => {
        if (!studentStats[checkin.studentId]) {
          const student = students.find(s => s.id === checkin.studentId);
          studentStats[checkin.studentId] = {
            studentId: checkin.studentId,
            studentName: student?.name || 'Desconhecido',
            totalCheckins: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            attendanceRate: 0
          };
        }

        studentStats[checkin.studentId].totalCheckins++;
        if (checkin.status === 'present') studentStats[checkin.studentId].presentCount++;
        if (checkin.status === 'late') studentStats[checkin.studentId].lateCount++;
        if (checkin.status === 'absent') studentStats[checkin.studentId].absentCount++;
      });

      // Calcular taxa de presença
      Object.values(studentStats).forEach(student => {
        student.attendanceRate = student.totalCheckins > 0 
          ? (student.presentCount / student.totalCheckins) * 100 
          : 0;
      });

      report.studentsData = Object.values(studentStats);
      report.summary.totalStudents = report.studentsData.length;
      report.summary.activeStudents = report.studentsData.filter(s => s.totalCheckins > 0).length;
      report.summary.averageAttendance = report.studentsData.reduce((acc, s) => acc + s.attendanceRate, 0) / report.studentsData.length;

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de frequência:', error);
      throw error;
    }
  }

  // Relatório financeiro
  async generateFinancialReport(startDate, endDate, academiaId) {
    try {
      if (!academiaId) {
        throw new Error('Academia ID é obrigatório');
      }
      
      const payments = await firestoreService.getDocumentsWithFilters(`gyms/${academiaId}/payments`, [
        { field: 'dueDate', operator: '>=', value: startDate },
        { field: 'dueDate', operator: '<=', value: endDate }
      ]);

      const report = {
        period: { startDate, endDate },
        summary: {
          totalRevenue: 0,
          paidAmount: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          totalPayments: payments.length,
          paidPayments: 0,
          pendingPayments: 0,
          overduePayments: 0
        },
        monthlyBreakdown: {},
        paymentsByStatus: {
          paid: [],
          pending: [],
          overdue: []
        }
      };

      payments.forEach(payment => {
        const amount = payment.amount || 0;
        report.summary.totalRevenue += amount;

        switch (payment.status) {
          case 'paid':
            report.summary.paidAmount += amount;
            report.summary.paidPayments++;
            report.paymentsByStatus.paid.push(payment);
            break;
          case 'pending':
            report.summary.pendingAmount += amount;
            report.summary.pendingPayments++;
            report.paymentsByStatus.pending.push(payment);
            break;
          case 'overdue':
            report.summary.overdueAmount += amount;
            report.summary.overduePayments++;
            report.paymentsByStatus.overdue.push(payment);
            break;
        }

        // Agrupar por mês
        const monthKey = new Date(payment.dueDate.toDate()).toISOString().substring(0, 7);
        if (!report.monthlyBreakdown[monthKey]) {
          report.monthlyBreakdown[monthKey] = {
            month: monthKey,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            overdueAmount: 0
          };
        }
        report.monthlyBreakdown[monthKey].totalAmount += amount;
        report.monthlyBreakdown[monthKey][`${payment.status}Amount`] += amount;
      });

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      throw error;
    }
  }

  // Relatório de alunos
  async generateStudentsReport() {
    try {
      const students = await firestoreService.getDocumentsWithFilters('users', [
        { field: 'userType', operator: '==', value: 'student' }
      ]);

      const classes = await firestoreService.getCollection('classes');
      const modalities = await firestoreService.getCollection('modalities');

      const report = {
        totalStudents: students.length,
        activeStudents: students.filter(s => s.isActive).length,
        inactiveStudents: students.filter(s => !s.isActive).length,
        byGraduation: {},
        byModality: {},
        studentsData: []
      };

      students.forEach(student => {
        // Agrupar por graduação
        const graduation = student.currentGraduation || 'Não definida';
        if (!report.byGraduation[graduation]) {
          report.byGraduation[graduation] = 0;
        }
        report.byGraduation[graduation]++;

        // Dados detalhados do aluno
        const studentClasses = classes.filter(c => c.studentIds?.includes(student.id));
        report.studentsData.push({
          ...student,
          classesCount: studentClasses.length,
          classes: studentClasses.map(c => c.name)
        });
      });

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de alunos:', error);
      throw error;
    }
  }

  // Relatório de graduações
  async generateGraduationsReport(startDate, endDate, academiaId) {
    try {
      if (!academiaId) {
        throw new Error('Academia ID é obrigatório');
      }
      
      const graduations = await firestoreService.getDocumentsWithFilters(`gyms/${academiaId}/graduations`, [
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate }
      ]);

      const students = await firestoreService.getCollection(`gyms/${academiaId}/students`);
      const modalities = await firestoreService.getCollection(`gyms/${academiaId}/modalities`);

      const report = {
        period: { startDate, endDate },
        totalGraduations: graduations.length,
        byModality: {},
        byLevel: {},
        graduationsData: []
      };

      graduations.forEach(graduation => {
        const student = students.find(s => s.id === graduation.studentId);
        const modality = modalities.find(m => m.id === graduation.modalityId);

        // Agrupar por modalidade
        const modalityName = modality?.name || 'Desconhecida';
        if (!report.byModality[modalityName]) {
          report.byModality[modalityName] = 0;
        }
        report.byModality[modalityName]++;

        // Agrupar por nível
        const level = graduation.toLevel;
        if (!report.byLevel[level]) {
          report.byLevel[level] = 0;
        }
        report.byLevel[level]++;

        report.graduationsData.push({
          ...graduation,
          studentName: student?.name || 'Desconhecido',
          modalityName
        });
      });

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de graduações:', error);
      throw error;
    }
  }

  // Exportar relatório para CSV
  async exportToCSV(reportData, reportType, filename) {
    try {
      let csvContent = '';

      switch (reportType) {
        case this.reportTypes.ATTENDANCE:
          csvContent = this.generateAttendanceCSV(reportData);
          break;
        case this.reportTypes.FINANCIAL:
          csvContent = this.generateFinancialCSV(reportData);
          break;
        case this.reportTypes.STUDENTS:
          csvContent = this.generateStudentsCSV(reportData);
          break;
        case this.reportTypes.GRADUATIONS:
          csvContent = this.generateGraduationsCSV(reportData);
          break;
        default:
          throw new Error('Tipo de relatório não suportado');
      }

      const fileUri = `${FileSystem.documentDirectory}${filename}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      return fileUri;
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      throw error;
    }
  }

  // Gerar CSV de frequência
  generateAttendanceCSV(reportData) {
    let csv = 'Nome do Aluno,Total Check-ins,Presenças,Atrasos,Faltas,Taxa de Presença (%)\n';
    
    reportData.studentsData.forEach(student => {
      csv += `${student.studentName},${student.totalCheckins},${student.presentCount},${student.lateCount},${student.absentCount},${student.attendanceRate.toFixed(2)}\n`;
    });

    return csv;
  }

  // Gerar CSV financeiro
  generateFinancialCSV(reportData) {
    let csv = 'Mês,Valor Total,Valor Pago,Valor Pendente,Valor Vencido\n';
    
    Object.values(reportData.monthlyBreakdown).forEach(month => {
      csv += `${month.month},${month.totalAmount.toFixed(2)},${month.paidAmount.toFixed(2)},${month.pendingAmount.toFixed(2)},${month.overdueAmount.toFixed(2)}\n`;
    });

    return csv;
  }

  // Gerar CSV de alunos
  generateStudentsCSV(reportData) {
    let csv = 'Nome,Email,Telefone,Graduação,Status,Número de Turmas\n';
    
    reportData.studentsData.forEach(student => {
      csv += `${student.name},${student.email},${student.phone || ''},${student.currentGraduation || ''},${student.isActive ? 'Ativo' : 'Inativo'},${student.classesCount}\n`;
    });

    return csv;
  }

  // Gerar CSV de graduações
  generateGraduationsCSV(reportData) {
    let csv = 'Data,Aluno,Modalidade,De,Para,Instrutor\n';
    
    reportData.graduationsData.forEach(graduation => {
      const date = new Date(graduation.date.toDate()).toLocaleDateString();
      csv += `${date},${graduation.studentName},${graduation.modalityName},${graduation.fromLevel},${graduation.toLevel},${graduation.instructorId}\n`;
    });

    return csv;
  }

  // Gerar relatório dashboard
  async generateDashboardReport() {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const [attendanceReport, financialReport, studentsReport] = await Promise.all([
        this.generateAttendanceReport(startOfMonth, endOfMonth),
        this.generateFinancialReport(startOfMonth, endOfMonth),
        this.generateStudentsReport()
      ]);

      return {
        month: today.toISOString().substring(0, 7),
        attendance: {
          totalCheckins: attendanceReport.totalCheckins,
          activeStudents: attendanceReport.summary.activeStudents,
          averageAttendance: attendanceReport.summary.averageAttendance
        },
        financial: {
          totalRevenue: financialReport.summary.totalRevenue,
          paidAmount: financialReport.summary.paidAmount,
          pendingAmount: financialReport.summary.pendingAmount,
          overdueAmount: financialReport.summary.overdueAmount
        },
        students: {
          total: studentsReport.totalStudents,
          active: studentsReport.activeStudents,
          inactive: studentsReport.inactiveStudents
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório do dashboard:', error);
      throw error;
    }
  }
}

export default new ReportService();
