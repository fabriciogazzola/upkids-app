import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const saltRounds = 10;
  const hashedPass = await bcrypt.hash("1455", saltRounds);

  console.log("🧹 Limpando banco de dados...");
  await prisma.taskExecution.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.family.deleteMany({});

  // 1. Criar a Família
  const familia = await prisma.family.create({
    data: { name: "Família Gazzola" },
  })

  // 2. Criar os Pais
  await prisma.user.createMany({
    data: [
      { name: "Fabricio", email: "fabricio.gazzola@gmail.com", role: "PAI", password: hashedPass, familyId: familia.id },
      { name: "Danieli", email: "danifsc@yahoo.com.br", role: "PAI", password: hashedPass, familyId: familia.id },
    ]
  })

  // 3. Criar os Filhos (criamos individualmente para capturar os IDs)
  const pedro = await prisma.user.create({
    data: {
      name: "Pedro",
      email: "pedro@email.com",
      role: "FILHO",
      password: hashedPass,
      familyId: familia.id,
      weeklyAllowance: 50.00 // Definindo uma mesada inicial
    },
  })

  const gabriel = await prisma.user.create({
    data: {
      name: "Gabriel",
      email: "gabriel@email.com",
      role: "FILHO",
      password: hashedPass,
      familyId: familia.id,
      weeklyAllowance: 40.00
    },
  })

  // 4. Lista de missões para os heróis
  const missoes = [
    { description: "Acordar no horário e arrumar a cama", points: 10, period: "MANHA" },
    { description: "Escovar os dentes e se vestir", points: 5, period: "MANHA" },
    { description: "Almoçar tudo (sem enrolar)", points: 10, period: "TARDE" },
    { description: "Fazer o dever de casa", points: 20, period: "TARDE" },
    { description: "Guardar os brinquedos", points: 15, period: "NOITE" },
    { description: "Banho e pijama", points: 10, period: "NOITE" },
  ]

  console.log("🚀 Criando missões e vinculando aos heróis...");

  for (const m of missoes) {
    await prisma.task.create({
      data: {
        description: m.description,
        points: m.points,
        period: m.period,
        familyId: familia.id,
        diasSemana: "1,2,3,4,5,6,0", // Todos os dias da semana
        assignedTo: {
          connect: [
            { id: pedro.id },
            { id: gabriel.id }
          ]
        }
      }
    })
  }

  console.log("✅ Banco de dados populado com sucesso!");
  console.log(`👨‍👩‍👦 Família: ${familia.name}`);
  console.log(`👦 Heróis prontos: Pedro e Gabriel`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })