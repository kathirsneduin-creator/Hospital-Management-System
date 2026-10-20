import { useEffect, useState } from 'react';
import { Users, Search, UserPlus, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import { PROMOTABLE_ROLES, ROLE_LABELS } from '../../../lib/roles';
import { DEMO_PASSWORD } from '../../../lib/localDb';

const roleColor = {
  patient: 'bg-secondary/20 text-primary-dark',
  doctor: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
  receptionist: 'bg-amber-100 text-amber-800',
  worker: 'bg-slate-100 text-slate-700',
};

const SPECIALTIES = [
  'Homeopathy & Chronic Care',
  'Medical Yoga & Breathing',
  'Clinical Nutrition',
  "Women's Wellness",
  'General Homeopathy',
];

export default function AdminUsers() {
  const { subscribeUsers, createStaffAccount, promoteUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const [staff, setStaff] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'doctor',
    specialization: SPECIALTIES[0],
  });

  useEffect(() => subscribeUsers(setUsers), [subscribeUsers]);

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setNotice('');
    try {
      const created = await createStaffAccount(staff);
      setNotice(`${ROLE_LABELS[created.role]} created. Login: ${created.email} / ${created.tempPassword || DEMO_PASSWORD}`);
      setStaff({ name: '', email: '', phone: '', address: '', role: 'doctor', specialization: SPECIALTIES[0] });
    } catch (err) {
      setNotice(err.message || 'Could not create staff account.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-heading font-semibold text-primary-dark mb-1 flex items-center gap-2">
            <UserPlus size={18} /> Add doctor or employee
          </h3>
          <p className="text-xs text-muted mb-4">Doctors and staff cannot self-register. Admin creates them here.</p>
          <form onSubmit={handleCreate} className="space-y-3">
            <input className="input" required placeholder="Full name" value={staff.name} onChange={(e) => setStaff({ ...staff, name: e.target.value })} />
            <input className="input" required type="email" placeholder="Work email" value={staff.email} onChange={(e) => setStaff({ ...staff, email: e.target.value })} />
            <input className="input" required placeholder="Mobile" value={staff.phone} onChange={(e) => setStaff({ ...staff, phone: e.target.value })} />
            <input className="input" placeholder="Address" value={staff.address} onChange={(e) => setStaff({ ...staff, address: e.target.value })} />
            <select className="input" value={staff.role} onChange={(e) => setStaff({ ...staff, role: e.target.value })}>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
            </select>
            {staff.role === 'doctor' && (
              <select className="input" value={staff.specialization} onChange={(e) => setStaff({ ...staff, specialization: e.target.value })}>
                {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            )}
            <button className="btn btn-primary w-full">Create staff login ({DEMO_PASSWORD})</button>
          </form>
          {notice && <p className="text-sm text-primary mt-3">{notice}</p>}
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-semibold text-primary-dark mb-1 flex items-center gap-2">
            <ArrowUpRight size={18} /> Promote employee role
          </h3>
          <p className="text-xs text-muted mb-4">Move a worker to receptionist, doctor, or admin.</p>
          <ul className="space-y-2 max-h-80 overflow-y-auto scroll-thin">
            {users.filter((u) => u.role !== 'patient').map((u) => (
              <li key={u.id || u.uid} className="flex items-center justify-between gap-2 border-2 border-primary/15 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted truncate">{u.email}</p>
                </div>
                <select
                  className="input !py-1 !w-36 !text-xs"
                  value={u.role}
                  onChange={async (e) => {
                    try {
                      await promoteUser(u.uid || u.id, e.target.value);
                      setNotice(`${u.name || 'User'} is now ${ROLE_LABELS[e.target.value]}.`);
                    } catch (err) {
                      setNotice(err.message || 'Could not change the user role.');
                    }
                  }}
                >
                  {PROMOTABLE_ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h2 className="font-heading text-xl font-bold text-primary-dark flex items-center gap-2">
          <Users size={20} /> All users
        </h2>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
            <input className="input !pl-9 !py-2 !w-56" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input !py-2 !w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            {Object.keys(ROLE_LABELS).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/10 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">No users found.</td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id || u.uid}>
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-muted">{u.email}</td>
                <td className="px-5 py-3 text-muted">{u.phone || '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${roleColor[u.role] || roleColor.patient}`}>{u.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
