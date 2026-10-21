import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.DATABASE_URL ??= 'postgresql://test:test@127.0.0.1:5434/test';
const { prisma } = await import('../apps/api/src/lib/prisma.ts');
const { buildApp } = await import('../apps/api/src/app.ts');
const { getPublicPlaces } = await import('../apps/api/src/modules/places/place.service.ts');
test('readiness fails closed; unauthenticated CMS is rejected; places need no article (repository stubs)', async () => {
 const originalQuery = prisma.$queryRaw;
 const originalFind = prisma.place.findMany;
 const app = await buildApp();
 try {
  prisma.$queryRaw = async () => [{value:1}];
  assert.equal((await app.inject('/ready')).statusCode,200);
  prisma.$queryRaw = async () => {throw new Error('database unavailable');};
  assert.equal((await app.inject('/ready')).statusCode,503);
  assert.equal((await app.inject('/admin/articles')).statusCode,401);
  let received;
  prisma.place.findMany = async args => {received=args; return [];};
  await getPublicPlaces();
  assert.deepEqual(received.where,{isVisible:true,type:{isVisible:true}});
  assert.equal(received.include.articles.where.status,'PUBLISHED');
 } finally {prisma.$queryRaw=originalQuery; prisma.place.findMany=originalFind; await app.close(); await prisma.$disconnect();}
});
