const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const { createAuthMiddleware, roleMiddleware } = require('../src/authMiddleware');

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const createSupabaseMock = ({ authResult, profileResult }) => ({
  auth: {
    getUser: async () => authResult
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => profileResult
      })
    })
  })
});

test('authMiddleware responde 401 sin token', async () => {
  const middleware = createAuthMiddleware(createSupabaseMock({}));
  const response = createResponse();

  await middleware({ headers: {} }, response, () => assert.fail('No debe continuar'));

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.status, 'error');
});

test('authMiddleware responde 401 con token invalido', async () => {
  const middleware = createAuthMiddleware(createSupabaseMock({
    authResult: { data: { user: null }, error: new Error('invalid token') }
  }));
  const response = createResponse();

  await middleware({ headers: { authorization: 'Bearer token-invalido' } }, response, () => assert.fail('No debe continuar'));

  assert.equal(response.statusCode, 401);
});

test('authMiddleware inyecta req.user cuando el token y el perfil son validos', async () => {
  const middleware = createAuthMiddleware(createSupabaseMock({
    authResult: { data: { user: { id: 'user-1', email: 'dt@example.com' } }, error: null },
    profileResult: {
      data: { id_usuario: 'user-1', nombre: 'Ana', rol_id: 2, estado_activo: true },
      error: null
    }
  }));
  const request = { headers: { authorization: 'Bearer token-valido' } };
  const response = createResponse();
  let continued = false;

  await middleware(request, response, () => { continued = true; });

  assert.equal(continued, true);
  assert.equal(request.user.id_usuario, 'user-1');
  assert.equal(request.user.rol, 'DT');
});

test('roleMiddleware responde 403 cuando el rol no esta permitido', () => {
  const middleware = roleMiddleware(['COORDINADOR']);
  const response = createResponse();

  middleware({ user: { rol_id: 2, rol: 'DT' } }, response, () => assert.fail('No debe continuar'));

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.status, 'error');
});

test('roleMiddleware permite un rol autorizado por ID', () => {
  const middleware = roleMiddleware([2]);
  const response = createResponse();
  let continued = false;

  middleware({ user: { rol_id: 2, rol: 'DT' } }, response, () => { continued = true; });

  assert.equal(continued, true);
  assert.equal(response.statusCode, 200);
});