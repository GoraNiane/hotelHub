import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, UserCheck, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = await login(email, password);
    if (res.success && res.role) {
      // Redirect based on role or back to where they came from
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        if (res.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (res.role === 'RECEPTIONIST') {
          navigate('/reception/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      }
    } else {
      setErrorMsg(res.error || 'Erreur d\'authentification.');
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 md:p-8 shadow-md space-y-6">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="font-serif text-2xl font-extrabold text-teranga-green-800">Connexion Espace Privé</h1>
          <p className="text-xs text-teranga-gray-400 font-light mt-1.5">
            Accédez à votre espace de gestion ou espace client
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-650 p-3 rounded-md text-xs leading-relaxed font-light text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Adresse e-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-350" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="input-field py-2.5 pl-10 text-sm bg-teranga-beige-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Mot de passe</label>
              <span className="text-[10px] text-teranga-gold-650 hover:underline cursor-pointer">Mot de passe oublié ?</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-350" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field py-2.5 pl-10 text-sm bg-teranga-beige-50"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white font-semibold text-xs tracking-wider uppercase py-3 rounded shadow transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Register suggestion */}
        <div className="text-center text-xs text-teranga-gray-400 font-light pt-2">
          Nouveau client ?{' '}
          <Link to="/register" className="text-teranga-gold-650 font-bold hover:underline">
            Créer un compte
          </Link>
        </div>

        {/* Demo Accounts Panel */}
        <div className="border-t border-teranga-gray-150 pt-6 space-y-3">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-teranga-gray-450 text-center">
            Comptes de Démonstration
          </h3>
          <div className="grid grid-cols-1 gap-2 text-xs">
            
            {/* Admin */}
            <button 
              type="button"
              onClick={() => handleFillDemo('admin@terangapalace.com', 'admin')}
              className="flex items-center justify-between p-2.5 rounded bg-teranga-beige-100/50 hover:bg-teranga-beige-100 border border-teranga-gray-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teranga-gold-650" />
                <div>
                  <span className="font-semibold text-teranga-green-800">Administrateur</span>
                  <p className="text-[9px] text-teranga-gray-400">admin@terangapalace.com</p>
                </div>
              </div>
              <span className="text-[10px] bg-teranga-gold-450/20 text-teranga-gold-700 px-2 py-0.5 rounded font-mono">admin</span>
            </button>

            {/* Reception */}
            <button 
              type="button"
              onClick={() => handleFillDemo('reception@terangapalace.com', 'reception')}
              className="flex items-center justify-between p-2.5 rounded bg-teranga-beige-100/50 hover:bg-teranga-beige-100 border border-teranga-gray-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teranga-gold-650" />
                <div>
                  <span className="font-semibold text-teranga-green-800">Réceptionniste</span>
                  <p className="text-[9px] text-teranga-gray-400">reception@terangapalace.com</p>
                </div>
              </div>
              <span className="text-[10px] bg-teranga-gold-450/20 text-teranga-gold-700 px-2 py-0.5 rounded font-mono">reception</span>
            </button>

            {/* Client */}
            <button 
              type="button"
              onClick={() => handleFillDemo('client@gmail.com', 'client')}
              className="flex items-center justify-between p-2.5 rounded bg-teranga-beige-100/50 hover:bg-teranga-beige-100 border border-teranga-gray-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teranga-gold-650" />
                <div>
                  <span className="font-semibold text-teranga-green-800">Client Démo</span>
                  <p className="text-[9px] text-teranga-gray-400">client@gmail.com</p>
                </div>
              </div>
              <span className="text-[10px] bg-teranga-gold-450/20 text-teranga-gold-700 px-2 py-0.5 rounded font-mono">client</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
