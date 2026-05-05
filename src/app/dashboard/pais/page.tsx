import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

// Força o reprocessamento para evitar que datas antigas fiquem em cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // 1. Tratamento de Data com Fuso Horário Brasil
  const hojeBR = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const dataString = date || hojeBR.toISOString().split('T')[0];
  
  // Criamos a data de foco garantindo o meio-dia para evitar saltos de fuso
  const dataFoco = new Date(`${dataString}T12:00:00`);
  const diaDaSemana = dataFoco.getDay();

  // 2. A ÂNCORA: Trava o Placar Semanal entre Domingo e Sábado da data selecionada
  const inicioSemana = startOfWeek(dataFoco, { weekStartsOn: 0 }); // Sempre Domingo
  const fimSemana = endOfWeek(dataFoco, { weekStartsOn: 0 });    // Sempre Sábado

  const inicioDia = startOfDay(dataFoco);
  const fimDia = endOfDay(dataFoco);

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

  const herois = filhosNoBanco.map((f) => {
    const pontosGanhos = f.executions.reduce((acc, exec) => acc + (exec.task?.points || 0), 0);
    const totalPossivelSemana = f.tasksAssigned.reduce((acc, tarefa) => {
      const diasArray = tarefa.diasSemana ? tarefa.diasSemana.split(",") : [];
      return acc + (tarefa.points * diasArray.length);
    }, 0);

    return {
      id: f.id,
      nome: f.name,
      pontos: pontosGanhos,
      totalSemana: totalPossivelSemana || 10, 
    };
  });

  const tarefasTratadas = tarefasNoBanco.map((t) => ({
    id: t.id,
    description: t.description,
    points: t.points,
    period: t.period, 
    diasSemana: t.diasSemana,
    assignedTo: t.assignedTo || [], 
    concluintesIds: t.executions.map(e => e.userId),
  }));

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
        total: tarefasNoBanco.length
      }}
    />
  );
}