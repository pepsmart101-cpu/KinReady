import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OnboardingData {
  mode: 'crisis' | 'prep' | null;
  answers: Record<number, string>;
  readinessScore: number;
}

interface UserContextType {
  onboarding: OnboardingData;
  setOnboarding: React.Dispatch<React.SetStateAction<OnboardingData>>;
  completeOnboarding: (mode: 'crisis' | 'prep', answers: Record<number, string>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboarding, setOnboarding] = useState<OnboardingData>(() => {
    const saved = localStorage.getItem('kinready_onboarding');
    return saved ? JSON.parse(saved) : { mode: null, answers: {}, readinessScore: 0 };
  });

  useEffect(() => {
    localStorage.setItem('kinready_onboarding', JSON.stringify(onboarding));
  }, [onboarding]);

  const calculateScore = (answers: Record<number, string>) => {
    const values = Object.values(answers);
    if (values.length === 0) return 0;
    const positiveAnswers = values.filter(v => v === 'Yes').length;
    return Math.round((positiveAnswers / values.length) * 100);
  };

  const completeOnboarding = (mode: 'crisis' | 'prep', answers: Record<number, string>) => {
    const score = calculateScore(answers);
    setOnboarding({ mode, answers, readinessScore: score });
  };

  return (
    <UserContext.Provider value={{ onboarding, setOnboarding, completeOnboarding }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
