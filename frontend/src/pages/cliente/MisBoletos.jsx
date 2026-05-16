import { useEffect, useState } from 'react';
import { misBoletos } from '../../api/boletosApi';

export default function MisBoletos() {
  const [boletos, setBoletos] = useState([]);

  useEffect(() => {
    misBoletos().then(setBoletos).catch(err => alert(err.message));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Mis boletos</h2>

      <div className="grid gap-4">
        {boletos.map(b => (
          <div key={b.id} className="bg-white rounded-xl! shadow p-5">
            <div className="flex justify-between">
              <div>
                <div className="font-bold">{b.codigo_boleto}</div>
                <div>{b.origen} → {b.destino}</div>
                <div className="text-sm text-gray-500">{new Date(b.fecha_hora_salida).toLocaleString()}</div>
                <div>Asiento: {b.numero_asiento} | Estado: {b.estado}</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-green-600">Bs. {b.monto_pagado}</div>
                <button className="mt-2 border px-4 py-2 rounded-lg">
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        ))}

        {boletos.length === 0 && (
          <div className="text-gray-500">No tienes boletos comprados.</div>
        )}
      </div>
    </div>
  );
}