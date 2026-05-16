import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, BusFront, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { loginUsuario } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  .vg-root {
    min-height: 100vh;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    background: #f0fdf9;
    overflow: hidden;
    position: relative;
  }

  .vg-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .vg-bg-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, #0d948840 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.5;
    -webkit-mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%);
    mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%);
  }
  .vg-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.3;
    animation: blobFloat 10s ease-in-out infinite;
  }
  .vg-blob--1 {
    width: 520px; height: 520px;
    top: -180px; left: -140px;
    background: radial-gradient(circle, #5eead4, #0d9488);
    animation-duration: 12s;
  }
  .vg-blob--2 {
    width: 380px; height: 380px;
    bottom: -120px; right: -80px;
    background: radial-gradient(circle, #99f6e4, #0d9488);
    animation-delay: 4s; animation-duration: 9s;
  }
  .vg-blob--3 {
    width: 260px; height: 260px;
    top: 45%; left: 58%;
    background: radial-gradient(circle, #a7f3d0, #059669);
    animation-delay: 7s; animation-duration: 14s; opacity: 0.18;
  }
  @keyframes blobFloat {
    0%,100% { transform: scale(1) translate(0,0); }
    33%      { transform: scale(1.08) translate(12px,-18px); }
    66%      { transform: scale(0.95) translate(-10px,12px); }
  }

  .vg-particle {
    position: absolute;
    border-radius: 50%;
    background: #0d9488;
    opacity: 0;
    animation: particleRise 14s ease-in-out infinite;
  }
  .vg-particle--1  { width:5px; height:5px; left:5%;  animation-delay:0s;   animation-duration:13s; background:#14b8a6; }
  .vg-particle--2  { width:3px; height:3px; left:12%; animation-delay:2s;   animation-duration:10s; }
  .vg-particle--3  { width:5px; height:5px; left:20%; animation-delay:4s;   animation-duration:15s; background:#5eead4; }
  .vg-particle--4  { width:4px; height:4px; left:30%; animation-delay:1s;   animation-duration:11s; }
  .vg-particle--5  { width:5px; height:5px; left:42%; animation-delay:3s;   animation-duration:16s; background:#0f766e; }
  .vg-particle--6  { width:3px; height:3px; left:55%; animation-delay:5s;   animation-duration:12s; }
  .vg-particle--7  { width:5px; height:5px; left:65%; animation-delay:2.5s; animation-duration:9s;  background:#14b8a6; }
  .vg-particle--8  { width:4px; height:4px; left:75%; animation-delay:6s;   animation-duration:13s; }
  .vg-particle--9  { width:4px; height:4px; left:85%; animation-delay:1.5s; animation-duration:11s; background:#5eead4; }
  .vg-particle--10 { width:5px; height:5px; left:93%; animation-delay:0.5s; animation-duration:14s; }
  @keyframes particleRise {
    0%   { opacity:0; transform: translateY(100vh) scale(0.5); }
    10%  { opacity: 0.5; }
    90%  { opacity: 0.15; }
    100% { opacity:0; transform: translateY(-80px) scale(1.1); }
  }

  /* ── Layout ── */
  .vg-left {
    display: none;
    width: 50%;
    position: relative; z-index: 1;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem 3.5rem;
  }
  @media (min-width: 1024px) { .vg-left { display: flex; } }

  .vg-right {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 1.5rem;
    position: relative; z-index: 1;
  }

  /* ── Logo ── */
  .vg-logo {
    display: flex; align-items: center; gap: 14px;
    opacity: 0; transform: translateY(-16px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .vg-logo.vg-show { opacity:1; transform: translateY(0); }

  .vg-logo-box {
    width: 52px; height: 52px; border-radius: 16px;
    background: linear-gradient(135deg, #0d9488, #0f766e);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  .vg-logo-box::after {
    content: '';
    position: absolute; top: 0; left: -60%;
    width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: logoShine 4s ease-in-out infinite;
  }
  @keyframes logoShine {
    0%,70% { left:-60%; }
    85%    { left:130%; }
    100%   { left:130%; }
  }
  .vg-logo-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.9rem; font-weight: 800;
    color: #134e4a; letter-spacing: -0.04em;
  }
  .vg-logo-name span { color: #0d9488; }

  /* ── Headline ── */
  .vg-headline {
    opacity: 0; transform: translateY(24px);
    transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
  }
  .vg-headline.vg-show { opacity:1; transform: translateY(0); }

  .vg-headline h2 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 3.2vw, 3rem);
    font-weight: 800;
    color: #134e4a;
    line-height: 1.1; letter-spacing: -0.04em;
    margin-bottom: 1.25rem;
  }
  .vg-headline h2 em {
    font-style: normal;
    background: linear-gradient(90deg, #0d9488 0%, #14b8a6 40%, #0f766e 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: textShimmer 4s linear infinite;
  }
  @keyframes textShimmer { to { background-position: 200% center; } }

  .vg-headline p {
    font-size: 1rem; font-weight: 300;
    color: #5eada8; line-height: 1.75; max-width: 400px;
  }

  /* ── Pills ── */
  .vg-pills {
    display: flex; gap: 10px; flex-wrap: wrap; margin-top: 2.5rem;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s;
  }
  .vg-pills.vg-show { opacity:1; transform: translateY(0); }

  .vg-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 16px;
    background: rgba(255,255,255,0.75);
    border: 1px solid rgba(13,148,136,0.2);
    border-radius: 100px;
    backdrop-filter: blur(8px);
    box-shadow: 0 2px 8px rgba(13,148,136,0.08);
  }
  .vg-pill-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #0d9488;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.2);
    animation: pillBlink 2.5s ease-in-out infinite;
  }
  @keyframes pillBlink {
    0%,100% { opacity:1; box-shadow: 0 0 0 3px rgba(13,148,136,0.2); }
    50%      { opacity:0.5; box-shadow: 0 0 0 5px rgba(13,148,136,0.1); }
  }
  .vg-pill span { font-size: 0.8rem; font-weight: 500; color: #0f766e; }

  /* ── Footer izquierdo ── */
  .vg-left-foot {
    font-size: 0.78rem; color: #99c9c4;
    opacity: 0; transition: opacity 0.8s ease 0.65s;
    font-weight: 400;
  }
  .vg-left-foot.vg-show { opacity:1; }

  /* ── Card ── */
  .vg-card {
    width: 100%; max-width: 448px;
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(13,148,136,0.15);
    border-radius: 28px;
    padding: 2.5rem 2.25rem;
    backdrop-filter: blur(20px);
    box-shadow:
      inset 0 2px 0 rgba(255,255,255,0.95),
      0 24px 64px rgba(13,148,136,0.12),
      0 4px 16px rgba(0,0,0,0.05);
    position: relative; overflow: hidden;
    opacity: 0; transform: translateY(32px) scale(0.97);
    transition: opacity 0.85s cubic-bezier(0.34,1.4,0.64,1) 0.1s,
                transform 0.85s cubic-bezier(0.34,1.4,0.64,1) 0.1s;
  }
  .vg-card.vg-show { opacity:1; transform: translateY(0) scale(1); }

  .vg-card::before {
    content: '';
    position: absolute;
    top: 0; left: 15%; right: 15%; height: 2px;
    background: linear-gradient(90deg, transparent, #0d9488, #5eead4, #0d9488, transparent);
    animation: cardTopLine 3s ease-in-out infinite;
  }
  @keyframes cardTopLine {
    0%,100% { opacity:0.5; } 50% { opacity:1; }
  }

  /* Logo móvil */
  .vg-mobile-logo { display:flex; justify-content:center; margin-bottom:1.5rem; }
  @media (min-width: 1024px) { .vg-mobile-logo { display:none; } }

  .vg-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.65rem; font-weight: 800;
    color: #134e4a; letter-spacing: -0.03em; margin-bottom: 0.3rem;
  }
  .vg-card-sub { font-size: 0.88rem; color: #7db8b4; font-weight: 400; }

  /* ── Error ── */
  .vg-error {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 14px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 12px;
    margin-bottom: 1.25rem;
    animation: errIn 0.3s cubic-bezier(0.34,1.4,0.64,1) both;
  }
  @keyframes errIn {
    from { opacity:0; transform:translateY(-6px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  .vg-error svg { color:#e11d48; flex-shrink:0; margin-top:1px; }
  .vg-error p   { font-size:0.84rem; color:#9f1239; margin:0; line-height:1.5; }

  /* ── Campos ── */
  .vg-field { margin-bottom: 1.1rem; }

  .vg-field-top {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 7px;
  }
  .vg-field-top label {
    font-size: 0.78rem; font-weight: 600;
    color: #134e4a; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .vg-field-top a {
    font-size: 0.77rem; font-weight: 500;
    color: #0d9488; text-decoration: none; transition: color 0.2s;
  }
  .vg-field-top a:hover { color: #0f766e; text-decoration: underline; }

  .vg-input-wrap {
    position: relative;
    border-radius: 13px;
    transition: transform 0.2s cubic-bezier(0.34,1.4,0.64,1);
  }
  .vg-input-wrap:focus-within { transform: scale(1.015); }

  .vg-input-wrap::after {
    content: '';
    position: absolute; inset: -1px;
    border-radius: 14px;
    background: linear-gradient(135deg, #0d9488, #5eead4);
    z-index: 0;
    opacity: 0;
    transition: opacity 0.25s;
    pointer-events: none;
  }
  .vg-input-wrap:focus-within::after { opacity: 1; }

  .vg-input-inner {
    position: relative; z-index: 1;
    display: flex; align-items: center;
    background: #f0fdf9;
    border: 1.5px solid #ccfbf1;
    border-radius: 13px;
    overflow: hidden;
    transition: background 0.25s, border-color 0.25s;
  }
  .vg-input-wrap:focus-within .vg-input-inner {
    border-color: transparent;
    background: #fff;
  }

  .vg-icon {
    padding-left: 14px; flex-shrink: 0;
    color: #a7c9c5;
    display: flex; align-items: center;
    transition: color 0.25s;
  }
  .vg-input-wrap:focus-within .vg-icon { color: #0d9488; }

  input.vg-input {
    flex: 1;
    background: transparent;
    border: none; outline: none;
    padding: 13px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; font-weight: 400;
    color: #134e4a;
  }
  input.vg-input::placeholder { color: #a7c9c5; }
  input.vg-input:disabled { opacity: 0.55; cursor: not-allowed; }

  .vg-eye {
    background: none; border: none; cursor: pointer;
    padding: 0 14px; color: #a7c9c5;
    display: flex; align-items: center;
    transition: color 0.2s; flex-shrink: 0;
  }
  .vg-eye:hover { color: #0d9488; }

  /* ── Botón ── */
  .vg-btn {
    width: 100%; margin-top: 1.5rem;
    position: relative; overflow: hidden;
    padding: 14px 20px;
    font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%);
    background-size: 200% 100%;
    border: none; border-radius: 13px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    box-shadow: 0 4px 20px rgba(13,148,136,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: transform 0.2s cubic-bezier(0.34,1.4,0.64,1),
                box-shadow 0.2s ease,
                background-position 0.4s ease;
    letter-spacing: 0.01em;
  }
  .vg-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(13,148,136,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
    background-position: 100% 0;
  }
  .vg-btn:active:not(:disabled) { transform: scale(0.99); }
  .vg-btn:disabled { opacity:0.65; cursor:not-allowed; }

  .vg-btn::after {
    content: '';
    position: absolute;
    top: 0; left: -80%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transform: skewX(-15deg);
    transition: left 0.55s ease;
  }
  .vg-btn:hover::after { left: 130%; }

  @keyframes vgSpin { to { transform: rotate(360deg); } }
  .vg-spin { animation: vgSpin 0.75s linear infinite; }

  /* ── Separador ── */
  .vg-sep {
    display: flex; align-items: center; gap: 12px;
    margin: 1.5rem 0 1.25rem;
  }
  .vg-sep::before, .vg-sep::after {
    content:''; flex:1; height:1px;
    background: linear-gradient(90deg, transparent, #ccfbf1, transparent);
  }
  .vg-sep span { font-size:0.75rem; color:#99c9c4; white-space:nowrap; }

  /* ── Registro ── */
  .vg-register { margin-top:1.5rem; text-align:center; }
  .vg-register p { font-size:0.87rem; color:#7db8b4; }
  .vg-register a {
    color:#0d9488; font-weight:600; text-decoration:none;
    border-bottom: 1px dashed rgba(13,148,136,0.4);
    transition: color 0.2s, border-color 0.2s;
  }
  .vg-register a:hover { color:#0f766e; border-color:#0f766e; }
`;

export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, []);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const data = await loginUsuario(correo, password);
      iniciarSesion(data.usuario, data.token);
      if (data.usuario.rol === 'Administrador') navigate('/admin');
      else if (data.usuario.rol === 'Encargado') navigate('/encargado');
      else navigate('/cliente');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const s = show ? 'vg-show' : '';

  return (
    <>
      <style>{CSS}</style>

      <div className="vg-root">

        {/* Fondo */}
        <div className="vg-bg" aria-hidden="true">
          <div className="vg-bg-dots" />
          <div className="vg-blob vg-blob--1" />
          <div className="vg-blob vg-blob--2" />
          <div className="vg-blob vg-blob--3" />
          <div className="vg-particle vg-particle--1" />
          <div className="vg-particle vg-particle--2" />
          <div className="vg-particle vg-particle--3" />
          <div className="vg-particle vg-particle--4" />
          <div className="vg-particle vg-particle--5" />
          <div className="vg-particle vg-particle--6" />
          <div className="vg-particle vg-particle--7" />
          <div className="vg-particle vg-particle--8" />
          <div className="vg-particle vg-particle--9" />
          <div className="vg-particle vg-particle--10" />
        </div>

        {/* Lado izquierdo */}
        <div className="vg-left">
          <div className={`vg-logo ${s}`}>
            <div className="vg-logo-box">
              <BusFront size={26} color="white" />
            </div>
            <span className="vg-logo-name">Via<span>Go</span></span>
          </div>

          <div className={`vg-headline ${s}`}>
            <h2>
              Conectando destinos,<br />
              <em>acercando personas.</em>
            </h2>
            <p>
              Accede al sistema interdepartamental más seguro y moderno de Bolivia.
              Gestiona tus viajes, boletos y rutas en un solo lugar.
            </p>
            <div className={`vg-pills ${s}`}>
              <div className="vg-pill">
                <span className="vg-pill-dot" />
                <span>9 departamentos</span>
              </div>
              <div className="vg-pill">
                <span className="vg-pill-dot" />
                <span>+2M pasajeros</span>
              </div>
              <div className="vg-pill">
                <span className="vg-pill-dot" />
                <span>100% seguro</span>
              </div>
            </div>
          </div>

          <p className={`vg-left-foot ${s}`}>
            © {new Date().getFullYear()} TransBolivia Enterprise · Todos los derechos reservados
          </p>
        </div>

        {/* Lado derecho */}
        <div className="vg-right">
          <div className={`vg-card ${s}`}>

            <div className="vg-mobile-logo">
              <div className="vg-logo-box">
                <BusFront size={26} color="white" />
              </div>
            </div>

            <p className="vg-card-title">Bienvenido de nuevo</p>
            <p className="vg-card-sub" style={{ marginBottom: '1.75rem' }}>
              Ingresa tus credenciales para continuar
            </p>

            {error && (
              <div className="vg-error">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={manejarLogin}>

              {/* Correo */}
              <div className="vg-field">
                <div className="vg-field-top">
                  <label htmlFor="vg-email">Correo electrónico</label>
                </div>
                <div className="vg-input-wrap">
                  <div className="vg-input-inner">
                    <span className="vg-icon"><Mail size={17} /></span>
                    <input
                      id="vg-email"
                      type="email"
                      className="vg-input"
                      placeholder="ejemplo@correo.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      disabled={cargando}
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div className="vg-field">
                <div className="vg-field-top">
                  <label htmlFor="vg-pass">Contraseña</label>
                  <Link to="/recuperar-password" tabIndex="-1">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="vg-input-wrap">
                  <div className="vg-input-inner">
                    <span className="vg-icon"><Lock size={17} /></span>
                    <input
                      id="vg-pass"
                      type={mostrarPassword ? 'text' : 'password'}
                      className="vg-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={cargando}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="vg-eye"
                      onClick={() => setMostrarPassword(v => !v)}
                      aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      tabIndex="-1"
                    >
                      {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="vg-btn" disabled={cargando}>
                {cargando ? (
                  <>
                    <Loader2 size={19} className="vg-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar a mi cuenta</span>
                    <ArrowRight size={19} />
                  </>
                )}
              </button>

            </form>

            <div className="vg-sep">
              <span>¿Nuevo en ViaGo?</span>
            </div>

            <div className="vg-register">
              <p>
                ¿No tienes una cuenta?{' '}
                <Link to="/registro">Crea una aquí</Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}