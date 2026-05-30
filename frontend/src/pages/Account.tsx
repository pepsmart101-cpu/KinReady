import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Copy,
  RefreshCw,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { apiService } from '../services/api';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const Account: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mfaData, setMfaData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaStatus, setMfaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const handleUpdateProfile = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      await apiService.updateMe(editForm);
      updateUser({ 
        first_name: editForm.firstName, 
        last_name: editForm.lastName 
      });
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleExportData = async () => {
    setError(null);
    try {
      const data = await apiService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kinready_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Data export started');
    } catch (err: any) {
      setError('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('ARE YOU SURE? This will permanently delete your account and ALL your family readiness data. This action cannot be undone.')) {
      setError(null);
      try {
        await apiService.deleteMe();
        logout();
        window.location.href = '/';
      } catch (err: any) {
        setError('Failed to delete account');
      }
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setPasswordStatus('loading');
    try {
      await apiService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordStatus('success');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStatus('idle');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      setPasswordStatus('error');
    }
  };

  const handleSetupMFA = async () => {
    setIsMfaModalOpen(true);
    setMfaStatus('loading');
    try {
      const data = await apiService.setupMFA();
      setMfaData(data);
      setMfaStatus('idle');
    } catch (err: any) {
      setError('Failed to initiate MFA setup');
      setMfaStatus('error');
    }
  };

  const handleVerifyMFA = async () => {
    if (!mfaToken) return;
    setMfaStatus('loading');
    try {
      await apiService.verifyMFA(mfaToken);
      setMfaStatus('success');
      setTimeout(() => {
        setIsMfaModalOpen(false);
        setMfaData(null);
        setMfaToken('');
        setMfaStatus('idle');
      }, 2000);
    } catch (err: any) {
      setError('Invalid MFA token. Please try again.');
      setMfaStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-serif font-bold text-navy dark:text-white">Account Settings</h1>
        <p className="text-warm-slate mt-2">Manage your profile, security, and data.</p>
      </header>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2 text-navy dark:text-soft-sand">
              <User className="w-5 h-5 text-calamity" />
              Profile Information
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="bg-sage/10 text-sage p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-warm-slate mb-1">First Name</p>
                {isEditing ? (
                  <Input
                    value={editForm.firstName}
                    onChange={(e: any) => setEditForm({ ...editForm, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="p-3 bg-soft-sand/30 rounded-xl border border-warm-slate/10 text-navy dark:text-soft-sand font-medium">
                    {user?.first_name || 'Not set'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-warm-slate mb-1">Last Name</p>
                {isEditing ? (
                  <Input
                    value={editForm.lastName}
                    onChange={(e: any) => setEditForm({ ...editForm, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="p-3 bg-soft-sand/30 rounded-xl border border-warm-slate/10 text-navy dark:text-soft-sand font-medium">
                    {user?.last_name || 'Not set'}
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-warm-slate mb-1">Email Address</p>
              <div className="p-3 bg-soft-sand/30 rounded-xl border border-warm-slate/10 text-navy dark:text-soft-sand font-medium flex items-center justify-between opacity-70">
                <span>{user?.email}</span>
                <Mail className="w-4 h-4 text-warm-slate" />
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleUpdateProfile} className="bg-sage text-white">Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </>
              ) : (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2 text-navy dark:text-soft-sand">
              <Shield className="w-5 h-5 text-sage" />
              Security & Authentication
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-navy dark:text-soft-sand">Two-Factor Authentication (MFA)</p>
                <p className="text-sm text-warm-slate max-w-md mt-1">
                  Add an extra layer of security to your account by requiring a code from your phone to sign in.
                </p>
              </div>
              <Button 
                onClick={handleSetupMFA}
                className="bg-calamity text-white flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Enable MFA
              </Button>
            </div>

            <div className="border-t border-warm-slate/10 pt-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-navy dark:text-soft-sand">Password</p>
                <p className="text-sm text-warm-slate mt-1">Change your password regularly to stay secure.</p>
              </div>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsPasswordModalOpen(true)}>
                <Key className="w-4 h-4" />
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2 text-navy dark:text-soft-sand">
              <Shield className="w-5 h-5 text-calamity" />
              Data & Privacy
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-navy dark:text-soft-sand">Export My Data</p>
                <p className="text-sm text-warm-slate mt-1">Download a copy of all your documents and vault items in an encrypted format.</p>
              </div>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportData}>
                <Download className="w-4 h-4" />
                Download JSON
              </Button>
            </div>

            <div className="border-t border-warm-slate/10 pt-6 flex items-center justify-between">
              <div>
                <p className="font-bold text-red-600">Delete Account</p>
                <p className="text-sm text-warm-slate mt-1">Permanently remove your account and all associated data. This action cannot be undone.</p>
              </div>
              <Button onClick={handleDeleteAccount} className="bg-red-50 text-red-600 hover:bg-red-100 border-none flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA Setup Modal */}
      <Modal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
        title="Setup Two-Factor Authentication"
      >
        <div className="py-4 space-y-6">
          {mfaStatus === 'loading' && !mfaData ? (
            <div className="flex flex-col items-center justify-center py-10">
              <RefreshCw className="w-10 h-10 text-calamity animate-spin mb-4" />
              <p className="text-warm-slate">Generating your secret key...</p>
            </div>
          ) : mfaData ? (
            <>
              <div className="space-y-4">
                <p className="text-navy dark:text-soft-sand font-medium">1. Scan this QR code</p>
                <p className="text-sm text-warm-slate">
                  Open your authenticator app (like Google Authenticator or Authy) and scan the code below.
                </p>
                <div className="flex justify-center p-4 bg-white rounded-2xl border border-warm-slate/10 max-w-[200px] mx-auto shadow-sm">
                  <img src={mfaData.qrCode} alt="MFA QR Code" className="w-full h-auto" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-navy dark:text-soft-sand font-medium">2. Or enter the code manually</p>
                <div className="flex items-center gap-2 p-3 bg-soft-sand/50 rounded-xl border border-warm-slate/10 font-mono text-sm break-all">
                  <span className="flex-grow">{mfaData.secret}</span>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-warm-slate">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-warm-slate/10">
                <p className="text-navy dark:text-soft-sand font-medium">3. Verify the setup</p>
                <p className="text-sm text-warm-slate">
                  Enter the 6-digit code from your authenticator app to complete the setup.
                </p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="000 000"
                    value={mfaToken}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMfaToken(e.target.value)}
                    className="text-center text-2xl tracking-[0.5em] font-bold h-14"
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleVerifyMFA}
                    disabled={mfaToken.length !== 6 || mfaStatus === 'loading'}
                    className="bg-navy text-white h-14 px-8"
                  >
                    {mfaStatus === 'loading' ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          {mfaStatus === 'success' && (
            <div className="bg-sage/10 text-sage p-6 rounded-2xl flex flex-col items-center gap-4 text-center animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12" />
              <div>
                <p className="font-bold text-lg">MFA Enabled Successfully</p>
                <p className="text-sm">Your account is now more secure.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Your Password"
      >
        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-warm-slate mb-1">Current Password</p>
              <div className="relative">
                <Input
                  type={showPasswords.old ? 'text' : 'password'}
                  value={passwordForm.oldPassword}
                  onChange={(e: any) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-slate"
                  onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                >
                  {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-warm-slate mb-1">New Password</p>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e: any) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-slate"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-warm-slate mb-1">Confirm New Password</p>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e: any) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-slate"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-warm-slate/10">
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleChangePassword}
              disabled={passwordStatus === 'loading' || !passwordForm.oldPassword || !passwordForm.newPassword}
              className="bg-navy text-white px-8"
            >
              {passwordStatus === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </Button>
          </div>

          {passwordStatus === 'success' && (
            <div className="bg-sage/10 text-sage p-4 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium">Password updated successfully</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Account;
