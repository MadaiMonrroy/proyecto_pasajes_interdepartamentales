import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const tokenGuardado = localStorage.getItem('token');

    if (usuarioGuardado && tokenGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      setToken(tokenGuardado);
    }

    setLoading(false);
  }, []);

  const iniciarSesion = (usuarioData, tokenData) => {
    setUsuario(usuarioData);
    setToken(tokenData);

    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    localStorage.setItem('token', tokenData);
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);

    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      iniciarSesion,
      cerrarSesion
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}