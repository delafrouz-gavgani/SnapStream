const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function toggleLike(req, res) {
  const imageId = parseInt(req.params.id);
  const userId  = req.user.id;
  const key     = { imageId, userId };
  const existing = await prisma.like.findUnique({ where: { imageId_userId: key } });
  if (existing) {
    await prisma.like.delete({ where: { imageId_userId: key } });
  } else {
    await prisma.like.create({ data: key });
  }
  const likeCount = await prisma.like.count({ where: { imageId } });
  res.json({ liked: !existing, likeCount });
}

module.exports = { toggleLike };
