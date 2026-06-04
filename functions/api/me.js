// ─── API: Obtener usuario actual ───
// GET /api/me
// Header: Authorization: Bearer <token>
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) });
  if (request.method !== 'GET') return new Response(null, { status: 405 });

  const cors = corsHeaders(request);
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: cors });
  }

  try {
    const token = auth.slice(7);
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('Token inválido');

    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp * 1000 < Date.now()) throw new Error('Token expirado');

    const users = JSON.parse(await env.DB.get('users', 'json') || '{}');
    const user = users[payload.username];
    if (!user) throw new Error('Usuario no encontrado');

    return new Response(JSON.stringify({ user: { username: user.username, plan: user.plan } }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 401, headers: cors });
  }
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}
