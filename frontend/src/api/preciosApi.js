const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

export async function actualizarPrecio(id, precio_nuevo) {

  const res = await fetch(`${API_URL}/api/precios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      precio_nuevo
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar precio');
  }

  return data;
}

export async function historialPrecios() {

  const res = await fetch(`${API_URL}/api/precios/historial`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al listar historial');
  }

  return data;
}