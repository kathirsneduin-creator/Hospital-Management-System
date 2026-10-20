import { useEffect, useState } from 'react';
import { Check, Salad } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { nutritionPlans } from '../../../data/content';
import { subscribeNutritionRequests, setNutritionRequestStatus } from '../../../lib/appointmentService';
import { useAuth } from '../../../context/AuthContext';
import { patientText } from '../../../data/translations';

export default function PatientNutrition() {
  const { currentUser, userProfile, language } = useAuth();
  const text = patientText[language];
  const [requests, setRequests] = useState([]);
  useEffect(() => subscribeNutritionRequests(setRequests), []);
  const patientId = userProfile?.patientId || currentUser?.patientId || currentUser?.uid;
  const activePlan = requests.find((request) => request.patientId === patientId && request.status === 'active');
  const pendingPlan = requests.find((request) => request.patientId === patientId && request.status === 'pending');
  const inactivePlan = requests.find((request) => request.patientId === patientId && request.status === 'inactive');
  const planNames = language === 'ta' ? { 'SILVER PLAN': 'வெள்ளி திட்டம்', 'GOLD PLAN': 'தங்க திட்டம்', 'PLATINUM PLAN': 'பிளாட்டினம் திட்டம்' } : {};
  const featureNames = language === 'ta' ? { 'Personalized Diet Plan': 'தனிப்பயன் உணவுத் திட்டம்', 'Weekly Meal Plan': 'வாராந்திர உணவுத் திட்டம்', 'Super Food Guide': 'சிறந்த உணவு வழிகாட்டி' } : {};

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-primary-dark mb-6">{text.myNutrition}</h2>
      {activePlan ? (
        <Card className="p-6"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="font-heading text-xl font-bold text-primary-dark">{planNames[activePlan.planName] || activePlan.planName}</p><p className="text-sm text-muted mt-1">₹{activePlan.price}/{language === 'ta' ? 'மாதம்' : 'month'} · {activePlan.consultationType}</p><p className="text-xs text-primary mt-3">{language === 'ta' ? 'செயலில் உள்ள நோயாளர் அடையாள எண்' : 'Active for Patient ID'} {activePlan.patientId}</p></div></div></Card>
      ) : (
        <Card className="p-10 text-center">
          <Salad className="text-primary mx-auto mb-3" size={32} />
          <p className="text-muted">{text.noNutrition}</p>
          <Link to="/#nutrition" className="btn btn-primary mt-5 inline-flex">{text.browseNutrition}</Link>
        </Card>
      )}
      {pendingPlan && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{planNames[pendingPlan.planName] || pendingPlan.planName} {language === 'ta' ? 'மருத்துவர் ஒப்புதலுக்காக காத்திருக்கிறது.' : 'is waiting for doctor approval.'}</p>}
      {inactivePlan && <Card className="mt-4 p-5"><p className="font-semibold text-primary-dark">{inactivePlan.planName} {text.inactive}</p><p className="text-xs text-muted mt-1">{text.patientId} {inactivePlan.patientId}</p><button type="button" onClick={() => setNutritionRequestStatus(inactivePlan.id, 'active')} className="btn btn-primary mt-3 !py-2 !text-xs">{text.reactivate}</button></Card>}

      <div className="grid sm:grid-cols-3 gap-5 mt-8">
        {nutritionPlans.map((plan) => (
          <Card key={plan.name} className="p-5">
            <p className="font-heading font-semibold text-primary-dark">{planNames[plan.name] || plan.name}</p>
            <p className="font-heading text-2xl font-bold mt-1">₹{plan.price}<span className="text-sm font-normal text-muted">/{language === 'ta' ? 'மாதம்' : 'mo'}</span></p>
            <ul className="mt-3 space-y-1.5">
              {plan.features.slice(0, 3).map((f) => (
                <li key={f} className="text-xs text-muted flex items-center gap-1.5"><Check size={12} className="text-primary" /> {featureNames[f] || f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
