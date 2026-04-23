import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Buscando usuários no banco...");

  // Busca os usuários existentes para vincular as tarefas
  const pedro = await prisma.user.findFirst({ where: { name: "Pedro" } });
  const gabriel = await prisma.user.findFirst({ where: { name: "Gabriel" } });

  if (!pedro || !gabriel) {
    console.error("❌ Erro: Pedro ou Gabriel não encontrados. Rode o seed principal primeiro.");
    return;
  }

  const familyId = pedro.familyId; // Pega o ID da família do Pedro

  console.log("🧹 Removendo tarefas antigas (opcional)...");
  await prisma.taskExecution.deleteMany({ where: { userId: { in: [pedro.id, gabriel.id] } } });
  await prisma.task.deleteMany({ where: { familyId } });

  const tarefasParaCriar = [
    // 10 Tarefas para o Pedro
    { description: "Organizar material escolar", points: 15, dias: "0", kids: [pedro.id] },
    { description: "Lavar o tênis", points: 30, dias: "6", kids: [pedro.id] },
    { description: "Praticar instrumento/estudo", points: 20, dias: "1,3,5", kids: [pedro.id] },
    { description: "Ajudar a guardar as compras", points: 10, dias: "2,4,6", kids: [pedro.id] },
    { description: "Tomar banho sem reclamar", points: 10, dias: "1,2,3,4,5,6,0", kids: [pedro.id] },
    { description: "Colocar comida para o pet", points: 5, dias: "1,2,3,4,5,6,0", kids: [pedro.id] },
    { description: "Apagar as luzes ao sair", points: 5, dias: "1,2,3,4,5,6,0", kids: [pedro.id] },
    { description: "Arrumar a mesa do jantar", points: 10, dias: "1,2,3,4,5,6,0", kids: [pedro.id] },
    { description: "Dormir antes das 22h", points: 20, dias: "1,2,3,4,5", kids: [pedro.id] },
    { description: "Não gritar dentro de casa", points: 15, dias: "1,2,3,4,5,6,0", kids: [pedro.id] },

    // 10 Tarefas para o Gabriel
    { description: "Recolher brinquedos da sala", points: 15, dias: "1,2,3,4,5,6,0", kids: [gabriel.id] },
    { description: "Comer toda a fruta", points: 10, dias: "1,2,3,4,5,6,0", kids: [gabriel.id] },
    { description: "Guardar os sapatos no armário", points: 5, dias: "1,2,3,4,5,6,0", kids: [gabriel.id] },
    { description: "Ajudar a regar as plantas", points: 10, dias: "2,4,0", kids: [gabriel.id] },
    { description: "Fazer o dever de casa", points: 25, dias: "1,2,3,4,5", kids: [gabriel.id] },
    { description: "Secar a louça (itens de plástico)", points: 10, dias: "3,5,6", kids: [gabriel.id] },
    { description: "Limpar a mesa após o lanche", points: 10, dias: "1,2,3,4,5,6,0", kids: [gabriel.id] },
    { description: "Colocar o pijama sozinho", points: 10, dias: "1,2,3,4,5,6,0", kids: [gabriel.id] },
    { description: "Organizar as almofadas do sofá", points: 5, dias: "6,0", kids: [gabriel.id] },
    { description: "Levar o lixo do banheiro", points: 15, dias: "3,6", kids: [gabriel.id] },
  ];

  console.log("📝 Injetando tarefas...");

  for (const t of tarefasParaCriar) {
    const task = await prisma.task.create({
      data: {
        description: t.description,
        points: t.points,
        diasSemana: t.dias,
        familyId: familyId!,
        assignedTo: { connect: t.kids.map(id => ({ id })) }
      }
    });

    // Criar algumas execuções aleatórias para hoje (22/04/2026) e ontem (21/04/2026)
    for (const kidId of t.kids) {
      if (Math.random() > 0.4) {
        await prisma.taskExecution.create({
          data: {
            taskId: task.id,
            userId: kidId,
            date: new Date("2026-04-22T12:00:00Z")
          }
        });
      }
      if (Math.random() > 0.6) {
        await prisma.taskExecution.create({
          data: {
            taskId: task.id,
            userId: kidId,
            date: new Date("2026-04-21T12:00:00Z")
          }
        });
      }
    }
  }

  console.log("✅ Tarefas injetadas com sucesso!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });