import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPais({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; tab?: string; userId?: string }>;
}) {
  const session = await getServerSession(authOptions);

  // 1. Proteção de Rota Inteligente
  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "FILHO") {
    redirect("/dashboard/filho");
  }

  if (!session.user.familyId) {
    redirect("/login");
  }

  const { date, userId } = await searchParams;
  const familyId = session.user.familyId;

  // 2. Tratamento da Data e Cálculo da Semana (Segunda a Domingo)
  const dataString = date || new Date().toISOString().split('T')[0];
  const dataFoco = new Date(`${dataString}T12:00:00`);
  
  const diaDaSemana = dataFoco.getDay(); // 0 (Dom) a 6 (Sab)
  const diffParaSegunda = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;
  
  const inicioSemana = new Date(dataFoco);
  inicioSemana.setDate(dataFoco.getDate() + diffParaSegunda);
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  // 3. Busca de Dados no Prisma
  const [filhosNoBanco, tarefasNoBanco] = await Promise.all([
    // Busca todos os filhos + Tarefas Atribuídas para o placar semanal
    prisma.user.findMany({
      where: { familyId, role: "FILHO" },
      include: { 
        tasksAssigned: true, 
        executions: {
          where: { date: { gte: inicioSemana, lte: fimSemana } },
          include: { task: true }
        } 
      },
    }),
    // Busca tarefas do dia selecionado para a lista e progresso diário
    prisma.task.findMany({
      where: { 
        familyId,
        diasSemana: { contains: diaDaSemana.toString() },
        // Se houver userId, filtra as tarefas para a visão específica, 
        // caso contrário traz todas da família para o contexto geral
        ...(userId ? { assignedTo: { some: { id: userId } } } : {})
      },
      include: { 
        assignedTo: true, 
        executions: {
          where: { 
            date: {
              gte: new Date(`${dataString}T00:00:00Z`),
              lte: new Date(`${dataString}T23:59:59Z`)
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
  ]);

  // 4. Formatação do Placar Semanal (Heróis)
  const herois = filhosNoBanco.map((f) => {
    const pontosGanhos = f.executions.reduce((acc, exec) => acc + (exec.task?.points || 0), 0);

    const totalPossivel = f.tasksAssigned.reduce((acc, tarefa) => {
      const diasArray = tarefa.diasSemana ? tarefa.diasSemana.split(",") : [];
      return acc + (tarefa.points * diasArray.length);
    }, 0);

    return {
      id: f.id,
      nome: f.name,
      pontos: pontosGanhos,
      totalSemana: totalPossivel || 100, 
    };
  });

  // 5. Formatação das Tarefas para o Cliente
  const tarefasTratadas = tarefasNoBanco.map((t) => ({
    id: t.id,
    description: t.description,
    points: t.points,
    diasSemana: t.diasSemana,
    assignedTo: t.assignedTo || [], 
    concluintesIds: t.executions.map(e => e.userId),
  }));

  // 6. Cálculo do Progresso do Dia (Baseado no Herói selecionado)
  const pontosRealizadosHoje = tarefasNoBanco.reduce((acc, t) => {
    if (userId && t.executions.some(e => e.userId === userId)) {
      return acc + t.points;
    }
    return acc;
  }, 0);

  const totalPossivelHoje = tarefasNoBanco.reduce((acc, t) => {
    if (userId && t.assignedTo.some(f => f.id === userId)) {
      return acc + t.points;
    }
    return acc;
  }, 0);

  // 7. Retorno para o Componente de Cliente
  return (
    <DashboardClient 
      herois={herois} 
      tarefas={tarefasTratadas} 
      dataContexto={dataString}
      familyId={familyId}
      filhosBase={filhosNoBanco.map(f => ({ id: f.id, nome: f.name }))}
      userName={session.user.name}
      progressoDia={{
        realizado: pontosRealizadosHoje,
        total: totalPossivelHoje
      }}
    />
  );
}