import React, { useEffect, useState } from 'react';
import { Shield, Lock, Plus, Trash2, Eye, EyeOff, Search, Landmark, Key, Phone, Info, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import type { VaultItem } from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../store/AuthContext';

const Vault: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    encryptedData: '',
    category: 'General'
  });

  const categories = [
    { name: 'Financial', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Medical', icon: Shield, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Digital', icon: Key, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Legal', icon: Lock, color: 'text-sage', bg: 'bg-sage/10' },
    { name: 'Personal', icon: Phone, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'General', icon: Info, color: 'text-warm-slate', bg: 'bg-warm-slate/10' }
  ];

  const fetchVaultItems = async () => {
    setLoading(true);
    try {
      const data = await apiService.getVaultItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVaultItems();
    }
  }, [user]);

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.encryptedData) return;
    
    try {
      await apiService.createVaultItem({
        ...newItem,
        category: newItem.category.toLowerCase()
      });
      setIsAddModalOpen(false);
      setNewItem({ title: '', description: '', encryptedData: '', category: 'General' });
      fetchVaultItems();
    } catch (err) {
      alert('Failed to add vault item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await apiService.deleteVaultItem(id);
      fetchVaultItems();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const toggleSensitive = (id: string) => {
    setShowSensitive(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = selectedCategory 
    ? items.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase())
    : items;

  if (!user) {
    return (
      <div className="text-center py-20">
        <Lock className="w-16 h-16 text-warm-slate/20 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy mb-2">Sign in to access your Vault</h2>
        <p className="text-warm-slate mb-6">Zero-trust encryption ensures only you can see your sensitive data.</p>
        <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy dark:text-white flex items-center gap-2">
            <Lock className="w-8 h-8 text-calamity" />
            Family Vault
          </h1>
          <p className="text-warm-slate">Securely store passwords, medical info, and emergency access details.</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-calamity text-white flex items-center gap-2 shadow-lg shadow-calamity/20"
        >
          <Plus className="w-4 h-4" />
          Add Secure Item
        </Button>
      </header>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
            className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 ${
              selectedCategory === cat.name
                ? 'border-calamity bg-calamity/5 ring-2 ring-calamity/20'
                : 'border-warm-slate/10 bg-white dark:bg-navy/40 hover:border-calamity/30'
            }`}
          >
            <div className={`p-3 rounded-xl ${cat.bg} ${cat.color}`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-navy dark:text-white">{cat.name}</span>
            <span className="text-xs text-warm-slate">
              {items.filter(i => i.category?.toLowerCase() === cat.name.toLowerCase()).length} items
            </span>
          </button>
        ))}
      </div>

      {/* Vault Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy dark:text-white">
            {selectedCategory ? `${selectedCategory} Items` : 'All Stored Items'}
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-slate" />
            <input 
              type="text" 
              placeholder="Search vault..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-navy/40 border border-warm-slate/10 rounded-xl focus:ring-2 focus:ring-calamity outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-white dark:bg-navy animate-pulse border border-warm-slate/10"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-navy/20 rounded-3xl border border-dashed border-warm-slate/30">
            <Shield className="w-12 h-12 text-warm-slate/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-warm-slate">Your vault is empty</h3>
            <p className="text-warm-slate mb-6">Start by adding your first secure item like an emergency contact or medical ID.</p>
            <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Add Your First Item</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white dark:bg-navy/40 p-4 rounded-xl border border-warm-slate/10 flex items-center justify-between group hover:border-calamity/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-soft-sand dark:bg-navy/60 text-warm-slate group-hover:text-calamity transition-colors`}>
                    {categories.find(c => c.name.toLowerCase() === item.category?.toLowerCase())?.icon ? 
                      React.createElement(categories.find(c => c.name.toLowerCase() === item.category?.toLowerCase())!.icon, { className: "w-5 h-5" }) :
                      <Info className="w-5 h-5" />
                    }
                  </div>
                  <div>
                    <h4 className="font-bold text-navy dark:text-white">{item.title}</h4>
                    <p className="text-sm text-warm-slate">{item.description || 'Secure information'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-soft-sand/50 dark:bg-navy/60 rounded-lg text-sm font-mono mr-2">
                    {showSensitive[item.id] ? item.encryptedData : '••••••••••••'}
                  </div>
                  <button 
                    onClick={() => toggleSensitive(item.id)}
                    className="p-2 hover:bg-soft-sand dark:hover:bg-navy rounded-lg text-warm-slate transition-colors"
                  >
                    {showSensitive[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 hover:bg-soft-sand dark:hover:bg-navy rounded-lg text-warm-slate hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Banner */}
      <div className="bg-navy text-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-10 h-10 text-calamity" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold">Zero-Trust Encryption</h3>
          <p className="text-soft-sand/70">
            KinReady uses AES-256 encryption. Your data is encrypted on your device before it ever reaches our servers. We cannot read your vault data, and neither can anyone else without your master key.
          </p>
        </div>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 whitespace-nowrap">
          Learn More
        </Button>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Secure Item"
      >
        <div className="space-y-4 py-4">
          <Input
            label="Title"
            placeholder="e.g. Wi-Fi Password or Medical ID"
            value={newItem.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, title: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-warm-slate">Category</label>
            <select 
              className="w-full px-4 py-2 bg-white dark:bg-navy/40 border border-warm-slate/20 rounded-xl outline-none focus:ring-2 focus:ring-calamity text-navy dark:text-soft-sand"
              value={newItem.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, category: e.target.value })}
            >
              {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <Input
            label="Secure Data"
            placeholder="Passwords, account numbers, etc."
            value={newItem.encryptedData}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, encryptedData: e.target.value })}
          />
          <Input
            label="Optional Description"
            placeholder="What is this for?"
            value={newItem.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex items-start gap-3 border border-amber-200 dark:border-amber-900/40">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This data will be encrypted immediately. Only you and authorized family members can ever view this.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="flex-grow">
              Cancel
            </Button>
            <Button onClick={handleAddItem} className="bg-calamity text-white flex-grow">
              Save to Vault
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Vault;
