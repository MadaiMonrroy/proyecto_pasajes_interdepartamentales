const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

export async function listarUsuarios() {
  const res = await fetch(`${API_URL}/api/usuarios`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al listar usuarios');
  return data;
}

export async function crearUsuario(datos) {
  const res = await fetch(`${API_URL}/api/usuarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(datos)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
  return data;
}

export async function actualizarUsuario(id, datos) {
  const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(datos)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar usuario');
  return data;
}

export async function deshabilitarUsuario(id) {
  const res = await fetch(`${API_URL}/api/usuarios/${id}/deshabilitar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al deshabilitar usuario');
  return data;
}
export async function reenviarActivacion(id) {
  const res = await fetch(`${API_URL}/api/usuarios/${id}/reenviar-activacion`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al reenviar activación');
  return data;
}

export async function habilitarUsuario(id) {
  const res = await fetch(`${API_URL}/api/usuarios/${id}/habilitar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al habilitar usuario');
  return data;
}