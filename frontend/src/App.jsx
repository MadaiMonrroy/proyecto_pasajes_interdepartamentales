import { useState } from 'react';

function App() {
  // ================= ESTADOS GENERALES =================
  const [usuario, setUsuario] = useState(null); 
  const [esRegistro, setEsRegistro] = useState(false);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  // ================= ESTADOS DEL BUSCADOR =================
  const [origen, setOrigen] = useState('Cochabamba');
  const [destino, setDestino] = useState('Santa Cruz');
  const [fecha, setFecha] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscado, setBuscado] = useState(false);

  // ================= ESTADOS DE LA COMPRA =================
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [asientosOcupados, setAsientosOcupados] = useState([]);
  const [nombrePasajero, setNombrePasajero] = useState('');
  const [ciPasajero, setCiPasajero] = useState('');
  const [asiento, setAsiento] = useState('');
  const [metodoPago, setMetodoPago] = useState('QR');
  const [esMenor, setEsMenor] = useState(false);
  const [nombreTutor, setNombreTutor] = useState('');
  const [ciTutor, setCiTutor] = useState('');

  // ================= ESTADOS PARA REGISTRO =================
  const [regNombre, setRegNombre] = useState('');
  const [regCI, setRegCI] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFechaNac, setRegFechaNac] = useState('');

  // ================= FUNCIONES DE CONEXIÓN =================

  const seleccionarViaje = async (viaje) => {
    setViajeSeleccionado(viaje);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/asientos-ocupados/${viaje.id}`);
      const ocupados = await resp.json();
      setAsientosOcupados(ocupados);
    } catch (error) { console.error("Error cargando asientos"); }
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('${import.meta.env.VITE_API_URL}/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });
      const datos = await respuesta.json();
      if (respuesta.ok) setUsuario(datos.usuario);
      else alert(datos.error);
    } catch (error) { alert("Error de conexión."); }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    const hoy = new Date();
    const cumple = new Date(regFechaNac);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    if (edad < 18) return alert("Debes ser mayor de 18 años para crear una cuenta.");

    try {
      const respuesta = await fetch('${import.meta.env.VITE_API_URL}/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: regNombre, ci: regCI, correo: regCorreo, 
          password: regPassword, fecha_nacimiento: regFechaNac 
        })
      });
      if (respuesta.ok) {
        alert("¡Cuenta creada! Ahora puedes iniciar sesión.");
        setEsRegistro(false);
      } else {
        alert("Error al registrarse. Posiblemente el correo ya existe.");
      }
    } catch (error) { alert("Error de conexión."); }
  };

  const buscarPasajes = async (e) => {
    e.preventDefault();
    setBuscado(true);
    setViajeSeleccionado(null);
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/viajes?origen=${origen}&destino=${destino}&fecha=${fecha}`);
      const datos = await respuesta.json();
      setResultados(datos);
    } catch (error) { alert("Error al buscar."); }
  };

  const procesarCompra = async (e) => {
    e.preventDefault();
    if (!asiento) return alert("Por favor elige un asiento");
    try {
      const respuesta = await fetch('${import.meta.env.VITE_API_URL}/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_viaje: viajeSeleccionado.id, 
          id_cliente: usuario.id, 
          nombre_pasajero: nombrePasajero,
          ci_pasajero: ciPasajero, 
          numero_asiento: asiento, 
          metodo_pago: metodoPago,
          monto_pagado: viajeSeleccionado.precio, 
          es_menor: esMenor,
          nombre_tutor: esMenor ? nombreTutor : null, 
          ci_tutor: esMenor ? ciTutor : null
        })
      });
      if (respuesta.ok) {
        alert("🎉 ¡Boleto comprado con éxito!");
        setViajeSeleccionado(null);
        setBuscado(false);
      }
    } catch (error) { alert("Error en la compra."); }
  };

  // ================= VISTAS =================

  if (!usuario) {
    return (
      <div className="container mt-5 d-flex justify-content-center">
        <div className="card shadow-lg border-0 rounded-4" style={{ width: '450px' }}>
          <div className="card-body p-5">
            <h3 className="text-center mb-4 text-primary fw-bold">
              {esRegistro ? '📝 Crea tu Cuenta' : '🚌 Iniciar Sesión'}
            </h3>
            
            {esRegistro ? (
              <form onSubmit={manejarRegistro}>
                <input type="text" className="form-control mb-3" placeholder="Nombre Completo" onChange={e => setRegNombre(e.target.value)} required />
                <input type="text" className="form-control mb-3" placeholder="Carnet" onChange={e => setRegCI(e.target.value)} required />
                <input type="date" className="form-control mb-3" onChange={e => setRegFechaNac(e.target.value)} required />
                <input type="email" className="form-control mb-3" placeholder="Correo" onChange={e => setRegCorreo(e.target.value)} required />
                <input type="password" className="form-control mb-4" placeholder="Clave" onChange={e => setRegPassword(e.target.value)} required />
                <button className="btn btn-primary w-100 rounded-pill fw-bold">REGISTRARME</button>
                <p className="text-center mt-3 small">
                  ¿Ya tienes cuenta? <span className="text-primary fw-bold" style={{cursor:'pointer'}} onClick={() => setEsRegistro(false)}>Inicia sesión</span>
                </p>
              </form>
            ) : (
              <form onSubmit={iniciarSesion}>
                <input type="email" className="form-control mb-3" placeholder="Correo" onChange={e => setCorreo(e.target.value)} required />
                <input type="password" className="form-control mb-4" placeholder="Contraseña" onChange={e => setPassword(e.target.value)} required />
                <button className="btn btn-primary w-100 rounded-pill fw-bold">INGRESAR</button>
                <p className="text-center mt-3 small">
                  ¿No tienes cuenta? <span className="text-primary fw-bold" style={{cursor:'pointer'}} onClick={() => setEsRegistro(true)}>Regístrate aquí</span>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-3 shadow-sm border">
        <h5 className="m-0 text-primary fw-bold">📍 Sistema de Viajes</h5>
        <div>
          <span className="me-3 small fw-bold">{usuario.nombre}</span>
          <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => setUsuario(null)}>Salir</button>
        </div>
      </div>

      {!viajeSeleccionado ? (
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-lg rounded-4 p-4 mb-4">
              <h4 className="fw-bold mb-4 text-center">🔎 ¿A dónde viajas?</h4>
              <form onSubmit={buscarPasajes}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">ORIGEN</label>
                  <select className="form-select border-0 bg-light" value={origen} onChange={e => setOrigen(e.target.value)}>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">DESTINO</label>
                  <select className="form-select border-0 bg-light" value={destino} onChange={e => setDestino(e.target.value)}>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="La Paz">La Paz</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">FECHA</label>
                  <input type="date" className="form-control border-0 bg-light" onChange={e => setFecha(e.target.value)} required />
                </div>
                <button className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow">BUSCAR VIAJES</button>
              </form>
            </div>

            {buscado && resultados.map(v => (
              <div key={v.id} className="card border-0 shadow-sm rounded-4 mb-3 p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold m-0">{v.origen} ➔ {v.destino}</h6>
                    <small className="text-muted">{new Date(v.fecha_hora_salida).toLocaleString()}</small>
                  </div>
                  <div className="text-end">
                    <h5 className="text-success fw-bold m-0">Bs. {v.precio}</h5>
                    <button className="btn btn-sm btn-success rounded-pill px-3 mt-1" onClick={() => seleccionarViaje(v)}>Comprar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0 text-primary">Finalizar Compra</h4>
                <button className="btn btn-light rounded-pill" onClick={() => setViajeSeleccionado(null)}>Volver</button>
              </div>

              <div className="row g-4">
                <div className="col-md-5">
                  <div className="p-3 bg-light rounded-4 border">
                    <h6 className="text-center fw-bold mb-3 small">MAPA DEL BUS</h6>
                    <div className="d-flex flex-column gap-2 align-items-center">
                      {[...Array(10)].map((_, rowIndex) => (
                        <div key={rowIndex} className="d-flex gap-2 align-items-center">
                          <div className="d-flex gap-1">
                            {[1, 2].map(col => {
                              const num = rowIndex * 4 + col;
                              const ocupado = asientosOcupados.includes(num);
                              return (
                                <button key={num} type="button" disabled={ocupado}
                                  className={`btn btn-sm shadow-sm ${asiento === num ? 'btn-primary' : (ocupado ? 'btn-danger opacity-50' : 'btn-white border')}`}
                                  onClick={() => setAsiento(num)} style={{width: '38px', height: '38px'}}>{num}</button>
                              );
                            })}
                          </div>
                          <div style={{width: '20px'}}></div>
                          <div className="d-flex gap-1">
                            {[3, 4].map(col => {
                              const num = rowIndex * 4 + col;
                              const ocupado = asientosOcupados.includes(num);
                              return (
                                <button key={num} type="button" disabled={ocupado}
                                  className={`btn btn-sm shadow-sm ${asiento === num ? 'btn-primary' : (ocupado ? 'btn-danger opacity-50' : 'btn-white border')}`}
                                  onClick={() => setAsiento(num)} style={{width: '38px', height: '38px'}}>{num}</button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-md-7">
                  <form onSubmit={procesarCompra}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">NOMBRE PASAJERO</label>
                      <input type="text" className="form-control" onChange={e => setNombrePasajero(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">CARNET (CI)</label>
                      <input type="text" className="form-control" onChange={e => setCiPasajero(e.target.value)} required />
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label small fw-bold">MÉTODO DE PAGO</label>
                      <select className="form-select" onChange={e => setMetodoPago(e.target.value)}>
                        <option value="QR">Pago con QR</option>
                        <option value="Efectivo">Efectivo</option>
                      </select>
                    </div>

                    {metodoPago === 'QR' && (
                      <div className="text-center mb-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagoBs${viajeSeleccionado.precio}`} 
                        className="p-2 border bg-white rounded shadow-sm" alt="QR" />
                      </div>
                    )}

                    <div className="form-check mb-4 border p-3 rounded-3 bg-light">
                      <input className="form-check-input ms-0 me-2" type="checkbox" onChange={e => setEsMenor(e.target.checked)} />
                      <label className="form-check-label text-danger fw-bold small">¿Es menor de edad?</label>
                      {esMenor && (
                        <div className="mt-3 row g-2">
                          <input type="text" placeholder="Tutor" className="form-control form-control-sm" onChange={e => setNombreTutor(e.target.value)} required />
                          <input type="text" placeholder="CI Tutor" className="form-control form-control-sm" onChange={e => setCiTutor(e.target.value)} required />
                        </div>
                      )}
                    </div>

                    <button className="btn btn-success w-100 py-3 fw-bold rounded-pill shadow">CONFIRMAR COMPRA</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;