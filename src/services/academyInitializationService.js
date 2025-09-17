import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

// Dados padrão para inicialização de academias
const defaultModalities = [
    {
        name: "Karate",
        description: "Arte marcial tradicional japonesa focada em técnicas de golpes",
        graduationLevels: ["Branca", "Amarela", "Laranja", "Verde", "Roxa", "Marrom", "Preta 1º Dan", "Preta 2º Dan", "Preta 3º Dan"],
        monthlyPrice: 120.00,
        isActive: true
    },
    {
        name: "Jiu-Jitsu Brasileiro",
        description: "Arte marcial brasileira focada em luta no solo e submissões",
        graduationLevels: ["Branca", "Azul", "Roxa", "Marrom", "Preta", "Coral", "Vermelha"],
        monthlyPrice: 150.00,
        isActive: true
    },
    {
        name: "Muay Thai",
        description: "Arte marcial tailandesa conhecida como 'a arte dos oito membros'",
        graduationLevels: ["Iniciante", "Básico", "Intermediário", "Avançado", "Instrutor", "Professor"],
        monthlyPrice: 130.00,
        isActive: true
    }
];

const defaultPlans = [
    {
        name: "Plano Mensal",
        value: 120.00,
        duration: 1,
        description: "Acesso completo por 1 mês"
    },
    {
        name: "Plano Trimestral",
        value: 320.00,
        duration: 3,
        description: "Acesso completo por 3 meses com desconto"
    },
    {
        name: "Plano Semestral",
        value: 600.00,
        duration: 6,
        description: "Acesso completo por 6 meses com maior desconto"
    },
    {
        name: "Plano Anual",
        value: 1100.00,
        duration: 12,
        description: "Acesso completo por 1 ano com máximo desconto"
    }
];

const defaultAnnouncements = [
    {
        title: "Bem-vindos à Academia!",
        content: "Sejam bem-vindos à nossa academia. Estamos aqui para ajudá-los a alcançar seus objetivos!",
        targetAudience: "all",
        authorId: "system",
        priority: "medium",
        isActive: true
    },
    {
        title: "Horários de Funcionamento",
        content: "Segunda a Sexta: 6h às 22h | Sábado: 8h às 18h | Domingo: 8h às 14h",
        targetAudience: "all",
        authorId: "system",
        priority: "high",
        isActive: true
    }
];

/**
 * Inicializa as subcoleções básicas para uma nova academia
 * @param {string} academiaId - ID da academia criada
 * @returns {Promise<void>}
 */
export const initializeAcademySubcollections = async (academiaId) => {
    try {
        console.log(`🚀 Inicializando subcoleções para academia: ${academiaId}`);

        // 1. Criar modalidades padrão
        console.log('📋 Criando modalidades padrão...');
        for (const modality of defaultModalities) {
            const modalityData = {
                ...modality,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await addDoc(collection(db, `gyms/${academiaId}/modalities`), modalityData);
        }

        // 2. Criar planos padrão
        console.log('💰 Criando planos padrão...');
        for (const plan of defaultPlans) {
            const planData = {
                ...plan,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await addDoc(collection(db, `gyms/${academiaId}/plans`), planData);
        }

        // 3. Criar avisos padrão
        console.log('📢 Criando avisos padrão...');
        for (const announcement of defaultAnnouncements) {
            const announcementData = {
                ...announcement,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await addDoc(collection(db, `gyms/${academiaId}/announcements`), announcementData);
        }

        console.log('✅ Subcoleções inicializadas com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar subcoleções:', error);
        throw error;
    }
};

/**
 * Cria dados de exemplo mais completos (opcional)
 * @param {string} academiaId - ID da academia
 * @returns {Promise<void>}
 */
export const createSampleData = async (academiaId) => {
    try {
        console.log(`🎯 Criando dados de exemplo para academia: ${academiaId}`);

        // Dados de exemplo para instrutores
        const sampleInstructors = [
            {
                name: "João Silva",
                email: "joao.silva@example.com",
                phone: "(85) 99999-1111",
                specialties: ["Karate"],
                isActive: true,
                hireDate: new Date()
            },
            {
                name: "Maria Santos",
                email: "maria.santos@example.com",
                phone: "(85) 99999-2222",
                specialties: ["Jiu-Jitsu Brasileiro"],
                isActive: true,
                hireDate: new Date()
            }
        ];

        // Criar instrutores de exemplo
        for (const instructor of sampleInstructors) {
            const instructorData = {
                ...instructor,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await addDoc(collection(db, `gyms/${academiaId}/instructors`), instructorData);
        }

        console.log('✅ Dados de exemplo criados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao criar dados de exemplo:', error);
        throw error;
    }
};
