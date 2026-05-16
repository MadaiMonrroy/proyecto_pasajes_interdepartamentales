const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

export async function listarBuses() {

  const res = await fetch(`${API_URL}/api/buses`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al listar buses');
  }

  return data;
}

export async function crearBus(datos) {

  const res = await fetch(`${API_URL}/api/buses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(datos)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error al crear bus');
  }

  return data;
}
export async function actualizarBus(id, datos) {

  const res = await fetch(`${API_URL}/api/buses/${id}`, {
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

export async function cambiarEstadoBus(id, estado) {

  const res = await fetch(`${API_URL}/api/buses/${id}/estado`, {
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