const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

export async function buscarViajes(origen, destino, fecha) {
  const res = await fetch(`${API_URL}/api/boletos/buscar?origen=${origen}&destino=${destino}&fecha=${fecha}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al buscar viajes');
  return data;
}

export async function obtenerAsientosOcupados(idViaje) {
  const res = await fetch(`${API_URL}/api/boletos/asientos/${idViaje}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener asientos');
  return data;
}

export async function comprarBoleto(datos) {
  const res = await fetch(`${API_URL}/api/boletos/comprar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(datos)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al comprar boleto');
  return data;
}

export async function misBoletos() {
  const res = await fetch(`${API_URL}/api/boletos/mis-boletos`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al listar boletos');
  return data;
}

export async function ventasSucursal(desde, hasta, estado) {
  const params = new URLSearchParams();
  if (desde)  params.set('desde', desde);
  if (hasta)  params.set('hasta', hasta);
  if (estado) params.set('estado', estado);
 
  const res  = await fetch(`${API_URL}/api/boletos/ventas-sucursal?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al listar ventas');
  return data;
}
export async function listarViajesDisponibles() {
  const res = await fetch(`${API_URL}/api/boletos/viajes-disponibles`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al listar viajes');
  return data;
}

// ── Nueva: para que VenderPasaje.jsx cargue todos los viajes disponibles ──
export async function listarViajesEncargado() {
  const res = await fetch(`${API_URL}/api/boletos/viajes-disponibles`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al listar viajes');
  return data;
}
export async function cancelarBoletoEncargado(id) {
  const res  = await fetch(`${API_URL}/api/boletos/${id}/cancelar-encargado`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cancelar boleto');
  return data;
}
 