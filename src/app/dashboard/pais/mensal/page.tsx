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
  isBefore, 
  isSameDay 
} from "date-fns";
import { ptBR } from "date-fns/locale";

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

  // 1. Busca os heróis (filhos)
  const filhos = await prisma.user.findMany({ 
    where: { familyId, role: "FILHO" },
    orderBy: { name: 'asc' }
  });

  // Garante que temos um userId selecionado
  if (!userId && filhos.length > 0) {
    redirect(`/dashboard/pais/mensal?userId=${filhos[0].id}`);
  }

  const filhoAtual = filhos.find(f => f.id === userId);

  // 2. Definir EXATAMENTE a semana vigente (Segunda a Domingo)
  const hoje = new Date();
  const dataBuscaInicio = startOfWeek(hoje, { weekStartsOn: 1 }); // Segunda
  const dataBuscaFim = endOfWeek(hoje, { weekStartsOn: 1 });    // Domingo

  // 3. Busca as tarefas e as execuções apenas desta semana
  const [todasTarefas, execucoes] = await Promise.all([
    prisma.task.findMany({ 
      where: { familyId, assignedTo: { some: { id: userId } } } 
    }),
    prisma.taskExecution.findMany({
      where: {
        userId: userId,
        date: { gte: dataBuscaInicio, lte: dataBuscaFim },
      }
    })
  ]);

  const extratoFinal: Record<string, any[]> = {};
  const labelSemana = dataBuscaInicio.getTime().toString();
  extratoFinal[labelSemana] = [];

  // 4. Montar os 7 dias da semana (Projeção Completa)
  let d = new Date(dataBuscaInicio);

  for (let i = 0; i < 7; i++) {
    const dataAtualLoop = new Date(d);
    const diaSemanaInt = dataAtualLoop.getDay(); // 0 (Dom) a 6 (Sab)

    // Filtra tarefas que devem acontecer neste dia da semana
    const tarefasDoDia = todasTarefas.filter(t => 
      t.diasSemana.split(',').includes(diaSemanaInt.toString())
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

  // 5. Ordenar tarefas do dia (da mais antiga para a mais nova na semana)
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