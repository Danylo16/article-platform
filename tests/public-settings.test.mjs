import assert from 'node:assert/strict';
import { test } from 'node:test';
import Fastify from 'fastify';

process.env.DATABASE_URL ??= 'postgresql://test:test@127.0.0.1:5434/test';
const { prisma } = await import('../apps/api/src/lib/prisma.ts');
const { publicSettingsRoutes, adminPublicSettingsRoutes } = await import('../apps/api/src/modules/public-settings/public-settings.routes.ts');

test('settings routes validate input and expose the persisted toggle (repository stub)', async () => {
  let value = true;
  const read = prisma.publicSettings.findUnique;
  const write = prisma.publicSettings.upsert;
  prisma.publicSettings.findUnique = async () => ({ id: 'site', categoriesEnabled: value });
  prisma.publicSettings.upsert = async ({ update }) => {
    value = update.categoriesEnabled;
    return { id: 'site', categoriesEnabled: value };
  };
  const app = Fastify();
  try {
    await app.register(publicSettingsRoutes, { prefix: '/public-settings' });
    await app.register(adminPublicSettingsRoutes, { prefix: '/admin/public-settings' });
    for (const payload of [{ categoriesEnabled: 'false' }, { categoriesEnabled: false, extra: true }, {}]) {
      assert.equal((await app.inject({ method: 'PATCH', url: '/admin/public-settings', payload })).statusCode, 400);
    }
    assert.equal(value, true);
    for (const enabled of [false, true]) {
      const saved = await app.inject({ method: 'PATCH', url: '/admin/public-settings', payload: { categoriesEnabled: enabled } });
      assert.equal(saved.statusCode, 200);
      const result = await app.inject('/public-settings');
      assert.deepEqual(result.json(), { categoriesEnabled: enabled });
      assert.equal(result.headers['cache-control'], 'no-store');
    }
  } finally {
    await app.close();
    prisma.publicSettings.findUnique = read;
    prisma.publicSettings.upsert = write;
    await prisma.$disconnect();
  }
});
