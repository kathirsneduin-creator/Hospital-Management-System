import { useEffect, useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import { addJournalEntry, getJournal, subscribeLocal } from '../../../lib/localDb';
import { patientText } from '../../../data/translations';

const moods = ['Great', 'Good', 'Okay', 'Low', 'Struggling'];
const painLevels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const energyLevels = ['Very low', 'Low', 'Steady', 'Good', 'High'];
const sleepLevels = ['Poor', 'Fair', 'Good', 'Excellent'];
const weights = Array.from({ length: 81 }, (_, i) => String(40 + i));

function recoveryFrom(form) {
  const moodScore = { Great: 100, Good: 80, Okay: 60, Low: 40, Struggling: 20 }[form.mood] || 60;
  const energyScore = { 'Very low': 20, Low: 40, Steady: 60, Good: 80, High: 100 }[form.energy] || 60;
  const sleepScore = { Poor: 25, Fair: 50, Good: 75, Excellent: 100 }[form.sleep] || 50;
  const painScore = 100 - Number(form.pain) * 10;
  return Math.round((moodScore + energyScore + sleepScore + painScore) / 4);
}

export default function HealthJournal() {
  const { currentUser, language } = useAuth();
  const text = patientText[language];
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ mood: 'Good', pain: '3', energy: 'Steady', sleep: 'Good', weight: '70' });
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeLocal(() => {
    setEntries(getJournal().filter((j) => j.patientId === currentUser?.uid));
  }), [currentUser]);

  const handleAdd = (e) => {
    e.preventDefault();
    setSaving(true);
    addJournalEntry({
      patientId: currentUser.uid,
      ...form,
      recovery: recoveryFrom(form),
    });
    setSaving(false);
  };

  const latest = entries[0];

  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
      <Card className="p-6 h-fit">
        <h3 className="font-heading font-semibold text-primary-dark mb-4 flex items-center gap-2">
          <BookOpen size={18} /> {text.todaysProgress}
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.mood}</label>
            <select className="input" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>
              {moods.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.pain}</label>
            <select className="input" value={form.pain} onChange={(e) => setForm({ ...form, pain: e.target.value })}>
              {painLevels.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.energy}</label>
            <select className="input" value={form.energy} onChange={(e) => setForm({ ...form, energy: e.target.value })}>
              {energyLevels.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.sleep}</label>
            <select className="input" value={form.sleep} onChange={(e) => setForm({ ...form, sleep: e.target.value })}>
              {sleepLevels.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{text.weight}</label>
            <select className="input" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}>
              {weights.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <button className="btn btn-primary w-full" disabled={saving}>
            <Plus size={16} /> {saving ? text.saving : text.saveProgress}
          </button>
        </form>
      </Card>

      <div>
        <h3 className="font-heading font-semibold text-primary-dark mb-4">{text.history}</h3>
        {latest && (
          <Card className="p-5 mb-4">
            <p className="text-sm text-muted mb-2">{text.recovery}</p>
            <div className="h-3 rounded-full bg-secondary/20">
              <div className="h-3 rounded-full bg-primary" style={{ width: `${latest.recovery}%` }} />
            </div>
            <p className="text-sm font-semibold mt-2">{latest.recovery}%</p>
          </Card>
        )}
        {entries.length === 0 ? (
          <Card className="p-10 text-center"><p className="text-muted text-sm">{text.noProgress}</p></Card>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <Card key={e.id} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{e.mood} · {e.recovery}%</span>
                  <span className="text-xs text-muted">{new Date(e.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted mt-2">Weight {e.weight} kg · Pain {e.pain}/10 · Energy {e.energy} · Sleep {e.sleep}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
