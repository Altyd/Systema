import { useEffect, useState } from 'react';
import { ArchitectureCanvas } from './components/canvas/ArchitectureCanvas';
import { MetadataPanel } from './components/panels/MetadataPanel';
import { ValidationPanel } from './components/panels/ValidationPanel';
import { AuthModal } from './components/auth/AuthModal';
import { CollaborateModal } from './components/modals/CollaborateModal';
import { LoadArchitectureModal } from './components/modals/LoadArchitectureModal';
import { WikiModal } from './components/modals/WikiModal';
import { Tutorial } from './components/tutorial/Tutorial';
import { TutorialPrompt } from './components/tutorial/TutorialPrompt';
import { useArchitectureStore } from './store/architectureStore';
import { useAuth } from './contexts/AuthContext';
import { Architecture } from './types';
import { saveArchitecture, loadUserArchitectures } from './lib/architectureService';
import { Save, FileText, Users, Download, LogOut, LogIn, FolderOpen, Plus, GraduationCap, BookOpen } from 'lucide-react';
import { createDemoArchitecture } from './data/demoArchitecture';

function App() {
  const { currentArchitecture, setCurrentArchitecture, updateArchitectureMetadata, selectedNodeId, toggleMetadataPanel } = useArchitectureStore();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCollaborateModalOpen, setIsCollaborateModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isLoadingArchitecture, setIsLoadingArchitecture] = useState(true);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isWikiModalOpen, setIsWikiModalOpen] = useState(false);

  // Load architecture on mount or when user changes - either user's latest or demo
  useEffect(() => {
    const loadInitialArchitecture = async () => {
      // Wait for auth to finish loading
      if (authLoading) return;
      
      const currentUserId = user?.id || null;
      
      // Only load if we haven't loaded for this specific user yet
      if (loadedForUserId === currentUserId) return;
      
      setLoadedForUserId(currentUserId);
      setIsLoadingArchitecture(true);

      // If user is logged in, try to load their most recent architecture
      if (user) {
        const { data: architectures, error } = await loadUserArchitectures(user.id);
        
        if (!error && architectures && architectures.length > 0) {
          // Load the most recent architecture (already sorted by updated_at desc)
          const latestArch = architectures[0];
          const loadedArchitecture: Architecture = {
            ...latestArch.data,
            id: latestArch.id,
            createdBy: latestArch.created_by,
            createdAt: latestArch.created_at,
            updatedAt: latestArch.updated_at,
            version: latestArch.version,
            isPublic: latestArch.is_public,
          };
          setCurrentArchitecture(loadedArchitecture);
          setIsLoadingArchitecture(false);
          return;
        }
      }

      // No user or no saved architectures - load demo
      const demoArchitecture = createDemoArchitecture(user?.id || 'demo-user');
      setCurrentArchitecture(demoArchitecture);
      setIsLoadingArchitecture(false);

      // Check if this is a new user who hasn't seen the tutorial
      if (user) {
        const hasSeenTutorial = localStorage.getItem(`tutorial-seen-${user.id}`);
        if (!hasSeenTutorial) {
          setShowTutorialPrompt(true);
        }
      }
    };

    loadInitialArchitecture();
  }, [user, authLoading, setCurrentArchitecture, loadedForUserId]);

  // Open metadata panel when a node is selected
  useEffect(() => {
    if (selectedNodeId) {
      toggleMetadataPanel();
    }
  }, [selectedNodeId]);

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save architectures');
      setIsAuthModalOpen(true);
      return;
    }
    if (!currentArchitecture) return;

    setIsSaving(true);
    setSaveStatus('saving');

    // Generate a proper UUID if it's still the demo ID
    const archToSave = {
      ...currentArchitecture,
      id: currentArchitecture.id === 'demo-1' 
        ? crypto.randomUUID() 
        : currentArchitecture.id,
      createdBy: user.id,
      updatedAt: new Date().toISOString(),
    };

    const { error } = await saveArchitecture(archToSave, user.id, user.email || undefined);

    if (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      alert(`Failed to save: ${error.message}`);
    } else {
      setSaveStatus('saved');
      // Update the current architecture with the saved ID
      setCurrentArchitecture(archToSave);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }

    setIsSaving(false);
  };

  const handleLoadArchitecture = (architecture: Architecture) => {
    setCurrentArchitecture(architecture);
  };

  const handleStartEditName = () => {
    if (currentArchitecture) {
      setEditingName(currentArchitecture.name);
      setIsEditingName(true);
    }
  };

  const handleSaveName = () => {
    if (editingName.trim()) {
      updateArchitectureMetadata({ name: editingName.trim() });
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditingName('');
  };

  const handleStartTutorial = () => {
    setShowTutorialPrompt(false);
    setIsTutorialActive(true);
    if (user) {
      localStorage.setItem(`tutorial-seen-${user.id}`, 'true');
    }
  };

  const handleSkipTutorial = () => {
    setShowTutorialPrompt(false);
    if (user) {
      localStorage.setItem(`tutorial-seen-${user.id}`, 'true');
    }
  };

  const handleCloseTutorial = () => {
    setIsTutorialActive(false);
  };

  const handleNewArchitecture = () => {
    const newArchitecture: Architecture = {
      id: crypto.randomUUID(),
      name: 'New Architecture',
      description: 'Describe your system architecture',
      problemStatement: '',
      constraints: [],
      assumptions: [],
      nonGoals: [],
      knownFailureScenarios: [],
      components: [],
      connections: [],
      annotations: [],
      status: 'Incomplete',
      currentState: 'Normal',
      createdBy: user?.id || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      collaborators: [],
      isPublic: false,
    };
    setCurrentArchitecture(newArchitecture);
  };

  const handleExport = () => {
    if (!currentArchitecture) return;
    // Export as JSON
    const dataStr = JSON.stringify(currentArchitecture, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${currentArchitecture.name.replace(/\s+/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-system-bg text-white">
      {/* Header */}
      <header className="h-14 border-b border-system-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">SystemA</h1>
          {currentArchitecture && (
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelEditName();
                    }}
                    onBlur={handleSaveName}
                    autoFocus
                    className="bg-system-bg border border-system-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
              ) : (
                <span 
                  className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={handleStartEditName}
                  title="Click to edit name"
                >
                  {currentArchitecture.name}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-system-hover"
                >
                  {user.email}
                </button>
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-system-bg border border-system-border rounded-lg shadow-xl z-50">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsWikiModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-system-hover transition-colors text-left rounded-t-lg"
                      >
                        <BookOpen className="w-4 h-4" />
                        Component Guide
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setIsTutorialActive(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-system-hover transition-colors text-left"
                      >
                        <GraduationCap className="w-4 h-4" />
                        Start Tutorial
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-system-hover transition-colors text-left rounded-b-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleNewArchitecture}
                className="flex items-center gap-2 px-3 py-1.5 border border-system-border rounded hover:bg-system-hover transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
              <button
                onClick={() => setIsLoadModalOpen(true)}
                title="Open"
                className="flex items-center gap-2 px-3 py-1.5 border border-system-border rounded hover:bg-system-hover transition-colors text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                Open
              </button>
              <button 
                onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                title="Details"
                className="flex items-center gap-2 px-3 py-1.5 border border-system-border rounded hover:bg-system-hover transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                Details
              </button>
              <button 
                onClick={() => setIsCollaborateModalOpen(true)}
                title="Collaborate"
                className="flex items-center gap-2 px-3 py-1.5 border border-system-border rounded hover:bg-system-hover transition-colors text-sm"
              >
                <Users className="w-4 h-4" />
                Collaborate
              </button>
              <button 
                onClick={handleExport}
                title="Export"
                className="flex items-center gap-2 px-3 py-1.5 border border-system-border rounded hover:bg-system-hover transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                title="Save"
                className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm font-medium ${
                  saveStatus === 'saved' 
                    ? 'bg-green-600 text-white' 
                    : saveStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-black hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                <Save className="w-4 h-4" />
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-1.5 border border-red-500 text-red-400 rounded hover:bg-red-900/20 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 relative">
        <ArchitectureCanvas />
        <MetadataPanel />
        <ValidationPanel />
        
        {/* Details Panel */}
        {showDetailsPanel && currentArchitecture && (
          <div className="fixed left-4 top-20 w-96 bg-system-bg border border-system-border rounded-lg p-4 text-white z-40 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">Architecture Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Name:</span>
                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelEditName();
                      }}
                      onBlur={handleSaveName}
                      autoFocus
                      className="bg-system-bg border border-system-border rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white flex-1"
                    />
                  </div>
                ) : (
                  <p 
                    className="text-white cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={handleStartEditName}
                    title="Click to edit name"
                  >
                    {currentArchitecture.name}
                  </p>
                )}
              </div>
              <div>
                <span className="text-gray-400">Description:</span>
                <p className="text-white">{currentArchitecture.description}</p>
              </div>
              <div>
                <span className="text-gray-400">Problem Statement:</span>
                <p className="text-white">{currentArchitecture.problemStatement}</p>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  currentArchitecture.status === 'Valid' ? 'bg-green-900/20 text-green-400 border border-green-500' :
                  currentArchitecture.status === 'Risky' ? 'bg-red-900/20 text-red-400 border border-red-500' :
                  'bg-yellow-900/20 text-yellow-400 border border-yellow-500'
                }`}>
                  {currentArchitecture.status}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Components:</span>
                <p className="text-white">{currentArchitecture.components.length}</p>
              </div>
              <div>
                <span className="text-gray-400">Connections:</span>
                <p className="text-white">{currentArchitecture.connections.length}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetailsPanel(false)}
              className="mt-4 w-full px-3 py-2 border border-system-border rounded hover:bg-system-hover transition-colors text-sm"
            >
              Close
            </button>
          </div>
        )}
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {currentArchitecture && (
        <CollaborateModal
          isOpen={isCollaborateModalOpen}
          onClose={() => setIsCollaborateModalOpen(false)}
          architectureId={currentArchitecture.id}
          architectureName={currentArchitecture.name}
          ownerId={currentArchitecture.createdBy}
          isPublic={currentArchitecture.isPublic || false}
          publicLink={null}
        />
      )}

      {user && (
        <LoadArchitectureModal
          isOpen={isLoadModalOpen}
          onClose={() => setIsLoadModalOpen(false)}
          userId={user.id}
          onLoad={handleLoadArchitecture}
        />
      )}

      <WikiModal
        isOpen={isWikiModalOpen}
        onClose={() => setIsWikiModalOpen(false)}
      />

      {/* Loading indicator or sign-in prompt */}
      {authLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-system-bg border border-system-border rounded-lg p-8 text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p>Checking authentication...</p>
            </div>
          </div>
        </div>
      )}
      
      {!authLoading && !user && !isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-system-bg border border-system-border rounded-lg p-8 text-white max-w-md">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold">Welcome to SystemA</h2>
              <p className="text-gray-400 text-center">Sign in or create an account to start designing system architectures</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
              >
                <LogIn className="w-5 h-5" />
                Sign In / Create Account
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isLoadingArchitecture && !authLoading && user && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-system-bg border border-system-border rounded-lg p-8 text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p>Loading architecture...</p>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Prompt */}
      <TutorialPrompt
        isOpen={showTutorialPrompt}
        onStart={handleStartTutorial}
        onSkip={handleSkipTutorial}
      />

      {/* Tutorial */}
      <Tutorial
        isOpen={isTutorialActive}
        onClose={handleCloseTutorial}
      />
    </div>
  );
}

export default App;
