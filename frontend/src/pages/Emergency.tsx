import React, { useState } from 'react';
import { 
  PhoneCall, 
  AlertTriangle, 
  Heart, 
  Phone, 
  Users, 
  ChevronRight, 
  ChevronDown,
  Activity,
  Home,
  MessageSquare,
  ShieldAlert,
  Flame,
  Stethoscope
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const Emergency: React.FC = () => {
  const [showScript, setShowScript] = useState<string | null>(null);

  const emergencyContacts = [
    { name: "Jane Doe (Spouse)", phone: "555-0123", relation: "Primary" },
    { name: "Dr. Smith (PCP)", phone: "555-9876", relation: "Doctor" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
      {/* Critical Header */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-600 text-white rounded-full animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-navy dark:text-white">Emergency Help</h1>
        <p className="text-warm-slate max-w-lg mx-auto">
          Take a deep breath. We've gathered the most important contacts and scripts for you right here.
        </p>
      </div>

      {/* Immediate Action Buttons - Large & Easy to Tap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="danger" 
          className="h-24 text-xl font-black flex justify-between px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none"
          onClick={() => window.open('tel:911')}
        >
          <span className="flex items-center gap-4">
            <Flame className="w-8 h-8" /> Call 911
          </span>
          <PhoneCall className="w-6 h-6" />
        </Button>
        <Button 
          variant="primary" 
          className="h-24 text-xl font-black flex justify-between px-8 rounded-2xl shadow-lg shadow-calamity/20 dark:shadow-none"
          onClick={() => window.open('tel:988')}
        >
          <span className="flex items-center gap-4">
            <Heart className="w-8 h-8" /> Crisis Hotline
          </span>
          <PhoneCall className="w-6 h-6" />
        </Button>
      </div>

      {/* Emergency Contacts Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-navy dark:text-white">
            <Users className="w-5 h-5 text-calamity" />
            Your Emergency Contacts
          </h2>
          <Button variant="ghost" size="sm" className="text-calamity font-bold p-0">+ Add Contact</Button>
        </div>
        <div className="grid gap-4">
          {emergencyContacts.map((contact, i) => (
            <Card key={i} className="hover:border-calamity/30 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-soft-sand dark:bg-navy/50 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-warm-slate" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy dark:text-soft-sand">{contact.name}</h4>
                    <p className="text-xs font-bold text-warm-slate uppercase">{contact.relation}</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="rounded-full w-12 h-12 p-0"
                  onClick={() => window.open(`tel:${contact.phone}`)}
                >
                  <Phone className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hospital/Insurance Scripts */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-navy dark:text-white px-2">
          <MessageSquare className="w-5 h-5 text-calamity" />
          Helpful Phone Scripts
        </h2>
        
        <div className="space-y-4">
          <Card 
            className="cursor-pointer hover:border-calamity/30 transition-all border-l-4 border-l-calamity"
            onClick={() => setShowScript(showScript === 'utility' ? null : 'utility')}
          >
            <CardHeader className="p-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-calamity/10 p-2 rounded-lg text-calamity">
                  <Home className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">Managing Utilities After Loss</span>
              </div>
              {showScript === 'utility' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </CardHeader>
            {showScript === 'utility' && (
              <CardContent className="bg-soft-sand/20 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <p className="text-xs font-black text-warm-slate uppercase tracking-widest">What to say:</p>
                  <div className="bg-white dark:bg-navy p-4 rounded-xl border border-warm-slate/10 italic text-navy dark:text-soft-sand">
                    "Hello, I am calling regarding the electric account for [Service Address]. The current account holder, [Deceased Name], has passed away. I am the [Next of Kin/Executor] and I am calling to manage the account."
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-warm-slate uppercase">Have Ready:</p>
                    <ul className="text-xs space-y-1 text-navy/70 dark:text-soft-sand/70">
                      <li>• Account Number</li>
                      <li>• Service Address</li>
                      <li>• Date of Passing</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-warm-slate uppercase">Pro-Tip:</p>
                    <p className="text-[10px] text-warm-slate italic">Ask about credit balances to be issued to the Estate.</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card 
            className="cursor-pointer hover:border-calamity/30 transition-all border-l-4 border-l-sage"
            onClick={() => setShowScript(showScript === 'hospital' ? null : 'hospital')}
          >
            <CardHeader className="p-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-sage/10 p-2 rounded-lg text-sage">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">Hospital & Medical Inquiries</span>
              </div>
              {showScript === 'hospital' ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </CardHeader>
            {showScript === 'hospital' && (
              <CardContent className="bg-soft-sand/20 p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-white dark:bg-navy p-4 rounded-xl border border-warm-slate/10 italic text-navy dark:text-soft-sand">
                  "Hello, I am calling to inquire about the status of [Patient Name]. I am their [Relationship] and their designated healthcare proxy. Can you connect me with their attending physician or a nurse coordinator?"
                </div>
                <div className="p-4 bg-sage/5 rounded-lg border border-sage/10">
                  <p className="text-xs font-bold text-sage mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Note:
                  </p>
                  <p className="text-xs text-warm-slate italic">If they ask for proof, mention that you have the Advance Healthcare Directive ready to send via email or fax.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </section>

      {/* Local Resources Placeholder */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy dark:text-white px-2">Local Care Facilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col items-center text-center space-y-2 bg-soft-sand/20">
            <Activity className="w-8 h-8 text-calamity" />
            <h4 className="font-bold text-sm">Urgent Care</h4>
            <p className="text-[10px] text-warm-slate">Find facilities near you</p>
            <Button variant="ghost" size="sm" className="text-xs font-bold">Search Map</Button>
          </Card>
          <Card className="p-4 flex flex-col items-center text-center space-y-2 bg-soft-sand/20">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <h4 className="font-bold text-sm">ER Wait Times</h4>
            <p className="text-[10px] text-warm-slate">Real-time local data</p>
            <Button variant="ghost" size="sm" className="text-xs font-bold">Check Wait</Button>
          </Card>
          <Card className="p-4 flex flex-col items-center text-center space-y-2 bg-soft-sand/20">
            <MessageSquare className="w-8 h-8 text-sage" />
            <h4 className="font-bold text-sm">Advice Nurse</h4>
            <p className="text-[10px] text-warm-slate">24/7 Medical Advice</p>
            <Button variant="ghost" size="sm" className="text-xs font-bold">Call Now</Button>
          </Card>
        </div>
      </section>

      {/* Calming Footer */}
      <div className="text-center space-y-4 pt-10">
        <div className="w-12 h-1 bg-warm-slate/10 mx-auto rounded-full"></div>
        <p className="text-warm-slate text-sm italic font-serif">
          "Focus on the next right thing. You are stronger than you feel in this moment."
        </p>
      </div>
    </div>
  );
};

export default Emergency;
