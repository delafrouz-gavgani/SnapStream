const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getProfile(req, res) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          images: true,
          likes: true,
          bookmarks: true,
          following: true,
          followers: true,
          comments: true,
        },
      },
    },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  let likesReceived = 0;
  if (user.role === 'creator') {
    likesReceived = await prisma.like.count({
      where: { image: { creatorId: userId } },
    });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    stats: {
      posts: user._count.images,
      likesGiven: user._count.likes,
      likesReceived,
      bookmarks: user._count.bookmarks,
      following: user._count.following,
      followers: user._count.followers,
      comments: user._count.comments,
    },
  });
}

module.exports = { getProfile };
