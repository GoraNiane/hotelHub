import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, Mail, Lock, Phone, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    const res = await register(firstName, lastName, email, phone, password);
    if (res.success) {
      setSuccessMsg('Compte créé avec succès ! Redirection vers la page de connexion...');
      // Clear forms
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      // Delay navigation
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setErrorMsg(res.error || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 md:p-8 shadow-md space-y-6">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="font-serif text-2xl font-extrabold text-teranga-green-800">Créer un compte Client</h1>
          <p className="text-xs text-teranga-gray-400 font-light mt-1.5">
            Inscrivez-vous pour réserver votre séjour et gérer vos réservations
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-650 p-3 rounded-md text-xs leading-relaxed font-light text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-250 text-green-700 p-4 rounded-md text-xs leading-relaxed font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Prénom</label>
              <input 
                type="text" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field py-2 text-sm bg-teranga-beige-50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Nom</label>
              <input 
                type="text" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field py-2 text-sm bg-teranga-beige-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-teranga-gray-500">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-355" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="input-field py-2.5 pl-10 text-sm bg-teranga-beige-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-355" />
              <input 
                type="tel" 
                required
                placeholder="+221 77..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field py-2.5 pl-10 text-sm bg-teranga-beige-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-teranga-gray-355" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field py-2 pl-9 text-xs bg-teranga-beige-50"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Confirmation</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-teranga-gray-355" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field py-2 pl-9 text-xs bg-teranga-beige-50"
                />
              </div>
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
                <UserCheck className="w-4 h-4" />
                <span>Créer mon compte</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-teranga-gray-400 font-light pt-2">
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-teranga-gold-650 font-bold hover:underline">
            Se connecter
          </Link>
        </div>

      </div>
    </div>
  );
};
