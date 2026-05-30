import React from 'react';
import { Shield, Heart, HelpCircle, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const faqs = [
    {
      q: "Is KinReady a legal service?",
      a: "No, KinReady is a family readiness and life event guidance system. We provide education, checklists, and tools to help you organize your wishes and navigate difficult times, but we do not provide legal advice or document filing."
    },
    {
      q: "Who is this for?",
      a: "KinReady is for anyone who wants to be prepared. This includes parents, caregivers of aging relatives, and people who are currently navigating the immediate aftermath of a loss."
    },
    {
      q: "How does the Readiness Score work?",
      a: "Your score is calculated based on the essential tasks you've completed in your KinReady plan, covering categories like Health, Security, and Emergency Access."
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-24 space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-navy dark:text-white leading-tight">
            Know what to do next, <br />
            <span className="text-calamity">even in life’s hardest moments.</span>
          </h1>
          <p className="text-xl md:text-2xl text-warm-slate max-w-2xl mx-auto leading-relaxed">
            Whether you’re navigating the first 72 hours of a loss or building a family readiness plan for the future, KinReady gives you clear, step-by-step guidance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link to="/onboarding">
            <Button size="lg" className="px-10 h-14 text-lg w-full sm:w-auto">
              I Need Help Right Now
            </Button>
          </Link>
          <Link to="/onboarding">
            <Button variant="outline" size="lg" className="px-10 h-14 text-lg w-full sm:w-auto">
              I Want to Prepare My Family
            </Button>
          </Link>
        </div>
      </section>

      {/* The 72-Hour Wedge */}
      <section className="grid md:grid-cols-2 gap-12 items-center bg-rose-50/50 dark:bg-rose-900/10 rounded-[3rem] p-8 md:p-16 border border-rose-100 dark:border-rose-900/20">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black text-navy dark:text-white">Navigating a loss? Start here.</h2>
          <p className="text-lg text-warm-slate leading-relaxed">
            The first few days after a loved one passes away are a blur. We’ve broken down exactly what needs to happen—from legal pronouncements to securing the home—into simple, manageable steps.
          </p>
          <Link to="/loss" className="inline-flex items-center text-rose-600 font-black text-lg hover:underline gap-2">
            View the 72-Hour Guidance <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="relative">
          <Card className="shadow-2xl rotate-2">
            <CardContent className="p-8 space-y-4">
              <div className="flex justify-between items-center border-b border-warm-slate/10 pb-4">
                <span className="font-bold">First 72 Hours Checklist</span>
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Active Guide</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border-2 border-rose-500" />
                  <span className="text-sm font-medium">Obtain Pronouncement of Death</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border-2 border-rose-500" />
                  <span className="text-sm font-medium">Secure the Property</span>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-5 h-5 rounded border-2 border-warm-slate" />
                  <span className="text-sm font-medium">Choose a Funeral Home</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Family Readiness: The Big Picture */}
      <section className="space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-navy dark:text-white">Replace "I don't know" with a plan.</h2>
          <p className="text-lg text-warm-slate">Most families aren't ready for an emergency or a sudden life change. KinReady helps you build "readiness" through guided checklists.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Emergency Access", 
              desc: "How your family pays bills if you can’t.", 
              icon: <HelpCircle className="w-6 h-6" />,
              color: "bg-amber-100 text-amber-600"
            },
            { 
              title: "Medical Voice", 
              desc: "Who speaks for you in a crisis.", 
              icon: <Shield className="w-6 h-6" />,
              color: "bg-sage/20 text-sage"
            },
            { 
              title: "Digital Legacy", 
              desc: "Managing your online life and passwords.", 
              icon: <CheckCircle2 className="w-6 h-6" />,
              color: "bg-calamity/10 text-calamity"
            }
          ].map((item, i) => (
            <Card key={i} className="hover:border-calamity transition-all">
              <CardContent className="p-8 space-y-4">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-warm-slate">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why KinReady? */}
      <section className="bg-navy text-white rounded-[3rem] p-8 md:p-20 overflow-hidden relative">
        <div className="grid md:grid-cols-2 gap-16 relative z-10">
          <div className="space-y-8">
            <h2 className="text-4xl font-black">Why KinReady?</h2>
            <div className="space-y-6">
              {[
                { title: "1. Step-by-Step, Not All-at-Once", desc: "We don't overwhelm you. We give you the 'next right step' based on your specific situation." },
                { title: "2. Plain Language Only", desc: "No legal jargon or confusing terms. We explain everything in a way that actually makes sense." },
                { title: "3. Supporting Tools", desc: "Need to organize your wishes? We provide the guidance and simple tools to document them as you go." }
              ].map((point, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-xl font-bold text-calamity">{point.title}</h4>
                  <p className="text-soft-sand/70 leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-full max-w-sm aspect-square bg-calamity/20 rounded-full flex items-center justify-center animate-pulse">
               <Shield className="w-32 h-32 text-calamity" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto space-y-12">
        <h2 className="text-4xl font-black text-navy dark:text-white text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="cursor-pointer overflow-hidden" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-lg">{faq.q}</h4>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && (
                  <p className="mt-4 text-warm-slate leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center space-y-8 bg-soft-sand dark:bg-navy/30 rounded-[3rem] p-12 md:p-24 border border-warm-slate/10">
        <h2 className="text-4xl md:text-5xl font-black text-navy dark:text-white">Give your family the gift of clarity.</h2>
        <Button size="lg" className="px-12 h-16 text-xl">
          Start Your Readiness Plan
        </Button>
        <p className="text-sm text-warm-slate italic">
          *Disclaimer: This information is educational and not legal advice. KinReady is a family readiness and life event guidance system.
        </p>
      </section>
    </div>
  );
};

export default Home;
