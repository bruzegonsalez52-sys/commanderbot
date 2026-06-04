// ─── API: Registro de usuario ───
// POST /api/register
// Body: { username, password }
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const cors = corsHeaders(request);

  try {
    const { username, password } = await request.json();
    if (!username || !password || password.length < 6) {
      return new Response(JSON.stringify({ error: 'Usuario y contraseña (min 6 chars) requeridos' }), { status: 400, headers: cors });
    }

    const users = JSON.parse(await env.DB.get('users', 'json') || '{}');
    if (users[username]) {
      return new Response(JSON.stringify({ error: 'El usuario ya existe' }), { status: 409, headers: cors });
    }

    const cryptoPass = await hashPassword(password);
    users[username] = { username, password: cryptoPass, plan: 'free', createdAt: new Date().toISOString() };
    await env.DB.put('users', JSON.stringify(users));

    const token = await generateToken(username, env);
    return new Response(JSON.stringify({ token, user: { username, plan: 'free' } }), { status: 201, headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function generateToken(username, env) {
  const payload = { username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
  return env.JWT_SECRET + '.' + btoa(JSON.stringify(payload));
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}
