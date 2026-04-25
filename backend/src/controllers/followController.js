const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function toggleFollow(req, res) {
  const followingId = parseInt(req.params.creatorId);
  const followerId  = req.user.id;
  if (followerId === followingId) return res.status(400).json({ error: 'Cannot follow yourself' });
  const key = { followerId, followingId };
  const existing = await prisma.follow.findUnique({ where: { followerId_followingId: key } });
  if (existing) {
    await prisma.follow.delete({ where: { followerId_followingId: key } });
  } else {
    await prisma.follow.create({ data: key });
  }
  const followerCount = await prisma.follow.count({ where: { followingId } });
  res.json({ following: !existing, followerCount });
}

async function getFollowStatus(req, res) {
  const followingId = parseInt(req.params.creatorId);
  const followerId  = req.user.id;
  const key = { followerId, followingId };
  const existing = await prisma.follow.findUnique({ where: { followerId_followingId: key } });
  const followerCount = await prisma.follow.count({ where: { followingId } });
  res.json({ following: !!existing, followerCount });
}

module.exports = { toggleFollow, getFollowStatus };
