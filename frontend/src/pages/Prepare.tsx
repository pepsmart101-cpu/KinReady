import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Users, 
  Key, 
  Activity,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';

interface Workflow {
  id: string;
  title: string;
  description: string;
  category: string;
  steps?: any[];
  progress?: number;
}

const Prepare: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      try {
        const data = await apiService.getWorkflows();
        
        // Enhance with progress data
        const enhancedWorkflows = await Promise.all(data.map(async (wf: any) => {
          const progressData = await apiService.getWorkflowProgress(wf.id);
          const totalSteps = progressData.length;
          const completedSteps = progressData.filter((p: any) => p.status === 'completed').length;
          const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
          
          return {
            ...wf,
            progress,
            steps: progressData
          };
        }));
        
        setWorkflows(enhancedWorkflows);
      } catch (err) {
        console.error('Failed to fetch workflows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const handleToggleStep = async (workflowId: string, stepId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
    try {
      await apiService.updateWorkflowProgress(workflowId, stepId, newStatus);
      
      // Update local state
      setWorkflows(prev => prev.map(wf => {
        if (wf.id === workflowId) {
          const updatedSteps = wf.steps?.map(step => {
            if (step.step_id === stepId) return { ...step, status: newStatus };
            return step;
          });
          
          const totalSteps = updatedSteps?.length || 0;
          const completedSteps = updatedSteps?.filter(p => p.status === 'completed').length || 0;
          const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
          
          const updatedWf = { ...wf, steps: updatedSteps, progress };
          if (selectedWorkflow?.id === workflowId) setSelectedWorkflow(updatedWf);
          return updatedWf;
        }
        return wf;
      }));
    } catch (err) {
      console.error('Failed to update step:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-calamity"></div>
        <p className="mt-4 text-warm-slate">Loading preparation workflows...</p>
      </div>
    );
  }

  if (selectedWorkflow) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <button 
          onClick={() => setSelectedWorkflow(null)}
          className="flex items-center text-calamity font-bold hover:underline mb-4"
        >
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
          Back to Preparation Hub
        </button>

        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-calamity/10 text-calamity rounded-2xl">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-navy dark:text-white">{selectedWorkflow.title}</h1>
              <p className="text-warm-slate">{selectedWorkflow.description}</p>
            </div>
          </div>
          
          <Card className="bg-soft-sand/20 border-warm-slate/10">
            <CardContent className="py-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-warm-slate uppercase tracking-wider">Workflow Progress</span>
                <span className="text-sm font-bold text-sage">{selectedWorkflow.progress}%</span>
              </div>
              <ProgressBar value={selectedWorkflow.progress || 0} className="h-2" />
            </CardContent>
          </Card>
        </header>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-navy dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-calamity" />
            Action Steps
          </h2>
          <div className="grid gap-3">
            {selectedWorkflow.steps?.map((step, idx) => (
              <Card 
                key={step.step_id} 
                className={`transition-all ${step.status === 'completed' ? 'opacity-70 grayscale-[0.3]' : 'hover:border-calamity/30'}`}
              >
                <CardContent className="p-0">
                  <label className="flex items-start gap-4 p-5 cursor-pointer">
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        className="w-6 h-6 rounded-md border-warm-slate/30 text-sage focus:ring-sage"
                        checked={step.status === 'completed'}
                        onChange={() => handleToggleStep(selectedWorkflow.id, step.step_id, step.status)}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className={`font-bold text-lg ${step.status === 'completed' ? 'line-through text-warm-slate' : 'text-navy dark:text-soft-sand'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-warm-slate leading-relaxed">
                        Step {idx + 1} of {selectedWorkflow.steps?.length}
                      </p>
                    </div>
                  </label>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-calamity/5 border border-calamity/20 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-calamity flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-navy dark:text-white italic font-serif">Pro Tip</h4>
            <p className="text-warm-slate text-sm">
              Don't try to finish everything in one sitting. Take 15 minutes each day to complete one or two steps. Consistency is key to long-term readiness.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-serif font-bold text-navy dark:text-white mb-4">Preparation Hub</h1>
        <p className="text-xl text-warm-slate leading-relaxed">
          Guided workflows to help you and your family prepare for any situation. Choose a path below to begin.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((wf) => (
          <Card 
            key={wf.id} 
            className="group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer border-warm-slate/10"
            onClick={() => setSelectedWorkflow(wf)}
          >
            <div className="p-6 space-y-4 flex-grow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-calamity/10 text-calamity rounded-xl group-hover:bg-calamity group-hover:text-white transition-colors">
                  {wf.category === 'emergency' ? <Shield className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                {wf.progress === 100 && (
                  <div className="flex items-center gap-1 text-sage font-bold text-xs uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy dark:text-white group-hover:text-calamity transition-colors leading-tight">
                  {wf.title}
                </h3>
                <p className="text-warm-slate mt-2 text-sm line-clamp-2">
                  {wf.description}
                </p>
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1 text-xs font-bold text-warm-slate uppercase">
                  <span>Progress</span>
                  <span>{wf.progress}%</span>
                </div>
                <ProgressBar value={wf.progress || 0} className="h-1.5" />
              </div>
            </div>
            <div className="p-4 bg-soft-sand/30 dark:bg-navy/10 flex items-center justify-between group-hover:bg-soft-sand dark:group-hover:bg-navy/20 transition-colors border-t border-warm-slate/5">
              <span className="text-sm font-bold text-calamity flex items-center">
                {wf.progress === 0 ? 'Start Workflow' : 'Continue'} <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="flex items-center text-xs text-warm-slate">
                <Clock className="w-3.5 h-3.5 mr-1" /> 15m
              </div>
            </div>
          </Card>
        ))}
        
        {/* Placeholder cards for pending workflows if any */}
        {workflows.length < 3 && [1, 2].map(i => (
          <Card key={`empty-${i}`} className="bg-soft-sand/10 border-dashed border-warm-slate/20 flex flex-col items-center justify-center p-8 text-center opacity-60">
            <div className="w-12 h-12 rounded-full bg-warm-slate/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-warm-slate" />
            </div>
            <h3 className="font-bold text-warm-slate italic">Coming Soon</h3>
            <p className="text-xs text-warm-slate/70 mt-1">More readiness workflows are being curated by our experts.</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Prepare;
