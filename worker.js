const SUPABASE_URL = 'https://onnwozcmmudsdcypletl.supabase.co';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/admin/')) {
      return handleAdminAPI(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};

async function handleAdminAPI(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, 401);
  }
  const userJwt = authHeader.slice(7);

  const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${userJwt}`, apikey: userJwt }
  });
  if (!userResp.ok) return json({ error: 'Invalid token' }, 401);
  const userData = await userResp.json();
  if (!userData?.user_metadata?.admin) {
    return json({ error: 'Forbidden' }, 403);
  }

  const url = new URL(request.url);
  const path = url.pathname.replace('/api/admin/', '');

  if (path === 'users' && request.method === 'GET') {
    return listUsers(url, env);
  }
  const userMatch = path.match(/^users\/(.+)$/);
  if (userMatch && request.method === 'PUT') {
    return updateUser(userMatch[1], request, env);
  }
  return json({ error: 'Not found' }, 404);
}

async function listUsers(url, env) {
  const sp = new URLSearchParams();
  sp.set('page', url.searchParams.get('page') || '1');
  sp.set('per_page', url.searchParams.get('perPage') || '100');
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?${sp}`, {
    headers: sbAdminHeaders(env)
  });
  return json(await resp.json(), resp.status);
}

async function updateUser(userId, request, env) {
  const body = await request.json();
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: { ...sbAdminHeaders(env), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return json(await resp.json(), resp.status);
}

function sbAdminHeaders(env) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
