import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Copy, Globe, Lock, Check } from 'lucide-react';
import { 
  getCollaborators, 
  addCollaborator, 
  removeCollaborator, 
  updateCollaboratorRole,
  togglePublicAccess,
  Collaborator 
} from '../../lib/architectureService';
import { useAuth } from '../../contexts/AuthContext';

interface CollaborateModalProps {
  isOpen: boolean;
  onClose: () => void;
  architectureId: string;
  architectureName: string;
  ownerId: string;
  isPublic: boolean;
  publicLink: string | null;
}

export const CollaborateModal = ({
  isOpen,
  onClose,
  architectureId,
  architectureName,
  ownerId,
  isPublic: initialIsPublic,
  publicLink: initialPublicLink,
}: CollaborateModalProps) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Editor' | 'Commenter' | 'Viewer'>('Viewer');
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [publicLink, setPublicLink] = useState(initialPublicLink);
  const [copied, setCopied] = useState(false);

  const isOwner = user?.id === ownerId;

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, architectureId]);

  const loadCollaborators = async () => {
    setLoading(true);
    const { data, error } = await getCollaborators(architectureId);
    if (error) {
      setError(error.message);
    } else {
      setCollaborators(data || []);
    }
    setLoading(false);
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setLoading(true);

    const { data, error } = await addCollaborator(architectureId, email, role);
    
    if (error) {
      setError(error.message);
    } else if (data) {
      setCollaborators([...collaborators, data]);
      setEmail('');
    }
    
    setLoading(false);
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    const { error } = await removeCollaborator(collaboratorId);
    if (error) {
      setError(error.message);
    } else {
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
    }
  };

  const handleRoleChange = async (collaboratorId: string, newRole: 'Editor' | 'Commenter' | 'Viewer') => {
    const { error } = await updateCollaboratorRole(collaboratorId, newRole);
    if (error) {
      setError(error.message);
    } else {
      setCollaborators(collaborators.map(c => 
        c.id === collaboratorId ? { ...c, role: newRole } : c
      ));
    }
  };

  const handleTogglePublic = async () => {
    const newIsPublic = !isPublic;
    const { publicLink: newLink, error } = await togglePublicAccess(architectureId, newIsPublic);
    
    if (error) {
      setError(error.message);
    } else {
      setIsPublic(newIsPublic);
      setPublicLink(newLink);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/view/${publicLink}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-system-bg border border-system-border rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-system-border">
          <h2 className="text-lg font-semibold text-white">Share "{architectureName}"</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="px-3 py-2 bg-red-900/20 border border-red-500 text-red-400 rounded text-sm">
              {error}
            </div>
          )}

          {/* Add Collaborator Form */}
          {isOwner && (
            <form onSubmit={handleAddCollaborator} className="space-y-3">
              <label className="block text-sm text-gray-400">Invite people</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 bg-system-bg border border-system-border rounded text-white placeholder-gray-500 focus:outline-none focus:border-white"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Editor' | 'Commenter' | 'Viewer')}
                  className="px-3 py-2 bg-system-bg border border-system-border rounded text-white focus:outline-none focus:border-white"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Commenter">Commenter</option>
                  <option value="Editor">Editor</option>
                </select>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="px-3 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {/* Collaborators List */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">People with access</label>
            
            {/* Owner */}
            <div className="flex items-center justify-between py-2 px-3 bg-system-hover rounded">
              <div>
                <p className="text-white text-sm">{user?.id === ownerId ? 'You' : 'Owner'}</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
              <span className="text-xs text-gray-400 px-2 py-1 bg-system-bg rounded">Owner</span>
            </div>

            {/* Collaborators */}
            {collaborators.map((collab) => (
              <div key={collab.id} className="flex items-center justify-between py-2 px-3 bg-system-hover rounded">
                <div>
                  <p className="text-white text-sm">
                    {collab.profile?.full_name || collab.profile?.email || 'Unknown'}
                  </p>
                  <p className="text-gray-400 text-xs">{collab.profile?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <>
                      <select
                        value={collab.role}
                        onChange={(e) => handleRoleChange(collab.id, e.target.value as 'Editor' | 'Commenter' | 'Viewer')}
                        className="px-2 py-1 bg-system-bg border border-system-border rounded text-white text-xs focus:outline-none"
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Commenter">Commenter</option>
                        <option value="Editor">Editor</option>
                      </select>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 px-2 py-1 bg-system-bg rounded">
                      {collab.role}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {collaborators.length === 0 && (
              <p className="text-gray-500 text-sm py-2">No collaborators yet</p>
            )}
          </div>

          {/* Public Link Section */}
          {isOwner && (
            <div className="space-y-3 pt-4 border-t border-system-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <Globe className="w-5 h-5 text-green-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-white text-sm">
                      {isPublic ? 'Public access enabled' : 'Private'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {isPublic 
                        ? 'Anyone with the link can view' 
                        : 'Only collaborators can access'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTogglePublic}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    isPublic 
                      ? 'bg-green-900/20 text-green-400 border border-green-500 hover:bg-green-900/40' 
                      : 'bg-system-hover text-white border border-system-border hover:bg-system-hover/80'
                  }`}
                >
                  {isPublic ? 'Disable' : 'Enable'}
                </button>
              </div>

              {isPublic && publicLink && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/view/${publicLink}`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-system-hover border border-system-border rounded text-gray-400 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-system-hover border border-system-border rounded text-white hover:bg-system-border transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-system-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-system-border rounded text-white hover:bg-system-hover transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
