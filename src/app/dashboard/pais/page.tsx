import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

export default async function DashboardPais({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; tab?: string; userId?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "FILHO") redirect("/dashboard/filho");
  if (!session.user.familyId) redirect("/login");

  const { date, userId } = await searchParams;
  const familyId = session.user.familyId;

  // 1. Tratamento da Data e Intervalos
  const dataString = date || new Date().toISOString().split('T')[0];
  const dataFoco = new Date(`${dataString}T12:00:00`);
  const diaDaSemana = dataFoco.getDay();

  // Para a lista diária
  const inicioDia = startOfDay(dataFoco);
  const fimDia = endOfDay(dataFoco);

  // Para o placar semanal (Segunda a Domingo)
  const inicioSemana = startOfWeek(dataFoco, { weekStartsOn: 0 });
  const fimSemana = endOfWeek(dataFoco, { weekStartsOn: 0 });

  // 2. Busca de Dados no Prisma
  const [filhosNoBanco, tarefasNoBanco] = await Promise.all([
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
    prisma.task.findMany({
      where: { 
        familyId,
        diasSemana: { contains: diaDaSemana.toString() },
        ...(userId ? { assignedTo: { some: { id: userId } } } : {})
      },
      include: { 
        assignedTo: true, 
        executions: {
          where: { date: { gte: inicioDia, lte: fimDia } }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
  ]);

  // 3. Formatação do Placar Dinâmico (Heróis)
  const herois = filhosNoBanco.map((f) => {
    // Pontos ganhos na semana atual
    const pontosGanhos = f.executions.reduce((acc, exec) => acc + (exec.task?.points || 0), 0);

    // TOTAL POSSÍVEL: Soma (pontos da tarefa * dias que ela aparece na semana)
    const totalPossivelSemana = f.tasksAssigned.reduce((acc, tarefa) => {
      const diasArray = tarefa.diasSemana ? tarefa.diasSemana.split(",") : [];
      return acc + (tarefa.points * diasArray.length);
    }, 0);

    return {
      id: f.id,
      nome: f.name,
      pontos: pontosGanhos,
      // Se não houver tarefas, usamos 1 como fallback para não quebrar a barra de progresso (divisão por zero)
      totalSemana: totalPossivelSemana || 10, 
    };
  });

  // 4. Formatação das Tarefas para o Cliente
  const tarefasTratadas = tarefasNoBanco.map((t) => ({
    id: t.id,
    description: t.description,
    points: t.points,
    period: t.period, 
    diasSemana: t.diasSemana,
    assignedTo: t.assignedTo || [], 
    concluintesIds: t.executions.map(e => e.userId),
  }));

  // 5. Progresso do Dia (apenas o herói selecionado ou geral)
  const totalPossivelHoje = tarefasNoBanco.length;
  const realizadoHoje = tarefasNoBanco.filter(t => 
    userId ? t.executions.some(e => e.userId === userId) : t.executions.length > 0
  ).length;

  return (
    <DashboardClient 
      herois={herois} 
      tarefas={tarefasTratadas} 
      dataContexto={dataString}
      familyId={familyId}
      filhosBase={filhosNoBanco.map(f => ({ id: f.id, nome: f.name }))}
      userName={session.user.name}
      viewingUserId={userId}
      progressoDia={{
        realizado: realizadoHoje,
        total: totalPossivelHoje
      }}
    />
  );
}