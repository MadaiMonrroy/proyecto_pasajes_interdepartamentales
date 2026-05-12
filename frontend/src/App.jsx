import { useState } from 'react';

function App() {
  // Estados para guardar lo que el usuario selecciona
  const [origen, setOrigen] = useState('Cochabamba');
  const [destino, setDestino] = useState('Santa Cruz');
  const [fecha, setFecha] = useState('');

  // Función que se ejecuta al presionar "Buscar"
  const buscarPasajes = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    alert(`Buscando viajes de ${origen} a ${destino} para el ${fecha}`);
    // ¡Pronto conectaremos esto con el backend para buscar en MySQL!
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          
          {/* Tarjeta del buscador */}
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h2 className="text-center mb-4 text-primary fw-bold">🚌 Buscar Pasajes</h2>
              
              <form onSubmit={buscarPasajes}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Origen</label>
                  <select 
                    className="form-select form-select-lg" 
                    value={origen} 
                    onChange={(e) => setOrigen(e.target.value)}
                  >
                    <option value="La Paz">La Paz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Destino</label>
                  <select 
                    className="form-select form-select-lg" 
                    value={destino} 
                    onChange={(e) => setDestino(e.target.value)}
                  >
                    <option value="La Paz">La Paz</option>
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Fecha de Viaje</label>
                  <input 
                    type="date" 
                    className="form-control form-control-lg" 
                    value={fecha} 
                    onChange={(e) => setFecha(e.target.value)} 
                    required 
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold">
                    Buscar Viajes
                  </button>
                </div>
              </form>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;