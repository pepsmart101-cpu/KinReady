import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight, 
  FileText, 
  Key, 
  PhoneCall,
  Plus,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuth } from '../store/AuthContext';
import { useUser } from '../store/UserContext';
import { apiService } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onboarding } = useUser();
  const [readinessScore, setReadinessScore] = useState(onboarding.readinessScore || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const wfs = await apiService.getWorkflows();
        
        // Calculate score based on progress of all workflows
        let totalSteps = 0;
        let completedSteps = 0;
        
        for (const wf of wfs) {
          const progress = await apiService.getWorkflowProgress(wf.id);
          totalSteps += progress.length;
          completedSteps += progress.filter((p: any) => p.status === 'completed').length;
        }
        
        if (totalSteps > 0) {
          const calculatedScore = Math.round((completedSteps / totalSteps) * 100);
          setReadinessScore(calculatedScore > 0 ? calculatedScore : (onboarding.readinessScore || 0));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, onboarding.readinessScore]);

  const nextSteps = [
    { id: 1, title: "Add Emergency Contacts", description: "Designate who should be called in a crisis.", category: "Health", status: onboarding.mode === 'crisis' ? "Urgent" : "Recommended" },
    { id: 2, title: "Secure Digital Vault", description: "Store your primary account access info.", category: "Security", status: "Recommended" },
    { id: 3, title: "Upload Estate Documents", description: "Wills, trusts, and power of attorney.", category: "Legal", status: "Pending" }
  ];

  const familyMembers = [
    { name: user?.first_name ? `${user.first_name} ${user.last_name}` : "John Doe", role: "Primary Account Holder", avatar: user?.first_name?.charAt(0) || "J", status: "Active" },
    { name: "Jane Doe", role: "Spouse / Primary Contact", avatar: "JD", status: readinessScore > 50 ? "Ready" : "Partial" },
  ];

  const recentTasks = [
    { title: "Completed Onboarding Assessment", date: "Just now" },
    { title: "Personalized Plan Generated", date: "Just now" }
  ];

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-calamity"></div>
        <p className="mt-4 text-warm-slate">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4">
      {/* Welcome & Global Score */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-navy dark:text-white leading-tight">
            Good morning, {user?.first_name || 'John'}.
          </h1>
          <p className="text-warm-slate text-lg">
            Your family is <span className="text-sage font-bold">{readinessScore}% prepared</span> for what's next.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex gap-2 flex-1 md:flex-none">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
          <Button className="flex gap-2 flex-1 md:flex-none" onClick={() => navigate(onboarding.mode === 'crisis' ? '/loss' : '/prepare')}>
            <Shield className="w-4 h-4" /> Resume Planning
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Readiness Score Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sage" />
              Family Readiness Score
            </h3>
            <span className="text-warm-slate text-sm font-medium italic font-serif">Updated just now</span>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Simulated circular progress */}
                <svg className="w-full h-full -rotate-90">
                  <circle 
                    cx="88" cy="88" r="78" 
                    className="stroke-soft-sand dark:stroke-white/5 fill-none" 
                    strokeWidth="12" 
                  />
                  <circle 
                    cx="88" cy="88" r="78" 
                    className="stroke-sage fill-none transition-all duration-1000" 
                    strokeWidth="12" 
                    strokeDasharray={490}
                    strokeDashoffset={490 - (490 * readinessScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-navy dark:text-white">{readinessScore}%</span>
                  <span className="text-xs font-bold text-warm-slate uppercase tracking-widest">Score</span>
                </div>
              </div>
              <div className="flex-grow space-y-4 text-center md:text-left">
                <p className="text-navy dark:text-soft-sand leading-relaxed text-lg">
                  {readinessScore < 50 
                    ? "Let's focus on the essentials. Your first goal is to add emergency contacts." 
                    : "You're doing great! Your basic directives are in place. Now, let's secure your digital legacy."}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-sage/5 rounded-2xl border border-sage/10 space-y-2">
                    <span className="block text-xs font-bold text-warm-slate uppercase">Health</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-navy dark:text-white">{onboarding.mode === 'crisis' ? '20%' : '65%'}</span>
                      <ProgressBar value={onboarding.mode === 'crisis' ? 20 : 65} className="h-2" />
                    </div>
                  </div>
                  <div className="p-4 bg-calamity/5 rounded-2xl border border-calamity/10 space-y-2">
                    <span className="block text-xs font-bold text-warm-slate uppercase">Security</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-navy dark:text-white">15%</span>
                      <ProgressBar value={15} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-soft-sand/20 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-warm-slate flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-calamity" />
              Missing item: Secondary Emergency Contact
            </span>
            <Button variant="ghost" size="sm" className="text-calamity font-bold w-full sm:w-auto">
              Improve Score <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Help Card */}
        <Card className="bg-navy text-white border-navy shadow-xl shadow-navy/20">
          <CardHeader>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Need Immediate Help?
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-soft-sand/70 text-sm leading-relaxed">
              In a crisis or facing a recent loss? Use our specialized guidance to navigate the first few days.
            </p>
            <div className="space-y-3">
              <Button 
                variant="navy" 
                className="w-full bg-rose-600 hover:bg-rose-700 border-none justify-between h-14 rounded-xl px-5"
                onClick={() => navigate('/loss')}
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-5 h-5" /> Someone Passed Away
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="navy" 
                className="w-full bg-white/10 hover:bg-white/20 border-none justify-between h-14 rounded-xl px-5"
                onClick={() => navigate('/emergency')}
              >
                <span className="flex items-center gap-3 text-white">
                  <PhoneCall className="w-5 h-5" /> Emergency Help
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="border-white/10">
            <p className="text-[11px] text-soft-sand/40 italic text-center w-full">
              Always call 911 first in a life-threatening emergency.
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Recommended Next Steps */}
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-calamity" />
            Your Recommended Next Steps
          </h3>
          <div className="grid gap-4">
            {nextSteps.map(step => (
              <Card key={step.id} className="hover:border-calamity/30 transition-all cursor-pointer group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                      step.status === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-calamity/10 text-calamity'
                    }`}>
                      {step.id === 1 ? <Users className="w-7 h-7" /> : step.id === 2 ? <Key className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-navy dark:text-soft-sand">{step.title}</h4>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          step.status === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-soft-sand text-warm-slate'
                        }`}>{step.status}</span>
                      </div>
                      <p className="text-sm text-warm-slate leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="p-2 text-warm-slate group-hover:text-calamity">
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Family Circle & Tasks */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-calamity" />
              Family Circle
            </h3>
            <Card>
              <CardContent className="p-0">
                {familyMembers.map((member, i) => (
                  <div key={i} className={`p-4 flex items-center justify-between ${i !== familyMembers.length - 1 ? 'border-b border-warm-slate/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-calamity text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-navy dark:text-soft-sand">{member.name}</p>
                        <p className="text-[11px] text-warm-slate">{member.role}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      member.status === 'Active' || member.status === 'Ready' ? 'bg-sage/10 text-sage' : 
                      member.status === 'Partial' ? 'bg-calamity/10 text-calamity' : 'bg-soft-sand text-warm-slate'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full text-calamity font-bold hover:bg-calamity/5">Manage Family Circle</Button>
              </CardFooter>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-navy dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sage" />
              Recently Completed
            </h3>
            <div className="space-y-4">
              {recentTasks.map((task, i) => (
                <div key={i} className="flex gap-4 items-start bg-white dark:bg-navy p-4 rounded-2xl border border-warm-slate/5">
                  <div className="mt-1 bg-sage/10 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy dark:text-soft-sand">{task.title}</p>
                    <p className="text-[11px] text-warm-slate uppercase font-black tracking-widest mt-1">{task.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
