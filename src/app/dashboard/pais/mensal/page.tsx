import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExtratoMensalClient from "./ExtratoMensalClient";
import { 
  startOfMonth, 
  endOfMonth, 
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
  searchParams: Promise<{ userId?: string; mes?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PAI") redirect("/login");

  const params = await searchParams;
  const userId = params.userId;
  const mes = params.mes;
  const familyId = session.user.familyId;

  // 1. Busca os heróis (filhos)
  const filhos = await prisma.user.findMany({ 
    where: { familyId, role: "FILHO" },
    orderBy: { name: 'asc' }
  });

  // Redireciona para o primeiro filho se nenhum estiver selecionado
  if (!userId && filhos.length > 0) {
    redirect(`/dashboard/pais/mensal?userId=${filhos[0].id}`);
  }

  const filhoAtual = filhos.find(f => f.id === userId);

  // 2. Lógica de Calendário Rigorosa (Segunda a Domingo)
  const agora = new Date();
  const mesAlvo = mes ? parseInt(mes) : agora.getMonth();
  const primeiroDiaDoMes = startOfMonth(new Date(agora.getFullYear(), mesAlvo));
  const ultimoDiaDoMes = endOfMonth(primeiroDiaDoMes);

  // Forçamos o início na Segunda da primeira semana e fim no Domingo da última semana
  const dataBuscaInicio = startOfWeek(primeiroDiaDoMes, { weekStartsOn: 1 });
  const dataBuscaFim = endOfWeek(ultimoDiaDoMes, { weekStartsOn: 1 });

  // 3. Busca de Dados
  const [todasTarefas, execucoes] = await Promise.all([
    prisma.task.findMany({ 
      where: { familyId, assignedTo: { some: { id: userId } } } 
    }),
    prisma.taskExecution.findMany({
      where: {
        userId: userId,
        date: { gte: dataBuscaInicio, lte: dataBuscaFim },
      },
      include: { task: true },
    })
  ]);

  const extratoAgrupado: Record<string, any[]> = {};
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  // 4. Processamento dia a dia
  let d = new Date(dataBuscaInicio);

  while (isBefore(d, addDays(dataBuscaFim, 1))) {
    const dataAtualLoop = new Date(d);
    const diaSemanaInt = dataAtualLoop.getDay();
    
    // Criamos uma chave ÚNICA para a semana baseada na Segunda-feira dela
    // Isso garante que dias de meses diferentes que pertencem à mesma semana fiquem juntos
    const segundaFeiraDessaSemana = startOfWeek(dataAtualLoop, { weekStartsOn: 1 });
    const domingoDessaSemana = endOfWeek(dataAtualLoop, { weekStartsOn: 1 });
    
    // Label formatado: "14/04 a 20/04"
    const labelSemana = segundaFeiraDessaSemana.getTime().toString();

    if (!extratoAgrupado[labelSemana]) {
      extratoAgrupado[labelSemana] = [];
    }

    // Só processamos até hoje para não mostrar pendências no futuro
    if (isBefore(dataAtualLoop, hoje) || isSameDay(dataAtualLoop, hoje)) {
      const tarefasDoDia = todasTarefas.filter(t => 
        t.diasSemana.split(',').includes(diaSemanaInt.toString())
      );

      tarefasDoDia.forEach(tarefa => {
        const foiFeita = execucoes.find(e => 
          e.taskId === tarefa.id && isSameDay(new Date(e.date), dataAtualLoop)
        );

        extratoAgrupado[labelSemana].push({
          id: `${tarefa.id}-${format(dataAtualLoop, "yyyy-MM-dd")}`,
          description: tarefa.description,
          points: tarefa.points,
          date: dataAtualLoop,
          status: foiFeita ? 'CONCLUIDO' : 'NAO_FEITO'
        });
      });
    }
    
    d = addDays(d, 1);
  }

// 5. ORDENAÇÃO: Mais recente no topo com trava de segurança
  const chavesOrdenadas = Object.keys(extratoAgrupado).sort((a, b) => {
    // Pegamos as listas de tarefas de cada semana
    const listaA = extratoAgrupado[a];
    const listaB = extratoAgrupado[b];

    // Se uma semana estiver vazia, usamos uma data base bem antiga para ela ir para o fim
    const dataA = listaA.length > 0 ? new Date(listaA[0].date).getTime() : 0;
    const dataB = listaB.length > 0 ? new Date(listaB[0].date).getTime() : 0;

    return dataB - dataA;
  });

  const extratoFinal: Record<string, any[]> = {};
  
  chavesOrdenadas.forEach(key => {
    // Só adicionamos ao extrato final se a semana tiver tarefas (limpa semanas vazias)
    if (extratoAgrupado[key].length > 0) {
      extratoFinal[key] = extratoAgrupado[key].sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  });

  // Se o extrato final estiver totalmente vazio (nenhuma tarefa em nenhuma semana)
  // garantimos que o componente receba um objeto vazio em vez de quebrar
  return (
    <ExtratoMensalClient 
      filhos={filhos.map(f => ({ id: f.id, name: f.name }))} 
      extrato={extratoFinal} 
      userIdAtivo={userId}
      mesadaSalva={filhoAtual?.weeklyAllowance || 0}
      mesNome={format(primeiroDiaDoMes, "MMMM", { locale: ptBR })}
    />
  );

  return (
    <ExtratoMensalClient 
      filhos={filhos.map(f => ({ id: f.id, name: f.name }))} 
      extrato={extratoFinal} 
      userIdAtivo={userId}
      mesadaSalva={filhoAtual?.weeklyAllowance || 0}
      mesNome={format(primeiroDiaDoMes, "MMMM", { locale: ptBR })}
    />
  );
}