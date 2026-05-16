import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
  buscarViajes,
  obtenerAsientosOcupados,
  comprarBoleto
} from '../../api/boletosApi';

import ModalCompraExitosa from '../../components/boletos/ModalCompraExitosa';
import SelectorRuta from '../../components/boletos/SelectorRuta';
import CardViaje from '../../components/boletos/CardViaje';
import MapaAsientos from '../../components/boletos/MapaAsientos';
import FormularioPasajeros from '../../components/boletos/FormularioPasajeros';

export default function ComprarPasaje() {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  const [cantidadPasajes, setCantidadPasajes] = useState(1);

  const [buscando, setBuscando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const [viajes, setViajes] = useState([]);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [asientosOcupados, setAsientosOcupados] = useState([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);

  const [metodoPago, setMetodoPago] = useState('QR');
  const [correoComprobante, setCorreoComprobante] = useState('');

  const [modalExito, setModalExito] = useState(false);
  const [resultadoCompra, setResultadoCompra] = useState(null);

  function abrirPDFBase64(base64) {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  async function buscar(e) {
    e.preventDefault();

    if (!origen || !destino) {
      alert('Debe seleccionar origen y destino.');
      return;
    }

    if (origen === destino) {
      alert('El origen y destino no pueden ser iguales.');
      return;
    }

    setBuscando(true);
    setBusquedaRealizada(false);
    setViajes([]);

    try {
      const data = await buscarViajes(origen, destino, fecha);

      setTimeout(() => {
        setViajes(data);
        setBusquedaRealizada(true);
        setBuscando(false);
      }, 700);
    } catch (error) {
      setBuscando(false);
      alert(error.message);
    }
  }

  async function seleccionarViaje(viaje) {
    setViajeSeleccionado(viaje);
    setAsientosSeleccionados([]);

    const ocupados = await obtenerAsientosOcupados(viaje.id);
    setAsientosOcupados(ocupados);
  }

  function volverAResultados() {
    setViajeSeleccionado(null);
    setAsientosSeleccionados([]);
  }

  async function confirmarCompra(pasajeros) {
    if (asientosSeleccionados.length !== cantidadPasajes) return;

    const payload = {
      id_viaje: viajeSeleccionado.id,
      metodo_pago: metodoPago,
      correo_comprobante: correoComprobante,
      pasajeros: pasajeros.map((pasajero, index) => ({
        ...pasajero,
        numero_asiento: asientosSeleccionados[index]
      }))
    };

    const data = await comprarBoleto(payload);

    setResultadoCompra(data);
    setModalExito(true);

    setViajeSeleccionado(null);
    setViajes([]);
    setAsientosSeleccionados([]);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">
          Comprar pasaje
        </h1>

        {!viajeSeleccionado && (
          <>
            <SelectorRuta
              origen={origen}
              destino={destino}
              fecha={fecha}
              cantidadPasajes={cantidadPasajes}
              setOrigen={setOrigen}
              setDestino={setDestino}
              setFecha={setFecha}
              setCantidadPasajes={setCantidadPasajes}
              onBuscar={buscar}
              buscando={buscando}
            />

            {buscando && (
              <div className="mt-8 flex flex-col items-center justify-center rounded-3xl! border border-teal-100 bg-teal-50/60 p-8 text-center">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-teal-700" />
                <p className="font-bold text-teal-900">
                  Buscando viajes disponibles...
                </p>
              </div>
            )}

            {busquedaRealizada && !buscando && viajes.length === 0 && (
              <div className="mt-8 rounded-3xl! border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-lg font-black text-amber-800">
                  No hay buses disponibles para esta ruta.
                </p>
                <p className="mt-1 text-sm font-medium text-amber-700">
                  Intenta cambiar la fecha, origen o destino.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-4">
              {viajes.map(viaje => (
                <CardViaje
                  key={viaje.id}
                  viaje={viaje}
                  cantidadPasajes={cantidadPasajes}
                  onSeleccionar={() => seleccionarViaje(viaje)}
                />
              ))}
            </div>
          </>
        )}

        {viajeSeleccionado && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <MapaAsientos
              viaje={viajeSeleccionado}
              asientosOcupados={asientosOcupados}
              asientosSeleccionados={asientosSeleccionados}
              setAsientosSeleccionados={setAsientosSeleccionados}
              cantidadPasajes={cantidadPasajes}
              onVolver={volverAResultados}
            />

            <FormularioPasajeros
              cantidadPasajes={cantidadPasajes}
              asientosSeleccionados={asientosSeleccionados}
              metodoPago={metodoPago}
              setMetodoPago={setMetodoPago}
              correoComprobante={correoComprobante}
              setCorreoComprobante={setCorreoComprobante}
              precio={viajeSeleccionado.precio}
              onConfirmar={confirmarCompra}
            />
          </div>
        )}
      </div>

      <ModalCompraExitosa
        abierto={modalExito}
        boletos={resultadoCompra?.boletos || []}
        correoEnviado={resultadoCompra?.correo_enviado}
        onVerPDF={
          resultadoCompra?.comprobante_pdf
            ? () => abrirPDFBase64(resultadoCompra.comprobante_pdf)
            : null
        }
        onCerrar={() => {
          setModalExito(false);
          setResultadoCompra(null);
        }}
      />
    </div>
  );
}