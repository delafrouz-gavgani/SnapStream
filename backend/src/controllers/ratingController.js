const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertRating(req, res) {
  const imageId = parseInt(req.params.id);
  const { ratingValue } = req.body;

  if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ error: 'ratingValue must be between 1 and 5' });
  }

  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image) return res.status(404).json({ error: 'Image not found' });

  const rating = await prisma.rating.upsert({
    where: { imageId_userId: { imageId, userId: req.user.id } },
    update: { ratingValue: parseInt(ratingValue) },
    create: { imageId, userId: req.user.id, ratingValue: parseInt(ratingValue) },
  });

  res.json(rating);
}

module.exports = { upsertRating };
