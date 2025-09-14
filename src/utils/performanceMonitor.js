import { Platform } from 'react-native';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = (typeof __DEV__ !== 'undefined' && __DEV__) || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
    this.startTime = Date.now();
  }

  // Iniciar medição de performance
  startMeasure(name) {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, {
      startTime: Date.now(),
      startMemory: this.getMemoryUsage()
    });
    
    console.log(`🚀 Performance: Iniciando medição "${name}"`);
  }

  // Finalizar medição de performance
  endMeasure(name) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`⚠️ Performance: Medição "${name}" não encontrada`);
      return;
    }

    const endTime = Date.now();
    const endMemory = this.getMemoryUsage();
    const duration = endTime - metric.startTime;
    const memoryDelta = endMemory - metric.startMemory;

    const result = {
      name,
      duration,
      memoryDelta,
      startMemory: metric.startMemory,
      endMemory
    };

    // Log formatado
    console.log(`📊 Performance: "${name}" concluída`);
    console.log(`   ⏱️  Duração: ${duration}ms`);
    console.log(`   💾 Memória: ${memoryDelta > 0 ? '+' : ''}${memoryDelta.toFixed(2)}MB`);
    
    // Alertas para performance ruim
    if (duration > 1000) {
      console.warn(`🐌 Performance: "${name}" demorou ${duration}ms (>1s)`);
    }
    if (memoryDelta > 10) {
      console.warn(`🐘 Performance: "${name}" usou ${memoryDelta.toFixed(2)}MB de memória`);
    }

    this.metrics.delete(name);
    return result;
  }

  // Obter uso de memória (aproximado)
  getMemoryUsage() {
    if (Platform.OS === 'web' && performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    // Para mobile, retornar estimativa baseada no tempo
    return (Date.now() - this.startTime) / 10000; // Estimativa simples
  }

  // Medir tempo de renderização de componente
  measureComponentRender(componentName) {
    return {
      start: () => this.startMeasure(`Component:${componentName}`),
      end: () => this.endMeasure(`Component:${componentName}`)
    };
  }

  // Medir navegação entre telas
  measureNavigation(fromScreen, toScreen) {
    const measureName = `Navigation:${fromScreen}->${toScreen}`;
    this.startMeasure(measureName);
    
    return () => this.endMeasure(measureName);
  }

  // Medir operações assíncronas
  async measureAsync(name, asyncOperation) {
    this.startMeasure(name);
    try {
      const result = await asyncOperation();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      console.error(`❌ Performance: Erro em "${name}":`, error);
      throw error;
    }
  }

  // Relatório geral de performance
  getReport() {
    const uptime = Date.now() - this.startTime;
    const currentMemory = this.getMemoryUsage();
    
    return {
      uptime,
      currentMemory,
      platform: Platform.OS,
      isEnabled: this.isEnabled,
      activeMetrics: Array.from(this.metrics.keys())
    };
  }

  // Log do relatório
  logReport() {
    const report = this.getReport();
    console.log('📈 RELATÓRIO DE PERFORMANCE');
    console.log('=' .repeat(40));
    console.log(`⏰ Uptime: ${(report.uptime / 1000).toFixed(1)}s`);
    console.log(`💾 Memória atual: ${report.currentMemory.toFixed(2)}MB`);
    console.log(`📱 Plataforma: ${report.platform}`);
    console.log(`🔍 Medições ativas: ${report.activeMetrics.length}`);
    if (report.activeMetrics.length > 0) {
      console.log(`   ${report.activeMetrics.join(', ')}`);
    }
  }
}

// Instância singleton
const performanceMonitor = new PerformanceMonitor();

// HOC para medir performance de componentes
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return React.forwardRef((props, ref) => {
    const monitor = performanceMonitor.measureComponentRender(componentName || WrappedComponent.name);
    
    React.useEffect(() => {
      monitor.start();
      return () => monitor.end();
    }, []);

    return <WrappedComponent {...props} ref={ref} />;
  });
};

// Hook para medir performance
export const usePerformanceMonitor = () => {
  return {
    startMeasure: (name) => performanceMonitor.startMeasure(name),
    endMeasure: (name) => performanceMonitor.endMeasure(name),
    measureAsync: (name, operation) => performanceMonitor.measureAsync(name, operation),
    measureNavigation: (from, to) => performanceMonitor.measureNavigation(from, to),
    getReport: () => performanceMonitor.getReport(),
    logReport: () => performanceMonitor.logReport()
  };
};

export default performanceMonitor;
