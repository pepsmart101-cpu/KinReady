import React, { useState } from 'react';
import { 
  Heart, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import { useUser } from '../store/UserContext';

type OnboardingMode = 'crisis' | 'prep' | null;

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useUser();
  const [mode, setMode] = useState<OnboardingMode>(null);
  const [step, setStep] = useState(0); // 0: mode selection, 1-3: questions, 4: result
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const crisisQuestions = [
    {
      id: 1,
      question: "Has a legal pronouncement of death been made by a professional?",
      options: ["Yes", "No", "I don't know how"]
    },
    {
      id: 2,
      question: "Do you have a list of close family and friends who need to be notified today?",
      options: ["Yes", "No", "Working on it"]
    },
    {
      id: 3,
      question: "Are you aware of any pre-arranged funeral or burial wishes?",
      options: ["Yes", "No", "I need help finding them"]
    }
  ];

  const prepQuestions = [
    {
      id: 1,
      question: "If you were in the hospital today, does someone you trust know where to find your vital info?",
      options: ["Yes", "No", "Partially"]
    },
    {
      id: 2,
      question: "Have you named someone to speak for you if you can't make medical decisions?",
      options: ["Yes", "No", "What is this?"]
    },
    {
      id: 3,
      question: "Does your family have a way to access your digital accounts or pay bills in an emergency?",
      options: ["Yes", "No", "Only some"]
    }
  ];

  const currentQuestions = mode === 'crisis' ? crisisQuestions : prepQuestions;

  const handleModeSelection = (selectedMode: OnboardingMode) => {
    setMode(selectedMode);
    setStep(1);
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [step]: answer };
    setAnswers(newAnswers);
    if (step === 3) {
      completeOnboarding(mode!, newAnswers);
    }
    setStep(prev => prev + 1);
  };

  const calculateScore = () => {
    const values = Object.values(answers);
    const positiveAnswers = values.filter(v => v === 'Yes').length;
    return Math.round((positiveAnswers / 3) * 100);
  };

  // Render Result Screen
  if (step === 4) {
    const score = calculateScore();
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-12 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sage/10 text-sage rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-navy dark:text-white">Your Next Step is Ready.</h1>
          <p className="text-lg text-warm-slate">
            Based on your answers, your Family Readiness Score is starting at:
          </p>
        </div>

        <Card className="text-center p-8 bg-soft-sand/30">
          <div className="space-y-4">
            <div className="text-6xl font-black text-sage">{score}%</div>
            <ProgressBar value={score} className="h-4 max-w-sm mx-auto" />
            <p className="text-navy dark:text-soft-sand font-medium pt-4">
              We've prioritized your most urgent tasks—starting with:
              <span className="block text-calamity text-xl font-bold mt-1">
                {mode === 'crisis' ? "Immediate Care Notifications" : "Emergency Contact Setup"}
              </span>
            </p>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Button size="lg" className="w-full" onClick={() => navigate(mode === 'crisis' ? '/loss' : '/dashboard')}>
            View my step-by-step guidance
          </Button>
        </div>
      </div>
    );
  }

  // Render Question Screens
  if (step > 0) {
    const currentQuestion = currentQuestions[step - 1];
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-12">
        <div className="space-y-4">
          <ProgressBar value={(step / 3) * 100} className="h-2" />
          <p className="text-sm font-bold text-warm-slate uppercase tracking-widest">Question {step} of 3</p>
          <h1 className="text-3xl font-bold text-navy dark:text-white">{currentQuestion.question}</h1>
        </div>

        <div className="grid gap-4">
          {currentQuestion.options.map((option, idx) => (
            <Card 
              key={idx} 
              className="hover:border-calamity cursor-pointer transition-all active:scale-[0.98]"
              onClick={() => handleAnswer(option)}
            >
              <CardContent className="p-6 flex justify-between items-center text-navy dark:text-soft-sand">
                <span className="text-lg font-medium">{option}</span>
                <ArrowRight className="w-5 h-5 text-warm-slate" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <div className="bg-sage/10 p-3 rounded-xl">
            <Lightbulb className="w-5 h-5 text-sage" />
          </div>
          <p className="text-sm text-warm-slate italic">
            "Your answers help us tailor the guidance to your specific situation. There are no wrong answers here."
          </p>
        </div>
      </div>
    );
  }

  // Render Mode Selection (Initial Screen)
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-black text-navy dark:text-white leading-tight">
          Welcome to KinReady. <br />
          <span className="text-calamity">How can we support you today?</span>
        </h1>
        <p className="text-xl text-warm-slate max-w-2xl mx-auto">
          Whether you're navigating a crisis or building a plan for the future, we provide the path forward.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-4 border-2 border-transparent hover:border-rose-200 transition-all cursor-pointer group flex flex-col h-full" onClick={() => handleModeSelection('crisis')}>
          <CardContent className="space-y-6 flex-grow pt-6 text-navy dark:text-soft-sand">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Facing a loss?</h2>
              <p className="text-warm-slate leading-relaxed">
                We’re here to help you through the next 72 hours. Get a step-by-step checklist for the immediate aftermath so you can focus on your family.
              </p>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Button variant="danger" className="w-full bg-rose-600 hover:bg-rose-700">Help me through a loss</Button>
          </CardContent>
        </Card>

        <Card className="p-4 border-2 border-transparent hover:border-sage-200 transition-all cursor-pointer group flex flex-col h-full" onClick={() => handleModeSelection('prep')}>
          <CardContent className="space-y-6 flex-grow pt-6 text-navy dark:text-soft-sand">
            <div className="w-16 h-16 bg-sage/10 text-sage rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Planning ahead?</h2>
              <p className="text-warm-slate leading-relaxed">
                Give your family the gift of a clear plan. Organize your guidance—from medical wishes to financial access—so they never have to guess.
              </p>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Button variant="secondary" className="w-full">Build my readiness plan</Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8">
        <p className="text-warm-slate flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Not sure where to start? <Link to="/learn" className="text-calamity font-bold hover:underline">Explore our guides</Link>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
