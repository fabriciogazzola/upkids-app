import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ListaMissoesFilho from "./ListaMissoesFilho";

export default async function DashboardFilho() {
  const session = await getServerSession(authOptions);
  
  if (!session) redirect("/login");
  
  // Se o Pai tentar entrar na tela do filho, manda ele de volta para a tela de gestão
  if (session.user.role === "PAI") redirect("/dashboard/pais");

  const userId = session.user.id;
  const hoje = new Date();
  const diaSemana = hoje.getDay().toString();
  const dataString = hoje.toISOString().split('T')[0];

  // Busca apenas as tarefas do Gabriel
  const tarefasNoBanco = await prisma.task.findMany({
    where: {
      assignedTo: { some: { id: userId } },
      diasSemana: { contains: diaSemana }
    },
    include: {
      executions: {
        where: {
          userId: userId,
          date: {
            gte: new Date(`${dataString}T00:00:00Z`),
            lte: new Date(`${dataString}T23:59:59Z`)
          }
        }
      }
    }
  });

  const tarefasTratadas = tarefasNoBanco.map(t => ({
    id: t.id,
    description: t.description,
    points: t.points,
    diasSemana: t.diasSemana,
    concluido: t.executions.length > 0
  }));

  const realizado = tarefasTratadas.filter(t => t.concluido).reduce((acc, t) => acc + t.points, 0);
  const total = tarefasTratadas.reduce((acc, t) => acc + t.points, 0);

  return (
    <main className="min-h-screen bg-blue-50 p-4 md:p-10">
      <div className="max-w-2xl mx-auto">
        <ListaMissoesFilho 
          tarefas={tarefasTratadas} 
          nomeFilho={session.user.name}
          progressoDia={{ realizado, total }}
        />
      </div>
    </main>
  );
}