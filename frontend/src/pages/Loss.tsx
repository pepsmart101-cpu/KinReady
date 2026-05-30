import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Heart, 
  Clock, 
  FileText, 
  AlertCircle, 
  Phone, 
  ChevronRight, 
  ChevronDown,
  Droplets,
  UserPlus
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { apiService } from '../services/api';
import { useAuth } from '../store/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface Step {
  id: number;
  title: string;
  timeframe: string;
  tasks: Task[];
  docsNeeded: string[];
  commonMistakes: string[];
}

const Loss: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [showScript, setShowScript] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!user) {
        return;
      }
      try {
        const wfs = await apiService.getWorkflows();
        const lossWfSummary = wfs.find((w: any) => w.title.toLowerCase().includes('72 hours') || w.category === 'emergency');
        if (lossWfSummary) {
          setWorkflowId(lossWfSummary.id);
          const lossWf = await apiService.getWorkflowById(lossWfSummary.id);
          const progress = await apiService.getWorkflowProgress(lossWfSummary.id);
          
          // Map backend steps to our hardcoded IDs by title matching
          const completed: Record<string, boolean> = {};
          const idMap: Record<string, string> = {}; // hardcodedId -> backendStepId
          
          lossWf.steps.forEach((step: any) => {
            const hardcodedStep = steps.flatMap(s => s.tasks).find(t => t.title.toLowerCase().includes(step.title.toLowerCase()) || step.title.toLowerCase().includes(t.title.toLowerCase()));
            if (hardcodedStep) {
              idMap[hardcodedStep.id] = step.id;
              const p = progress.find((prog: any) => prog.step_id === step.id);
              if (p && p.status === 'completed') {
                completed[hardcodedStep.id] = true;
              }
            }
          });
          
          setCompletedTasks(completed);
          setBackendStepIds(idMap);
        }
      } catch (err) {
        console.error('Failed to fetch loss workflow:', err);
      }
    };
    fetchWorkflow();
  }, [user]);

  const [backendStepIds, setBackendStepIds] = useState<Record<string, string>>({});

  const steps: Step[] = [
    {
      id: 1,
      title: "Immediate Care",
      timeframe: "Hours 1–6",
      tasks: [
        {
          id: "pronouncement",
          title: "Obtain Pronouncement of Death",
          description: "If at home, call 911 or their doctor. In a hospital or hospice, staff handles this.",
          completed: false
        },
        {
          id: "notification",
          title: "Notify Close Family",
          description: "Contact 2-3 key people. Appoint a 'Communication Lead' to help notify others.",
          completed: false
        }
      ],
      docsNeeded: ["Personal ID of the deceased", "Hospice/Doctor contact info"],
      commonMistakes: ["Trying to call everyone yourself", "Rushing to call a funeral home before pronouncement"]
    },
    {
      id: 2,
      title: "The Next 24 Hours",
      timeframe: "First Day",
      tasks: [
        {
          id: "dependents",
          title: "Care for Dependents & Pets",
          description: "Ensure children, elderly relatives, or pets are cared for immediately.",
          completed: false
        },
        {
          id: "secure_home",
          title: "Secure the Property",
          description: "Lock the home, park vehicles safely, and ensure any perishables are handled.",
          completed: false
        },
        {
          id: "locate_instructions",
          title: "Locate Instructions",
          description: "Look for a 'Letter of Instruction' or pre-arranged funeral/burial plans.",
          completed: false
        }
      ],
      docsNeeded: ["House keys", "Alarm codes", "Letter of Instruction"],
      commonMistakes: ["Forgetting to feed/walk pets", "Leaving the home unattended without checking locks"]
    },
    {
      id: 3,
      title: "Days 2 and 3",
      timeframe: "Setting the Path",
      tasks: [
        {
          id: "funeral_home",
          title: "Choose a Funeral Home",
          description: "They will assist with body transportation and the death certificate process.",
          completed: false
        },
        {
          id: "death_certificates",
          title: "Order Death Certificates",
          description: "Request 10–15 certified copies. You will need these for banks, insurance, etc.",
          completed: false
        },
        {
          id: "contact_employer",
          title: "Notify Employer",
          description: "Contact HR regarding final pay, benefits, and life insurance info.",
          completed: false
        }
      ],
      docsNeeded: ["Social Security Number", "Full Legal Name", "Date of Birth/Death"],
      commonMistakes: ["Ordering too few death certificates", "Not asking about life insurance beneficiaries immediately"]
    }
  ];

  const totalTasks = steps.reduce((acc, step) => acc + step.tasks.length, 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progress = (completedCount / totalTasks) * 100;

  const toggleTask = async (taskId: string) => {
    const isCompleted = !completedTasks[taskId];
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: isCompleted
    }));
    
    if (workflowId && backendStepIds[taskId]) {
      try {
        await apiService.updateWorkflowProgress(
          workflowId, 
          backendStepIds[taskId], 
          isCompleted ? 'completed' : 'not_started'
        );
      } catch (err) {
        console.error('Failed to update progress:', err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full mb-2">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">The First 72 Hours</h1>
        <p className="text-lg text-warm-slate max-w-2xl mx-auto">
          We are so sorry for your loss. This guide will help you navigate the immediate steps with clarity. Take one breath at a time.
        </p>
      </div>

      {/* Progress Tracker */}
      <Card className="border-sage/20 bg-sage/5">
        <CardContent className="py-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-medium text-warm-slate uppercase tracking-wider">Your Progress</p>
              <p className="text-2xl font-bold text-navy dark:text-soft-sand">{completedCount} of {totalTasks} steps completed</p>
            </div>
            <p className="text-sm font-bold text-sage">{Math.round(progress)}%</p>
          </div>
          <ProgressBar value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* "Right Now" Gentle Reminder */}
      <div className="bg-calamity/10 border border-calamity/20 rounded-2xl p-6 flex gap-4 items-start">
        <div className="bg-calamity text-white p-2 rounded-lg">
          <Droplets className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-navy dark:text-white italic font-serif">A gentle reminder...</h4>
          <p className="text-navy/80 dark:text-soft-sand/80">
            Go to the kitchen, drink a glass of water, and find one person who can sit with you while you make these first few phone calls. You don't have to do this alone.
          </p>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="grid grid-cols-3 gap-2">
        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${
              activeStep === step.id 
                ? 'bg-navy text-white border-navy' 
                : 'bg-white text-warm-slate border-warm-slate/10 hover:border-warm-slate/30'
            }`}
          >
            Step {step.id}
          </button>
        ))}
      </div>

      {/* Active Step Content */}
      {steps.filter(s => s.id === activeStep).map(step => (
        <div key={step.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <Clock className="text-calamity w-6 h-6" />
            <h2 className="text-2xl font-bold text-navy dark:text-white">
              {step.title} <span className="text-warm-slate font-normal ml-2">({step.timeframe})</span>
            </h2>
          </div>

          <div className="grid gap-4">
            {step.tasks.map(task => (
              <Card 
                key={task.id} 
                className={`transition-all ${completedTasks[task.id] ? 'opacity-60 grayscale-[0.5]' : 'ring-1 ring-warm-slate/5'}`}
              >
                <CardContent className="p-0">
                  <label className="flex items-start gap-4 p-6 cursor-pointer">
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 rounded-md border-warm-slate/30 text-sage focus:ring-sage"
                        checked={!!completedTasks[task.id]}
                        onChange={() => toggleTask(task.id)}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className={`font-bold text-lg ${completedTasks[task.id] ? 'line-through text-warm-slate' : 'text-navy dark:text-soft-sand'}`}>
                        {task.title}
                      </h3>
                      <p className="text-warm-slate">{task.description}</p>
                    </div>
                  </label>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-soft-sand/30 border-warm-slate/10">
              <CardHeader>
                <h4 className="font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-calamity" />
                  Documents Needed
                </h4>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {step.docsNeeded.map((doc, i) => (
                    <li key={i} className="text-sm text-navy/70 dark:text-soft-sand/70 flex gap-2">
                      <ChevronRight className="w-4 h-4 text-calamity flex-shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-rose-50/30 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20">
              <CardHeader>
                <h4 className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Common Mistakes
                </h4>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {step.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-sm text-navy/70 dark:text-soft-sand/70 flex gap-2">
                      <ChevronRight className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      {mistake}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}

      {/* Phone Scripts Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 pt-4">
          <Phone className="w-5 h-5 text-calamity" />
          Helpful Phone Scripts
        </h3>
        
        <div className="space-y-3">
          <Card 
            className="cursor-pointer hover:border-calamity/30 transition-all"
            onClick={() => setShowScript(showScript === 'bank' ? null : 'bank')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-calamity/10 p-2 rounded-lg text-calamity">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold">Calling a Bank</span>
              </div>
              {showScript === 'bank' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </CardContent>
            {showScript === 'bank' && (
              <CardContent className="border-t border-warm-slate/10 bg-soft-sand/20 p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-navy p-4 rounded-xl border border-warm-slate/10 italic">
                    "Hello, my name is [Your Name]. I am calling to report the passing of an account holder, [Deceased Name]. I am the [Executor / Next of Kin]. Could you please transfer me to your bereavement or estate department?"
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-sm text-warm-slate uppercase">Pro-Tip:</p>
                    <p className="text-sm">Before they freeze the account, ask if there are any automatic payments scheduled for the mortgage or utilities so you can plan for those.</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card 
            className="cursor-pointer hover:border-calamity/30 transition-all"
            onClick={() => setShowScript(showScript === 'employer' ? null : 'employer')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-calamity/10 p-2 rounded-lg text-calamity">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="font-bold">Calling an Employer</span>
              </div>
              {showScript === 'employer' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </CardContent>
            {showScript === 'employer' && (
              <CardContent className="border-t border-warm-slate/10 bg-soft-sand/20 p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-navy p-4 rounded-xl border border-warm-slate/10 italic">
                    "I am calling to share the news that [Deceased Name] has passed away. I would like to speak with someone in Human Resources regarding final payroll and any survivor benefits or life insurance policies they may have had."
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <div className="pt-8 flex justify-between items-center border-t border-warm-slate/10">
        <Button variant="ghost" onClick={() => activeStep > 1 && setActiveStep(activeStep - 1)}>
          Previous Step
        </Button>
        <Button variant="primary" onClick={() => activeStep < 3 ? setActiveStep(activeStep + 1) : null}>
          {activeStep === 3 ? "Complete Workflow" : "Next Step"}
        </Button>
      </div>
    </div>
  );
};

export default Loss;
