const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

export async function listarViajes() {

  const res = await fetch(`${API_URL}/api/viajes`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al listar viajes');
  }

  return data;
}

export async function crearViaje(datos) {

  const res = await fetch(`${API_URL}/api/viajes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(datos)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al crear viaje');
  }

  return data;
}
export async function actualizarViaje(id, datos) {

  const res = await fetch(`${API_URL}/api/viajes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(datos)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar');
  }

  return data;
}

export async function cambiarEstadoViaje(id, estado) {

  const res = await fetch(`${API_URL}/api/viajes/${id}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ estado })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar estado');
  }

  return data;
}

export async function eliminarViaje(id) {

  const res = await fetch(`${API_URL}/api/viajes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al eliminar');
  }

  return data;
}