import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExtratoMensalClient from "./ExtratoMensalClient";
import { 
  startOfWeek, 
  endOfWeek, 
  format, 
  addDays, 
  isSameDay,
  startOfDay 
} from "date-fns";
import { ptBR } from "date-fns/locale";

// Força o reprocessamento para evitar cache de datas antigas
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaginaMensal({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "PAI") redirect("/login");

  const params = await searchParams;
  const userId = params.userId;
  const familyId = session.user.familyId;

  const filhos = await prisma.user.findMany({ 
    where: { familyId, role: "FILHO" },
    orderBy: { name: 'asc' }
  });

  if (!userId && filhos.length > 0) {
    redirect(`/dashboard/pais/mensal?userId=${filhos[0].id}`);
  }

  const filhoAtual = filhos.find(f => f.id === userId);

  // --- CORREÇÃO DE FUSO HORÁRIO ---
  // Obtemos a data atual e forçamos o fuso de Brasília (America/Sao_Paulo)
  // Isso resolve o problema de mostrar dia 02 quando já é dia 03 no Brasil.
  const dataHojeBR = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const hoje = startOfDay(dataHojeBR); 
  
  // Define a semana começando no DOMINGO (weekStartsOn: 0)
  const dataBuscaInicio = startOfWeek(hoje, { weekStartsOn: 0 }); 
  const dataBuscaFim = endOfWeek(hoje, { weekStartsOn: 0 });

  const [todasTarefas, execucoes] = await Promise.all([
    prisma.task.findMany({ 
      where: { familyId, assignedTo: { some: { id: userId } } } 
    }),
    prisma.taskExecution.findMany({
      where: {
        userId: userId,
        date: { 
          gte: dataBuscaInicio, 
          lte: dataBuscaFim 
        },
      }
    })
  ]);

  const extratoFinal: Record<string, any[]> = {};
  const labelSemana = dataBuscaInicio.getTime().toString();
  extratoFinal[labelSemana] = [];

  // Montar os 7 dias da semana (Domingo a Sábado)
  let d = new Date(dataBuscaInicio);

  for (let i = 0; i < 7; i++) {
    const dataAtualLoop = startOfDay(new Date(d));
    const diaSemanaInt = dataAtualLoop.getDay(); 

    const tarefasDoDia = todasTarefas.filter(t => 
      t.diasSemana?.split(',').includes(diaSemanaInt.toString())
    );

    tarefasDoDia.forEach(tarefa => {
      const foiFeita = execucoes.find(e => 
        e.taskId === tarefa.id && isSameDay(new Date(e.date), dataAtualLoop)
      );

      extratoFinal[labelSemana].push({
        id: `${tarefa.id}-${format(dataAtualLoop, "yyyy-MM-dd")}`,
        description: tarefa.description,
        points: tarefa.points,
        date: dataAtualLoop.toISOString(),
        status: foiFeita ? 'CONCLUIDO' : 'NAO_FEITO'
      });
    });
    
    d = addDays(d, 1);
  }

  extratoFinal[labelSemana].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <ExtratoMensalClient 
      filhos={filhos.map(f => ({ id: f.id, name: f.name }))} 
      extrato={extratoFinal} 
      userIdAtivo={userId}
      mesadaSalva={filhoAtual?.weeklyAllowance || 0}
      mesNome={format(hoje, "MMMM", { locale: ptBR })}
    />
  );
}