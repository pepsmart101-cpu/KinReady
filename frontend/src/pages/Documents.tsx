import React, { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, Edit2, ExternalLink, Shield, Clock, Search, Filter, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import type { Document } from '../services/api';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../store/AuthContext';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const templates = [
    {
      id: 'letter-of-instruction',
      title: 'Letter of Instruction',
      description: 'A non-legal guide for your family on daily details, final wishes, and asset locations.',
      icon: FileText,
      category: 'General'
    },
    {
      id: 'emergency-contacts',
      title: 'Emergency Contact List',
      description: 'A centralized list of medical, professional, and personal contacts for quick access.',
      icon: Shield,
      category: 'Emergency'
    },
    {
      id: 'care-instructions',
      title: 'Dependent Care Plan',
      description: 'Specific instructions for the care of children, elders, or pets if you are unavailable.',
      icon: Clock,
      category: 'Care'
    }
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await apiService.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const handleCreateDocument = async () => {
    if (!newDocTitle) return;
    
    try {
      await apiService.createDocument({
        title: newDocTitle,
        contentEncrypted: JSON.stringify({ body: `This is a new document based on ${selectedTemplate?.title || 'a blank template'}.` }),
        templateId: selectedTemplate?.id
      });
      setIsCreateModalOpen(false);
      setNewDocTitle('');
      setSelectedTemplate(null);
      fetchDocuments();
    } catch (err) {
      alert('Failed to create document');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await apiService.deleteDocument(id);
      fetchDocuments();
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-warm-slate/20 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy mb-2">Sign in to manage documents</h2>
        <p className="text-warm-slate mb-6">Your documents are securely stored and encrypted.</p>
        <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy dark:text-white">My Documents</h1>
          <p className="text-warm-slate">Secure, guided document creation for your family readiness.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Browse Templates
          </Button>
          <Button 
            onClick={() => {
              setSelectedTemplate(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-navy text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Document
          </Button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-navy/40 p-4 rounded-2xl border border-warm-slate/10 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-slate" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="w-full pl-10 pr-4 py-2 bg-soft-sand/50 dark:bg-navy/20 border-none rounded-xl focus:ring-2 focus:ring-calamity text-navy dark:text-soft-sand"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-warm-slate flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-white dark:bg-navy animate-pulse border border-warm-slate/10"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-navy/20 rounded-3xl border border-dashed border-warm-slate/30">
          <FileText className="w-12 h-12 text-warm-slate/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-warm-slate">No documents yet</h3>
          <p className="text-warm-slate mb-6">Start by creating a document from a template or a blank one.</p>
          <Button onClick={() => setIsTemplateModalOpen(true)}>Explore Templates</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="group hover:border-calamity transition-all overflow-hidden flex flex-col">
              <div className="p-6 space-y-4 flex-grow">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-calamity/10 text-calamity rounded-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    doc.status === 'completed' ? 'bg-sage/10 text-sage' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy dark:text-white line-clamp-1">{doc.title}</h3>
                  <p className="text-sm text-warm-slate mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-warm-slate/5 bg-soft-sand/30 dark:bg-navy/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-white dark:hover:bg-navy rounded-lg text-warm-slate hover:text-calamity transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 hover:bg-white dark:hover:bg-navy rounded-lg text-warm-slate hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" className="text-calamity hover:bg-white dark:hover:bg-navy flex items-center gap-1">
                  View <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-calamity/5 border border-calamity/20 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-calamity flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-navy dark:text-white">Secure Storage</h4>
          <p className="text-warm-slate text-sm">
            All documents created in KinReady are encrypted and only accessible by you and the family members you explicitly authorize. We recommend reviewing your documents annually.
          </p>
        </div>
      </div>

      {/* Template Selection Modal */}
      <Modal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)}
        title="Choose a Template"
      >
        <div className="grid grid-cols-1 gap-4 py-4">
          {templates.map(template => (
            <div 
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template);
                setNewDocTitle(template.title);
                setIsTemplateModalOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="p-4 border border-warm-slate/10 rounded-xl hover:border-calamity hover:bg-calamity/5 cursor-pointer transition-all flex gap-4"
            >
              <div className="w-12 h-12 bg-white dark:bg-navy rounded-lg border border-warm-slate/10 flex items-center justify-center text-calamity flex-shrink-0">
                <template.icon className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-navy dark:text-white">{template.title}</h5>
                <p className="text-sm text-warm-slate">{template.description}</p>
              </div>
            </div>
          ))}
          <div 
            onClick={() => {
              setSelectedTemplate(null);
              setNewDocTitle('Untitled Document');
              setIsTemplateModalOpen(false);
              setIsCreateModalOpen(true);
            }}
            className="p-4 border border-dashed border-warm-slate/30 rounded-xl hover:bg-soft-sand cursor-pointer transition-all text-center"
          >
            <p className="font-medium text-warm-slate">Start with a Blank Document</p>
          </div>
        </div>
      </Modal>

      {/* Create Document Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={selectedTemplate ? `Create ${selectedTemplate.title}` : 'New Document'}
      >
        <div className="space-y-4 py-4">
          <Input
            label="Document Title"
            value={newDocTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocTitle(e.target.value)}
            placeholder="e.g. My Final Wishes"
          />
          <div className="bg-soft-sand/50 dark:bg-navy/30 p-4 rounded-xl border border-warm-slate/10">
            <p className="text-sm text-warm-slate">
              {selectedTemplate 
                ? `You're using the ${selectedTemplate.title} template. This will guide you through the necessary steps.`
                : "Starting from scratch. You can add sections and content as you go."}
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="flex-grow">
              Cancel
            </Button>
            <Button onClick={handleCreateDocument} className="bg-navy text-white flex-grow">
              Create Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Documents;
