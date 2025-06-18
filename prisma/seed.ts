import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 シードデータの投入を開始します...");

  // 既存のデータをクリア
  await prisma.user.deleteMany();
  console.log("📝 既存のユーザーデータをクリアしました");

  // サンプルユーザーを作成
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "john.doe@example.com",
        name: "John Doe",
        password: "password",
      },
    }),
    prisma.user.create({
      data: {
        email: "jane.smith@example.com",
        name: "Jane Smith",
        password: "password",
      },
    }),
    prisma.user.create({
      data: {
        email: "bob.wilson@example.com",
        name: "Bob Wilson",
        password: "password",
      },
    }),
    prisma.user.create({
      data: {
        email: "alice.johnson@example.com",
        name: "Alice Johnson",
        password: "password",
      },
    }),
    prisma.user.create({
      data: {
        email: "charlie.brown@example.com",
        name: "Charlie Brown",
        password: "password",
      },
    }),
  ]);

  console.log(`✅ ${users.length}人のユーザーを作成しました:`);
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name} (${user.email})`);
  });

  console.log("🎉 シードデータの投入が完了しました！");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ シードデータの投入中にエラーが発生しました:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
