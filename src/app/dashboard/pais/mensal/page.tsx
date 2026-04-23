import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExtratoMensalClient from "./ExtratoMensalClient";

export default async function PaginaMensal({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; mes?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PAI") redirect("/login");

  const { userId, mes } = await searchParams;
  const familyId = session.user.familyId;

  // 1. Busca primeiro os filhos da família
  const filhos = await prisma.user.findMany({ 
    where: { familyId, role: "FILHO" } 
  });

  // 2. SE NÃO HOUVER USERID NA URL, REDIRECIONA PARA O PRIMEIRO FILHO
  // Isso evita que a página abra "vazia" ou "zerada"
  if (!userId && filhos.length > 0) {
    redirect(`/dashboard/pais/mensal?userId=${filhos[0].id}`);
  }

  const agora = new Date();
  const mesAtual = mes ? parseInt(mes) : agora.getMonth();
  const anoAtual = agora.getFullYear();

  const inicioMes = new Date(anoAtual, mesAtual, 1, 0, 0, 0);
  const fimMes = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59);

  // 3. Busca Tarefas e Execuções focadas no filho selecionado
  const [todasTarefas, execucoes] = await Promise.all([
    prisma.task.findMany({ 
      where: { 
        familyId, 
        assignedTo: { some: { id: userId } } // userId agora é garantido pelo redirect acima
      } 
    }),
    prisma.taskExecution.findMany({
      where: {
        userId: userId,
        date: { gte: inicioMes, lte: fimMes },
      },
      include: { task: true },
    })
  ]);

  const extratoPorSemana: any = {};
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const dataLimite = fimMes > hoje ? hoje : fimMes;

  let d = new Date(inicioMes);

  while (d <= dataLimite) {
    const dataAtualLoop = new Date(d);
    const diaSemana = dataAtualLoop.getDay().toString();
    
    const ano = dataAtualLoop.getFullYear();
    const mesFormat = String(dataAtualLoop.getMonth() + 1).padStart(2, '0');
    const diaFormat = String(dataAtualLoop.getDate()).padStart(2, '0');
    const dataChave = `${ano}-${mesFormat}-${diaFormat}`;

    const semana = Math.ceil(dataAtualLoop.getDate() / 7);

    if (!extratoPorSemana[semana]) extratoPorSemana[semana] = [];

    const tarefasDoDia = todasTarefas.filter(t => 
      t.diasSemana.split(',').includes(diaSemana)
    );

    tarefasDoDia.forEach(tarefa => {
      const foiFeita = execucoes.find(e => {
        const eAno = e.date.getFullYear();
        const eMes = String(e.date.getMonth() + 1).padStart(2, '0');
        const eDia = String(e.date.getDate()).padStart(2, '0');
        return e.taskId === tarefa.id && `${eAno}-${eMes}-${eDia}` === dataChave;
      });

      extratoPorSemana[semana].push({
        id: `${tarefa.id}-${dataChave}`,
        description: tarefa.description,
        points: tarefa.points,
        date: dataAtualLoop,
        status: foiFeita ? 'CONCLUIDO' : 'NAO_FEITO'
      });
    });

    d.setDate(d.getDate() + 1);
  }

  Object.keys(extratoPorSemana).forEach(semana => {
    extratoPorSemana[semana].sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
  });

  return (
    <ExtratoMensalClient 
      filhos={filhos} 
      extrato={extratoPorSemana} 
      userIdAtivo={userId}
      mesNome={inicioMes.toLocaleString('pt-BR', { month: 'long' })}
    />
  );
}