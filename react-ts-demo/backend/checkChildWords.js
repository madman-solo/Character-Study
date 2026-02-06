const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkChildWords() {
  try {
    const count = await prisma.childWord.count();
    console.log('ChildWord总数:', count);

    if (count > 0) {
      const samples = await prisma.childWord.findMany({ take: 5 });
      console.log('前5个单词:', JSON.stringify(samples, null, 2));
    }
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkChildWords();
