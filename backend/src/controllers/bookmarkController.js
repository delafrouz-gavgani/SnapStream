const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function toggleBookmark(req, res) {
  const imageId = parseInt(req.params.id);
  const userId  = req.user.id;
  const key     = { imageId, userId };
  const existing = await prisma.bookmark.findUnique({ where: { imageId_userId: key } });
  if (existing) {
    await prisma.bookmark.delete({ where: { imageId_userId: key } });
    return res.json({ bookmarked: false });
  }
  await prisma.bookmark.create({ data: key });
  res.json({ bookmarked: true });
}

async function getBookmarks(req, res) {
  const userId = req.user.id;
  const rows = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      image: {
        select: {
          id: true, title: true, imageUrl: true, caption: true, location: true,
          creator: { select: { id: true, name: true } },
          _count: { select: { likes: true, comments: true, ratings: true } },
        },
      },
    },
  });
  res.json({ bookmarks: rows.map(b => b.image) });
}

module.exports = { toggleBookmark, getBookmarks };
