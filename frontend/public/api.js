async function api(path, options = {}) {
  const token = localStorage.getItem('op_token');

  const res = await fetch(`${CONFIG.API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}
