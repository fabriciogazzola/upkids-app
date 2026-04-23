import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ListaMissoesFilho from "./ListaMissoesFilho";
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";

export default async function DashboardFilho() {
  const session = await getServerSession(authOptions);
  
  if (!session) redirect("/login");
  if (session.user.role === "PAI") redirect("/dashboard/pais");

  const userId = session.user.id;
  const familyId = session.user.familyId;
  const hoje = new Date();
  const diaSemana = hoje.getDay().toString();
  const dataString = hoje.toISOString().split('T')[0];

  // Datas para o placar da semana (Segunda a Domingo)
  const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 });
  const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 });

  // 1. Busca de Dados: Tarefas do dia + Placar da Família
  const [tarefasNoBanco, filhosNoBanco] = await Promise.all([
    // Tarefas do dia do Gabriel
    prisma.task.findMany({
      where: {
        assignedTo: { some: { id: userId } },
        diasSemana: { contains: diaSemana }
      },
      include: {
        executions: {
          where: {
            userId: userId,
            date: {
              gte: startOfDay(hoje),
              lte: endOfDay(hoje)
            }
          }
        }
      }
    }),
    // Todos os heróis da família para o Ranking
    prisma.user.findMany({
      where: { familyId, role: "FILHO" },
      include: { 
        tasksAssigned: true, 
        executions: {
          where: { date: { gte: inicioSemana, lte: fimSemana } },
          include: { task: true }
        } 
      },
    })
  ]);

  // 2. Formatação das Missões do Dia
  const tarefasTratadas = tarefasNoBanco.map(t => ({
    id: t.id,
    description: t.description,
    points: t.points,
    period: t.period,
    diasSemana: t.diasSemana,
    concluido: t.executions.length > 0
  }));

  // 3. Formatação do Placar da Semana (Ranking)
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

  const realizado = tarefasTratadas.filter(t => t.concluido).reduce((acc, t) => acc + t.points, 0);
  const total = tarefasTratadas.reduce((acc, t) => acc + t.points, 0);

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Agora passamos os 'herois' para o componente de lista exibir o ranking */}
        <ListaMissoesFilho 
          tarefas={tarefasTratadas} 
          nomeFilho={session.user.name}
          progressoDia={{ realizado, total }}
          herois={herois} 
          userId={userId}
        />
        
      </div>
    </main>
  );
}