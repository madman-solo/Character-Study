const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("测试数据库连接...");

    // 测试查询角色
    const characters = await prisma.character.findMany();
    console.log(`✓ 成功查询到 ${characters.length} 个角色`);

    // 测试查询用户角色（应该为空）
    const userCharacters = await prisma.userCharacter.findMany();
    console.log(`✓ 用户角色表有 ${userCharacters.length} 条记录`);

    // 测试查询用户收藏（应该为空）
    const userFavorites = await prisma.userFavorite.findMany();
    console.log(`✓ 用户收藏表有 ${userFavorites.length} 条记录`);

    console.log("\n数据库测试成功！所有表都可以正常访问。");
  } catch (error) {
    console.error("数据库测试失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
