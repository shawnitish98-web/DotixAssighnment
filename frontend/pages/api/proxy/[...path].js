export default async function handler(req, res) {
  const { path } = req.query; // array
  // Rebuild query string excluding the `path` param so we forward any filters
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k === 'path') continue;
    if (Array.isArray(v)) v.forEach(x => q.append(k, x));
    else if (v !== undefined) q.append(k, v);
  }
  const qs = q.toString();
  const target = `http://127.0.0.1:4000/${path.join('/')}${qs ? '?' + qs : ''}`;

  // build a minimal init object to avoid forwarding problematic headers
  const init = { method: req.method, headers: { 'content-type': 'application/json' } };
  if (req.method !== 'GET' && req.body) init.body = JSON.stringify(req.body);

  try {
    const proxied = await fetch(target, init);
    const text = await proxied.text();
    res.status(proxied.status).send(text);
  } catch (err) {
    console.error('Proxy fetch error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
