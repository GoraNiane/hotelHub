import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCheck, Phone, Mail, User, Info, CheckCircle2 } from 'lucide-react';

export const ClientProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await updateProfile(firstName, lastName, phone);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Votre profil a été mis à jour avec succès.');
      // Auto clear alert
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Impossible de sauvegarder les modifications.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 animate-fade-in">
      <div className="bg-white border border-teranga-gray-200 rounded-lg p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Title */}
        <div className="border-b border-teranga-gray-150 pb-4">
          <h2 className="font-serif text-lg font-bold text-teranga-green-800">Mon Profil Client</h2>
          <p className="text-xs text-teranga-gray-400 font-light mt-1">
            Modifiez vos coordonnées de facturation et de contact.
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-light text-teranga-gray-650">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Prénom</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-teranga-gray-350" />
                <input 
                  type="text" 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field py-2.5 pl-10 text-sm bg-teranga-beige-50" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Nom</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-teranga-gray-350" />
                <input 
                  type="text" 
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field py-2.5 pl-10 text-sm bg-teranga-beige-50" 
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Adresse e-mail (Non modifiable)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-teranga-gray-300" />
              <input 
                type="email" 
                disabled
                value={currentUser?.email || ''}
                className="input-field py-2.5 pl-10 text-sm bg-teranga-gray-100 border-teranga-gray-200 text-teranga-gray-400 cursor-not-allowed" 
              />
            </div>
            <div className="flex items-start gap-1.5 text-[10px] text-teranga-gray-400 font-light mt-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Pour changer votre email, veuillez contacter la réception ou l'administrateur.</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Numéro de téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-teranga-gray-355" />
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field py-2.5 pl-10 text-sm bg-teranga-beige-50" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-teranga-gray-100 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white font-semibold text-xs tracking-wider uppercase px-6 py-3 rounded shadow transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
