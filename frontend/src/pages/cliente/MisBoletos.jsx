import { useEffect, useState } from 'react';
import { misBoletos } from '../../api/boletosApi';

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('token');
}

async function descargarPDF(id, codigo) {
  const res = await fetch(`${API_URL}/api/boletos/${id}/pdf`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al generar PDF');

  const byteCharacters = atob(data.pdf);
  const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${codigo}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MisBoletos() {
  const [boletos, setBoletos] = useState([]);
  const [descargando, setDescargando] = useState(null);

  useEffect(() => {
    misBoletos().then(setBoletos).catch(err => alert(err.message));
  }, []);

  const handleDescargar = async (id, codigo) => {
    setDescargando(id);
    try {
      await descargarPDF(id, codigo);
    } catch (err) {
      alert(err.message);
    } finally {
      setDescargando(null);
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">Mis boletos</h2>

      <div className="grid gap-3 sm:gap-4">
        {boletos.map(b => (
          <div key={b.id} className="rounded-xl! bg-white p-3 shadow sm:p-5">

            {/* En móvil: columna. En sm+: fila */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

              {/* Info principal */}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold sm:text-base">{b.codigo_boleto}</div>
                <div className="mt-0.5 text-sm sm:text-base">
                  {b.origen} → {b.destino}
                </div>
                <div className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  {new Date(b.fecha_hora_salida).toLocaleString()}
                </div>
                <div className="mt-0.5 text-xs sm:text-sm">
                  Asiento: {b.numero_asiento} | Estado: {b.estado}
                </div>
              </div>

              {/* Precio + botón: en móvil fila entre ellos, en sm columna alineada a la derecha */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
                <div className="text-base font-bold text-green-600 sm:text-lg">
                  Bs. {b.monto_pagado}
                </div>
                <button
                  onClick={() => handleDescargar(b.id, b.codigo_boleto)}
                  disabled={descargando === b.id}
                  className="rounded-lg! border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                >
                  {descargando === b.id ? 'Generando...' : 'Descargar PDF'}
                </button>
              </div>

            </div>
          </div>
        ))}

        {boletos.length === 0 && (
          <div className="text-sm text-gray-500 sm:text-base">
            No tienes boletos comprados.
          </div>
        )}
      </div>
    </div>
  );
}