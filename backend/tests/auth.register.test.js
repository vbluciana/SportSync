const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/config/supabaseClient', () => {
  let mockSingleResult = null;
  let mockSelectResult = null;
  let mockInsertResult = null;
  let mockFromResult = null;

  const mockSingle = jest.fn(() => Promise.resolve(mockSingleResult));
  const mockSelect = jest.fn(() => ({ single: mockSingle }));
  const mockInsert = jest.fn(() => ({ select: mockSelect }));
  const mockFrom = jest.fn(() => ({ insert: mockInsert }));

  const setMockResults = (fromResult, insertResult, selectResult, singleResult) => {
    mockFromResult = fromResult;
    mockInsertResult = insertResult;
    mockSelectResult = selectResult;
    mockSingleResult = singleResult;
  };

  return {
    supabase: {
      auth: {
        admin: {
          createUser: jest.fn(),
          deleteUser: jest.fn(),
        },
        signUp: jest.fn(),
      },
      from: mockFrom,
      _mocks: {
        mockFrom,
        mockInsert,
        mockSelect,
        mockSingle,
        setMockResults,
      },
    },
  };
});

const { supabase } = require('../src/config/supabaseClient');

describe('POST /api/auth/register - Auto-registro de Jugadores', () => {
  const validPayload = {
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    email: 'juan.perez@test.com',
    password: 'Password123',
    telefono: '3511234567',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    supabase._mocks.setMockResults(null, null, null, null);
  });

  const setupSuccessMocks = (mockUser, usuarioData) => {
    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    supabase._mocks.setMockResults(
      { insert: supabase._mocks.mockInsert },
      { select: supabase._mocks.mockSelect },
      { single: supabase._mocks.mockSingle },
      { data: usuarioData, error: null }
    );
  };

  const setupDuplicateMocks = (mockUser, error) => {
    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    supabase._mocks.setMockResults(
      { insert: supabase._mocks.mockInsert },
      { select: supabase._mocks.mockSelect },
      { single: supabase._mocks.mockSingle },
      { data: null, error }
    );
  };

  const setupAuthErrorMocks = (error) => {
    supabase.auth.admin.createUser.mockResolvedValue({
      data: null,
      error,
    });
  };

  const setupDbErrorMocks = (mockUser, error) => {
    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    supabase._mocks.setMockResults(
      { insert: supabase._mocks.mockInsert },
      { select: supabase._mocks.mockSelect },
      { single: supabase._mocks.mockSingle },
      { data: null, error }
    );
  };

  describe('Registro exitoso', () => {
    it('debe retornar HTTP 201 con datos válidos y forzar rol_id = 4 (Jugador)', async () => {
      const mockUser = {
        id: 'test-user-uuid',
        email: validPayload.email,
        user_metadata: { rol_sistema: 'Jugador' },
      };

      const usuarioData = { ...validPayload, id_usuario: mockUser.id, rol_id: 4, estado_activo: true };
      setupSuccessMocks(mockUser, usuarioData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.usuario).toBeDefined();
      expect(response.body.usuario.rol_id).toBe(4);
      expect(response.body.usuario.estado_activo).toBe(true);
      expect(response.body.usuario.email).toBe(validPayload.email);
      expect(response.body.usuario.dni).toBe(validPayload.dni);

      expect(supabase.auth.admin.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validPayload.email,
          password: validPayload.password,
          email_confirm: true,
        })
      );

      expect(supabase._mocks.mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id_usuario: mockUser.id,
          rol_id: 4,
          estado_activo: true,
          nombre: validPayload.nombre,
          apellido: validPayload.apellido,
          dni: validPayload.dni,
          email: validPayload.email,
          telefono: validPayload.telefono,
        })
      );
    });
  });

  describe('Prevención de escalada de privilegios (Fail-Fast)', () => {
    it('debe ignorar rol_id enviado en el body y forzar rol_id = 4', async () => {
      const payloadWithRole = { ...validPayload, rol_id: 1, email: 'test2@test.com', dni: '87654321' };
      const mockUser = { id: 'test-user-uuid-2', email: payloadWithRole.email };
      const usuarioData = { ...payloadWithRole, id_usuario: mockUser.id, rol_id: 4, estado_activo: true };
      setupSuccessMocks(mockUser, usuarioData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadWithRole)
        .expect(201);

      expect(response.body.usuario.rol_id).toBe(4);
      expect(supabase._mocks.mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ rol_id: 4 })
      );
      expect(supabase._mocks.mockInsert).not.toHaveBeenCalledWith(
        expect.objectContaining({ rol_id: 1 })
      );
    });

    it('debe ignorar campo rol string enviado en el body y forzar rol_id = 4', async () => {
      const payloadWithRoleString = { ...validPayload, rol: 'Coordinador', email: 'test3@test.com', dni: '11223344' };
      const mockUser = { id: 'test-user-uuid-3', email: payloadWithRoleString.email };
      const usuarioData = { ...payloadWithRoleString, id_usuario: mockUser.id, rol_id: 4, estado_activo: true };
      setupSuccessMocks(mockUser, usuarioData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadWithRoleString)
        .expect(201);

      expect(response.body.usuario.rol_id).toBe(4);
      expect(supabase._mocks.mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ rol_id: 4 })
      );
    });

    it('debe ignorar campo rol_sistema enviado en el body y forzar rol_id = 4', async () => {
      const payloadWithRoleSistema = { ...validPayload, rol_sistema: 'Director Técnico', email: 'test4@test.com', dni: '44332211' };
      const mockUser = { id: 'test-user-uuid-4', email: payloadWithRoleSistema.email };
      const usuarioData = { ...payloadWithRoleSistema, id_usuario: mockUser.id, rol_id: 4, estado_activo: true };
      setupSuccessMocks(mockUser, usuarioData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadWithRoleSistema)
        .expect(201);

      expect(response.body.usuario.rol_id).toBe(4);
      expect(supabase._mocks.mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ rol_id: 4 })
      );
    });
  });

  describe('Colisión por Email o DNI duplicado', () => {
    it('debe retornar HTTP 409 cuando el email ya existe (código 23505)', async () => {
      const mockUser = { id: 'test-user-uuid-5', email: validPayload.email };
      const error = { code: '23505', message: 'duplicate key value violates unique constraint "usuarios_email_key"' };
      setupDuplicateMocks(mockUser, error);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toBe('Ya existe una cuenta registrada con este email');
    });

    it('debe retornar HTTP 409 cuando el DNI ya existe (código 23505)', async () => {
      const payloadWithUniqueEmail = { ...validPayload, email: 'unique@test.com' };
      const mockUser = { id: 'test-user-uuid-6', email: payloadWithUniqueEmail.email };
      const error = { code: '23505', message: 'duplicate key value violates unique constraint "usuarios_dni_key"' };
      setupDuplicateMocks(mockUser, error);

      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadWithUniqueEmail)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toBe('Ya existe una cuenta registrada con este DNI');
    });

    it('debe retornar HTTP 409 cuando Supabase Auth indica que el email ya está registrado', async () => {
      setupAuthErrorMocks({ message: 'User already registered', status: 400 });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toBe('El Email o DNI ya se encuentra registrado');
    });
  });

  describe('Payload incompleto - Validación de entrada', () => {
    it('debe retornar HTTP 400 cuando falta el nombre', async () => {
      const { nombre, ...payloadSinNombre } = validPayload;
      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadSinNombre)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toContain('nombre');
    });

    it('debe retornar HTTP 400 cuando falta el apellido', async () => {
      const { apellido, ...payloadSinApellido } = validPayload;
      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadSinApellido)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toContain('apellido');
    });

    it('debe retornar HTTP 400 cuando falta el DNI', async () => {
      const { dni, ...payloadSinDni } = validPayload;
      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadSinDni)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toContain('DNI');
    });

    it('debe retornar HTTP 400 cuando falta el email', async () => {
      const { email, ...payloadSinEmail } = validPayload;
      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadSinEmail)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toContain('email');
    });

    it('debe retornar HTTP 400 cuando falta la contraseña', async () => {
      const { password, ...payloadSinPassword } = validPayload;
      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadSinPassword)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toContain('contraseña');
    });

    it('debe retornar HTTP 400 cuando el body está vacío', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('debe retornar HTTP 400 cuando el email tiene formato inválido', async () => {
      const payloadEmailInvalido = { ...validPayload, email: 'email-invalido' };
      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadEmailInvalido)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toContain('email');
    });

    it('debe retornar HTTP 400 cuando la contraseña es muy corta', async () => {
      const payloadPasswordCorta = { ...validPayload, password: '123' };
      const response = await request(app)
        .post('/api/auth/register')
        .send(payloadPasswordCorta)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toContain('contraseña');
    });
  });

  describe('Errores internos del servidor', () => {
    it('debe retornar HTTP 500 cuando Supabase Auth falla inesperadamente', async () => {
      setupAuthErrorMocks({ message: 'Internal server error', status: 500 });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload)
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toBe('Error al crear el usuario en el sistema de autenticación');
    });

    it('debe retornar HTTP 500 cuando la inserción en usuarios falla inesperadamente', async () => {
      const mockUser = { id: 'test-user-uuid-7', email: validPayload.email };
      const error = { code: 'PGRST116', message: 'Unexpected database error' };
      setupDbErrorMocks(mockUser, error);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload)
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.mensaje).toBe('Error al persistir el perfil del usuario');
    });
  });
});