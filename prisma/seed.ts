import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const saltRounds = 10;
  const hashedPass = await bcrypt.hash("1455", saltRounds);

  // 1. Limpar o banco de dados (Cuidado: isto apaga tudo!)
  await prisma.taskExecution.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.family.deleteMany({});

  // 2. Criar a Família Gazzola
  const familia = await prisma.family.create({
    data: {
      name: "Família Gazzola",
    },
  })

  // 3. Criar os Pais (Usando a senha criptografada para o NextAuth funcionar)
  const pai = await prisma.user.create({
    data: {
      name: "Fabricio",
      email: "fabricio.gazzola@gmail.com",
      role: "PAI", // String pura
      password: hashedPass,
      familyId: familia.id,
    },
  })

  const mae = await prisma.user.create({
    data: {
      name: "Danieli",
      email: "danifsc@yahoo.com.br",
      role: "PAI",
      password: hashedPass,
      familyId: familia.id,
    },
  })

  // 4. Criar os Filhos
  const pedro = await prisma.user.create({
    data: {
      name: "Pedro",
      email: "pedro@email.com",
      role: "FILHO",
      password: hashedPass, // Também precisam de senha para login futuro
      familyId: familia.id,
    },
  })

  const gabriel = await prisma.user.create({
    data: {
      name: "Gabriel",
      email: "gabriel@email.com",
      role: "FILHO",
      password: hashedPass,
      familyId: familia.id,
    },
  })

  // 5. Criar Tarefas Iniciais
  await prisma.task.createMany({
    data: [
      { description: "Acordar no horário", points: 10, userId: pedro.id, familyId: familia.id },
      { description: "Arrumar a cama", points: 15, userId: pedro.id, familyId: familia.id },
      { description: "Escovar os dentes", points: 10, userId: pedro.id, familyId: familia.id },
      { description: "Bónus Calma - 0 Brigas", points: 20, userId: pedro.id, familyId: familia.id },
    ]
  })

  console.log("✅ Banco de dados populado com sucesso!")
  console.log(`👨‍👩‍👦 Família criada: ${familia.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })