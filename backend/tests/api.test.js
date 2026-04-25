const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
let creatorToken, consumerToken, creatorId, consumerId;

beforeAll(async () => {
  // Clean test data
  await prisma.rating.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: ['testcreator@test.com', 'testconsumer@test.com'] } } });

  const hash = (pw) => bcrypt.hash(pw, 10);

  const creator = await prisma.user.create({
    data: { name: 'Test Creator', email: 'testcreator@test.com', passwordHash: await hash('password123'), role: 'creator' },
  });
  const consumer = await prisma.user.create({
    data: { name: 'Test Consumer', email: 'testconsumer@test.com', passwordHash: await hash('password123'), role: 'consumer' },
  });

  creatorId = creator.id;
  consumerId = consumer.id;
});

afterAll(async () => {
  await prisma.rating.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: ['testcreator@test.com', 'testconsumer@test.com'] } } });
  await prisma.$disconnect();
});

// 1. User login
test('1. Creator can log in', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'testcreator@test.com', password: 'password123' });
  expect(res.status).toBe(200);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.role).toBe('creator');
  creatorToken = res.body.token;
});

// 2. Consumer registration
test('2. Consumer can register', async () => {
  await prisma.user.deleteMany({ where: { email: 'newconsumer@test.com' } });
  const res = await request(app).post('/api/auth/register').send({ name: 'New Consumer', email: 'newconsumer@test.com', password: 'password123' });
  expect(res.status).toBe(201);
  expect(res.body.user.role).toBe('consumer');
  await prisma.user.deleteMany({ where: { email: 'newconsumer@test.com' } });
});

// Consumer login for subsequent tests
test('2b. Consumer can log in', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'testconsumer@test.com', password: 'password123' });
  expect(res.status).toBe(200);
  consumerToken = res.body.token;
});

// 4. Consumer cannot upload image
test('4. Consumer cannot upload image', async () => {
  const res = await request(app)
    .post('/api/images')
    .set('Authorization', `Bearer ${consumerToken}`)
    .field('title', 'Forbidden Upload');
  expect(res.status).toBe(403);
});

// 8. Unauthenticated user cannot upload
test('8. Unauthenticated user cannot access upload route', async () => {
  const res = await request(app).post('/api/images').field('title', 'No Auth Upload');
  expect(res.status).toBe(401);
});

// 7. Search works (even with no results)
test('7. Search images works', async () => {
  const res = await request(app).get('/api/images/search?q=testuniquetitlexyz');
  expect(res.status).toBe(200);
  expect(res.body.images).toBeDefined();
  expect(Array.isArray(res.body.images)).toBe(true);
});

// 3. Creator can upload image (requires file - mocked with text)
test('3. Creator can upload image', async () => {
  const res = await request(app)
    .post('/api/images')
    .set('Authorization', `Bearer ${creatorToken}`)
    .attach('image', Buffer.from('fake-image-content'), { filename: 'test.jpg', contentType: 'image/jpeg' })
    .field('title', 'Test Image')
    .field('caption', 'A test caption')
    .field('location', 'London')
    .field('peoplePresent', 'Alice');

  expect(res.status).toBe(201);
  expect(res.body.title).toBe('Test Image');
  global.testImageId = res.body.id;
});

// 5. Consumer can comment
test('5. Consumer can comment on image', async () => {
  if (!global.testImageId) return;
  const res = await request(app)
    .post(`/api/images/${global.testImageId}/comments`)
    .set('Authorization', `Bearer ${consumerToken}`)
    .send({ commentText: 'Great photo!' });
  expect(res.status).toBe(201);
  expect(res.body.commentText).toBe('Great photo!');
});

// 6. Consumer can rate
test('6. Consumer can rate image', async () => {
  if (!global.testImageId) return;
  const res = await request(app)
    .post(`/api/images/${global.testImageId}/ratings`)
    .set('Authorization', `Bearer ${consumerToken}`)
    .send({ ratingValue: 5 });
  expect(res.status).toBe(200);
  expect(res.body.ratingValue).toBe(5);
});
