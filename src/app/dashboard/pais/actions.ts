"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Cria uma nova tarefa vinculada à família do usuário logado
 * e atribuída aos filhos selecionados.
 */
export async function criarTarefaAction(data: {
  descricao: string;
  pontos: number;
  filhosIds: string[];
  diasSemana: string; // Ex: "1,2,3"
}) {
  try {
    // 1. Pega a sessão no servidor para garantir o familyId correto
    const session = await getServerSession(authOptions);

    if (!session?.user?.familyId) {
      console.error("🚫 Erro: Usuário não autenticado ou sem familyId.");
      return { error: "Não autorizado" };
    }

    // 2. Cria a tarefa no Prisma
    await prisma.task.create({
      data: {
        description: data.descricao,
        points: data.pontos,
        diasSemana: data.diasSemana,
        family: {
          connect: { id: session.user.familyId }
        },
        assignedTo: {
          connect: data.filhosIds.map(id => ({ id }))
        }
      }
    });
    
    revalidatePath("/dashboard/pais");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao criar tarefa no Prisma:", error);
    return { error: "Erro ao criar tarefa" };
  }
}

/**
 * Marca ou desmarca uma tarefa como concluída para um filho específico em uma data.
 */
export async function toggleTarefaAction(
  taskId: string, 
  userId: string, 
  dataContexto: string, 
  status: boolean
) {
  // Normalizamos a data para o meio-dia UTC para evitar problemas de fuso horário
  const dataExecucao = new Date(`${dataContexto}T12:00:00Z`);

  try {
    if (status) {
      // Adiciona a execução (Marcar como feito)
      await prisma.taskExecution.upsert({
        where: { 
          taskId_userId_date: { 
            taskId, 
            userId, 
            date: dataExecucao 
          } 
        },
        update: {},
        create: { 
          taskId, 
          userId, 
          date: dataExecucao 
        },
      });
    } else {
      // Remove a execução (Desmarcar)
      await prisma.taskExecution.deleteMany({
        where: { 
          taskId, 
          userId, 
          date: dataExecucao 
        },
      });
    }
    
    revalidatePath("/dashboard/pais");
    return { success: true };
  } catch (e) {
    console.error("❌ Erro no toggleTarefaAction:", e);
    return { error: "Erro ao atualizar status da tarefa" };
  }
}
/**
 * Deleta uma tarefa permanentemente.
 */
export async function deletarTarefaAction(taskId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.familyId) {
      return { error: "Não autorizado" };
    }

    // Deleta a tarefa. O Prisma cuidará de deletar as TaskExecutions associadas
    // devido à configuração 'onDelete: Cascade' no schema.
    await prisma.task.delete({
      where: { 
        id: taskId,
        familyId: session.user.familyId // Segurança extra: garante que é da família
      },
    });
    
    revalidatePath("/dashboard/pais");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao deletar tarefa:", error);
    return { error: "Erro ao deletar tarefa" };
  }
}