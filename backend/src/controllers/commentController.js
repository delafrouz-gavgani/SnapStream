const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addComment(req, res) {
  const imageId = parseInt(req.params.id);
  const { commentText } = req.body;

  if (!commentText || !commentText.trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image) return res.status(404).json({ error: 'Image not found' });

  const comment = await prisma.comment.create({
    data: { imageId, userId: req.user.id, commentText: commentText.trim() },
    include: { user: { select: { id: true, name: true } } },
  });

  res.status(201).json(comment);
}

module.exports = { addComment };
