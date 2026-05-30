import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Moon, 
  Shield, 
  Eye, 
  Lock, 
  Save,
  ChevronRight,
  UserCheck,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { apiService } from '../services/api';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: false,
    shareProgress: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = await apiService.getMe();
        if (user.theme) setDarkMode(user.theme === 'dark');
        
        if (user.notification_preferences) {
          try {
            const prefs = JSON.parse(user.notification_preferences);
            setNotifications(prefs);
          } catch (e) {
            console.error('Failed to parse notification preferences', e);
          }
        }

        if (user.privacy_settings) {
          try {
            const priv = JSON.parse(user.privacy_settings);
            setPrivacy(priv);
          } catch (e) {
            console.error('Failed to parse privacy settings', e);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await apiService.updateMe({
        theme: darkMode ? 'dark' : 'light',
        notificationPreferences: JSON.stringify(notifications),
        privacySettings: JSON.stringify(privacy)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-10 h-10 text-calamity animate-spin mb-4" />
        <p className="text-warm-slate font-medium">Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-serif font-bold text-navy dark:text-white">Settings</h1>
        <p className="text-warm-slate mt-2">Manage your account preferences and application settings.</p>
      </header>

      <div className="grid gap-6">
        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2 text-navy dark:text-soft-sand">
              <Moon className="w-5 h-5 text-calamity" />
              Appearance
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-medium text-navy dark:text-soft-sand">Dark Mode</p>
                <p className="text-sm text-warm-slate">Switch between light and dark themes</p>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-transparent ${darkMode ? 'bg-calamity' : 'bg-warm-slate/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2 text-navy dark:text-soft-sand">
              <Bell className="w-5 h-5 text-sage" />
              Notifications
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-medium text-navy dark:text-soft-sand">Email Notifications</p>
                <p className="text-sm text-warm-slate">Receive critical updates and alerts via email</p>
              </div>
              <button 
                onClick={() => toggleNotification('email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.email ? 'bg-sage' : 'bg-warm-slate/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-medium text-navy dark:text-soft-sand">Push Notifications</p>
                <p className="text-sm text-warm-slate">Get real-time alerts on your mobile devices</p>
              </div>
              <button 
                onClick={() => toggleNotification('push')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.push ? 'bg-sage' : 'bg-warm-slate/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-2 border-t border-warm-slate/10 pt-6">
              <div>
                <p className="font-medium text-navy dark:text-soft-sand">Weekly Readiness Checklist</p>
                <p className="text-sm text-warm-slate">Receive a weekly summary of pending preparation tasks</p>
              </div>
              <button 
                onClick={() => toggleNotification('weekly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.weekly ? 'bg-sage' : 'bg-warm-slate/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.weekly ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2 text-navy dark:text-soft-sand">
              <Lock className="w-5 h-5 text-calamity" />
              Privacy & Data
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-medium text-navy dark:text-soft-sand">Public Profile</p>
                <p className="text-sm text-warm-slate">Allow other users to search for you by name</p>
              </div>
              <button 
                onClick={() => togglePrivacy('profileVisible')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.profileVisible ? 'bg-calamity' : 'bg-warm-slate/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.profileVisible ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-medium text-navy dark:text-soft-sand">Share Readiness Progress</p>
                <p className="text-sm text-warm-slate">Allow authorized family members to see your completion score</p>
              </div>
              <button 
                onClick={() => togglePrivacy('shareProgress')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacy.shareProgress ? 'bg-calamity' : 'bg-warm-slate/30'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacy.shareProgress ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-sage/10 text-sage p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">Settings saved successfully</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>Reset Changes</Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-navy text-white flex items-center gap-2 px-8"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
