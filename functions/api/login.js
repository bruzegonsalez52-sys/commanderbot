// ─── API: Login ───
// POST /api/login
// Body: { username, password }
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) });
  if (request.method !== 'POST') return new Response(null, { status: 405 });

  const cors = corsHeaders(request);

  try {
    const { username, password } = await request.json();
    const users = JSON.parse(await env.DB.get('users', 'json') || '{}');
    const user = users[username];

    if (!user || !(await verifyPassword(password, user.password))) {
      return new Response(JSON.stringify({ error: 'Usuario o contraseña incorrectos' }), { status: 401, headers: cors });
    }

    const token = await generateToken(username, env);
    return new Response(JSON.stringify({ token, user: { username, plan: user.plan } }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

async function verifyPassword(password, hash) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest))) === hash;
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
