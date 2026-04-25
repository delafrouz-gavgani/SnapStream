const { PrismaClient } = require('@prisma/client');
const cache = require('../utils/cache');
// const { uploadToAzure, deleteFromAzure } = require('../utils/azureStorage'); // Azure — uncomment when ready

const prisma = new PrismaClient();

const imageSelect = {
  id: true,
  title: true,
  caption: true,
  location: true,
  peoplePresent: true,
  imageUrl: true,
  storageKey: true,
  createdAt: true,
  creator: { select: { id: true, name: true } },
  _count: { select: { comments: true, ratings: true, likes: true } },
};

async function upload(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Image file is required' });
  const { title, caption, location, peoplePresent } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  // ---------------------------------------------------------------------------
  // LOCAL storage (active)
  // ---------------------------------------------------------------------------
  const storageKey = req.file.filename;
  const imageUrl = `/uploads/${storageKey}`;

  // ---------------------------------------------------------------------------
  // AZURE storage (commented — uncomment and remove the two lines above when ready)
  // req.file.buffer is available when upload middleware uses memoryStorage.
  // ---------------------------------------------------------------------------
  // const { blobName, url: imageUrl } = await uploadToAzure(
  //   req.file.buffer,
  //   req.file.originalname,
  //   req.file.mimetype
  // );
  // const storageKey = blobName;

  const image = await prisma.image.create({
    data: {
      creatorId: req.user.id,
      title,
      caption: caption || null,
      location: location || null,
      peoplePresent: peoplePresent || null,
      imageUrl,
      storageKey,
    },
    include: { creator: { select: { id: true, name: true } } },
  });

  cache.invalidate('images:');
  res.status(201).json(image);
}

async function getFeed(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const userId = req.user?.id;
  const cacheKey = `images:feed:${page}:${limit}`;

  if (!userId) {
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);
  }

  const [images, total] = await Promise.all([
    prisma.image.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        ...imageSelect,
        ...(userId ? {
          likes: { where: { userId }, select: { id: true } },
          bookmarks: { where: { userId }, select: { id: true } },
        } : {}),
      },
    }),
    prisma.image.count(),
  ]);

  const enriched = images.map(img => ({
    ...img,
    isLiked: img.likes ? img.likes.length > 0 : false,
    isBookmarked: img.bookmarks ? img.bookmarks.length > 0 : false,
    likes: undefined,
    bookmarks: undefined,
  }));

  const result = { images: enriched, total, page, pages: Math.ceil(total / limit) };
  if (!userId) cache.set(cacheKey, result);
  res.json(result);
}

async function search(req, res) {
  const q = req.query.q || '';
  if (!q.trim()) return res.json({ images: [] });

  const cacheKey = `images:search:${q}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const images = await prisma.image.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { caption: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { peoplePresent: { contains: q, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: imageSelect,
  });

  const result = { images };
  cache.set(cacheKey, result);
  res.json(result);
}

async function getOne(req, res) {
  const id = parseInt(req.params.id);
  const userId = req.user?.id;

  const image = await prisma.image.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
      ratings: { select: { ratingValue: true } },
      _count: { select: { likes: true } },
      ...(userId ? {
        likes:     { where: { userId }, select: { id: true } },
        bookmarks: { where: { userId }, select: { id: true } },
      } : {}),
    },
  });
  if (!image) return res.status(404).json({ error: 'Image not found' });

  const creatorId = image.creator?.id;
  const [followerCount, followRecord] = await Promise.all([
    prisma.follow.count({ where: { followingId: creatorId } }),
    (userId && creatorId && userId !== creatorId)
      ? prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userId, followingId: creatorId } } })
      : Promise.resolve(null),
  ]);

  const avgRating = image.ratings.length > 0
    ? image.ratings.reduce((s, r) => s + r.ratingValue, 0) / image.ratings.length
    : null;

  const result = {
    ...image,
    avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    likeCount:   image._count.likes,
    isLiked:     userId ? (image.likes?.length > 0)     : false,
    isBookmarked:userId ? (image.bookmarks?.length > 0) : false,
    isFollowing: !!followRecord,
    followerCount,
  };
  delete result.likes;
  delete result.bookmarks;
  res.json(result);
}

async function remove(req, res) {
  const id = parseInt(req.params.id);
  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) return res.status(404).json({ error: 'Image not found' });
  if (image.creatorId !== req.user.id) return res.status(403).json({ error: 'Not the owner' });

  await prisma.image.delete({ where: { id } });

  // Azure: delete the blob after removing from DB.
  // await deleteFromAzure(image.storageKey); // uncomment for Azure

  cache.invalidate('images:');
  res.json({ message: 'Image deleted' });
}

async function myImages(req, res) {
  const images = await prisma.image.findMany({
    where: { creatorId: req.user.id },
    orderBy: { createdAt: 'desc' },
    select: imageSelect,
  });
  res.json({ images });
}

module.exports = { upload, getFeed, search, getOne, remove, myImages };
