// ─── Webhook: Lemon Squeezy ───
// POST /api/webhook
// Recibe eventos de pago y actualiza el plan del usuario
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) });
  if (request.method !== 'POST') return new Response(null, { status: 405 });

  try {
    const body = await request.json();
    const eventName = body.meta?.event_name;
    const username = body.meta?.custom_data?.username;

    if (!username || !eventName) {
      return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400, headers: corsHeaders(request) });
    }

    const users = JSON.parse(await env.DB.get('users', 'json') || '{}');
    if (!users[username]) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 404, headers: corsHeaders(request) });
    }

    if (eventName === 'order_created') {
      const variant = body.data?.attributes?.first_subscription?.variant_id || '';
      const product = body.data?.attributes?.first_order_item?.product_name || '';

      if (product.toLowerCase().includes('pro') || variant === env.PRO_VARIANT_ID) {
        users[username].plan = 'pro';
      } else if (product.toLowerCase().includes('premium') || variant === env.PREMIUM_VARIANT_ID) {
        users[username].plan = 'premium';
      }

      await env.DB.put('users', JSON.stringify(users));
    }

    if (eventName === 'subscription_expired' || eventName === 'subscription_cancelled') {
      users[username].plan = 'free';
      await env.DB.put('users', JSON.stringify(users));
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders(request) });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders(request) });
  }
}

function corsHeaders(request) {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
}
