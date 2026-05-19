/**
 * @swagger
 * /api/listening/materials:
 *   get:
 *     summary: 获取听力素材列表
 *     tags: [听力训练]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 素材类型筛选（可选）
 *     responses:
 *       200:
 *         description: 返回素材列表
 *
 * /api/listening/material/{id}:
 *   get:
 *     summary: 获取单个听力素材及题目
 *     tags: [听力训练]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 返回素材详情和题目列表
 *       404:
 *         description: 素材不存在
 */

const express = require("express");
const router = express.Router(); //创建express路由实例
const { PrismaClient } = require("@prisma/client"); //导入prisma客户端
const prisma = new PrismaClient(); //创建prisma客户端实例
//查询所有/按类型筛选素材
router.get("/materials", async (req, res) => {
  try {
    const { type } = req.query;
    //数据库查询，查找所有listeningMaterial数据
    const materials = await prisma.listeningMaterial.findMany({
      //筛选条件:如果传了type，则根据type筛选，否则返回所有数据
      where: type ? { type } : {},
      //只返回需要的字段
      select: {
        id: true,
        title: true,
        type: true,
        level: true,
        audioUrl: true,
        duration: true,
      },
      //按id升序排序
      orderBy: { id: "asc" },
    });
    res.json(materials);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
//单个查询
router.get("/material/:id", async (req, res) => {
  try {
    const material = await prisma.listeningMaterial.findUnique({
      where: { id: parseInt(req.params.id) },
      //关联查询：同时把该素材对应的题目查出来
      include: { questions: true },
    });
    if (!material) {
      return res.status(404).json({ error: "not found" });
    }
    res.json(material);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
