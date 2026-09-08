import React, { useEffect, useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { User, UserRole } from '../../types/types';
import { Plus, Search, Edit2, ShieldAlert, X, Save, ShieldCheck } from 'lucide-react';

export const AdminEmployees: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<User | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('RECEPTIONIST');
  const [enabled, setEnabled] = useState(true);

  const fetchEmployees = () => {
    // Filter only staff members (ADMIN and RECEPTIONIST)
    const staff = mockDb.getUsers().filter(u => u.role === 'ADMIN' || u.role === 'RECEPTIONIST');
    setEmployees(staff);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingEmp(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setRole('RECEPTIONIST');
    setEnabled(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (emp: User) => {
    setEditingEmp(emp);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setEmail(emp.email);
    setPhone(emp.phone);
    setRole(emp.role);
    setEnabled(emp.enabled);
    setShowModal(true);
  };

  const handleToggleEnabled = (empId: string) => {
    const allUsers = mockDb.getUsers();
    const updated = allUsers.map(u => {
      if (u.id === empId) {
        return { ...u, enabled: !u.enabled, updatedAt: new Date().toISOString() };
      }
      return u;
    });

    mockDb.setUsers(updated);
    fetchEmployees();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allUsers = mockDb.getUsers();

    const empData: User = {
      id: editingEmp ? editingEmp.id : `user-${Date.now()}`,
      firstName,
      lastName,
      email,
      phone,
      role,
      enabled,
      createdAt: editingEmp ? editingEmp.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingEmp) {
      // Edit
      const updated = allUsers.map(u => u.id === editingEmp.id ? empData : u);
      mockDb.setUsers(updated);
    } else {
      // Create
      // Check if email already exists
      if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert('Cet e-mail est déjà associé à un compte.');
        return;
      }
      mockDb.setUsers([...allUsers, empData]);
    }

    setShowModal(false);
    fetchEmployees();
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || emp.email.toLowerCase().includes(query) || emp.role.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-teranga-gray-200 p-4 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-teranga-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, e-mail, rôle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-teranga-gray-200 rounded-md px-3 py-1.5 pl-10 text-xs focus:ring-1 focus:ring-teranga-gold-450 focus:outline-none bg-teranga-beige-50"
          />
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-teranga-gold-450 hover:bg-teranga-gold-500 text-white font-semibold text-xs py-2 px-4 rounded shadow transition-all flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Employé</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="bg-white border border-teranga-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-16 text-xs text-teranga-gray-400">
              Aucun employé correspondant.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs font-light text-teranga-gray-650">
              <thead>
                <tr className="border-b border-teranga-gray-200 bg-teranga-gray-50/50 text-[10px] font-bold uppercase text-teranga-gray-400">
                  <th className="p-4">Collaborateur</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">Rôle</th>
                  <th className="p-4 text-center">Accès</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teranga-gray-150">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-teranga-beige-100/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teranga-gold-50 text-teranga-gold-650 flex items-center justify-center font-bold text-xs border border-teranga-gold-200">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-teranga-green-800">{emp.firstName} {emp.lastName}</span>
                          <span className="text-[10px] text-teranga-gray-450">Créé le : {emp.createdAt}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-teranga-gray-700">{emp.email}</span>
                        <span>{emp.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-semibold uppercase text-teranga-gold-700">{emp.role}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 border rounded-[4px] text-[9px] font-bold uppercase ${
                        emp.enabled 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {emp.enabled ? 'Actif' : 'Bloqué'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="text-teranga-gold-650 hover:text-teranga-gold-700 p-1.5 hover:bg-teranga-beige-100 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleEnabled(emp.id)}
                          className={`p-1.5 rounded transition-colors ${
                            emp.enabled 
                              ? 'text-red-500 hover:text-red-750 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          title={emp.enabled ? 'Bloquer l\'accès' : 'Activer l\'accès'}
                        >
                          {emp.enabled ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Employee Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-teranga-gray-200 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-teranga-gray-400 hover:text-teranga-gray-650"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-teranga-green-800 border-b border-teranga-gray-150 pb-2">
              {editingEmp ? `Modifier l'employé ${editingEmp.firstName}` : 'Ajouter un Collaborateur'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-light text-teranga-gray-650">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Prénom</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Nom</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Adresse e-mail</label>
                <input
                  type="email"
                  required
                  disabled={!!editingEmp}
                  placeholder="nom@terangapalace.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50 disabled:bg-teranga-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Numéro de téléphone</label>
                <input
                  type="tel"
                  required
                  placeholder="+221..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-teranga-beige-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Rôle assigné</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="RECEPTIONIST">Réceptionniste</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-teranga-gray-500">Statut d'accès</label>
                  <select
                    value={enabled ? 'TRUE' : 'FALSE'}
                    onChange={(e) => setEnabled(e.target.value === 'TRUE')}
                    className="border border-teranga-gray-200 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="TRUE">Actif / Autorisé</option>
                    <option value="FALSE">Bloqué / Suspendu</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-teranga-gray-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline-gold py-1.5 px-4 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-teranga-green-750 hover:bg-teranga-green-800 text-white font-semibold text-xs px-5 py-1.5 rounded shadow transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-teranga-gold-450" />
                  <span>Enregistrer</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
