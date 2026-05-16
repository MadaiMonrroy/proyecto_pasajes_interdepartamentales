const API_URL = import.meta.env.VITE_API_URL;

export async function loginUsuario(correo, password) {
  const respuesta = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ correo, password })
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  return data;
}

export async function registrarCliente(datos) {
  const respuesta = await fetch(`${API_URL}/api/auth/registro-cliente`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al registrar');
  }

  return data;
}
export async function recuperarPassword(correo) {
  const res = await fetch(`${API_URL}/api/auth/recuperar-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al recuperar contraseña');
  return data;
}

export async function cambiarPassword(password_actual, password_nuevo) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/api/auth/cambiar-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ password_actual, password_nuevo })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cambiar contraseña');
  return data;
}
export async function confirmarCorreo(token) {
  const res = await fetch(`${API_URL}/api/auth/confirmar-correo?token=${token}`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al confirmar correo');

  return data;
}

export async function restablecerPassword(token, password_nuevo) {
  const res = await fetch(`${API_URL}/api/auth/restablecer-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token, password_nuevo })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al restablecer contraseña');

  return data;
}
export async function habilitarUsuario(id) {
  const res = await fetch(`${API_URL}/api/usuarios/${id}/habilitar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al habilitar');
  return data;
}

export async function reenviarActivacion(id) {
  const res = await fetch(`${API_URL}/api/usuarios/${id}/reenviar-activacion`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al reenviar');
  return data;
}