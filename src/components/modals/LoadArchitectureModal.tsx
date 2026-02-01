import { useState, useEffect } from 'react';
import { X, Trash2, FolderOpen, Clock, Users, UserPlus } from 'lucide-react';
import { loadUserArchitectures, deleteArchitecture, SavedArchitecture } from '../../lib/architectureService';
import { Architecture } from '../../types';

interface LoadArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onLoad: (architecture: Architecture) => void;
}

export const LoadArchitectureModal = ({
  isOpen,
  onClose,
  userId,
  onLoad,
}: LoadArchitectureModalProps) => {
  const [architectures, setArchitectures] = useState<SavedArchitecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadArchitectures();
    }
  }, [isOpen, userId]);

  const loadArchitectures = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await loadUserArchitectures(userId);
    if (error) {
      setError(error.message);
    } else {
      setArchitectures(data || []);
    }
    setLoading(false);
  };

  const handleLoad = (saved: SavedArchitecture) => {
    onLoad(saved.data);
    onClose();
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteArchitecture(id);
    if (error) {
      setError(error.message);
    } else {
      setArchitectures(architectures.filter(a => a.id !== id));
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-system-bg border border-system-border rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-system-border">
          <h2 className="text-lg font-semibold text-white">Your Architectures</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-2 pb-0 border-b border-system-border/50">
          <p className="text-xs text-gray-500">
            Showing architectures you own and those shared with you
          </p>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-900/20 border border-red-500 text-red-400 rounded text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : architectures.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No saved architectures yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Create and save your first architecture to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {architectures.map((arch) => (
                <div
                  key={arch.id}
                  className="flex items-center justify-between p-4 bg-system-hover border border-system-border rounded-lg hover:border-gray-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{arch.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{arch.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(arch.updated_at)}
                      </span>
                      <span>v{arch.version}</span>
                      {arch.created_by !== userId && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <UserPlus className="w-3 h-3" />
                          Shared with you
                        </span>
                      )}
                      {arch.is_public && (
                        <span className="flex items-center gap-1 text-green-400">
                          <Users className="w-3 h-3" />
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {deleteConfirm === arch.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(arch.id)}
                          className="px-3 py-1.5 bg-red-900/20 text-red-400 border border-red-500 rounded text-sm hover:bg-red-900/40 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 border border-system-border rounded text-white text-sm hover:bg-system-hover transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleLoad(arch)}
                          className="px-3 py-1.5 bg-white text-black rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          Open
                        </button>
                        {arch.created_by === userId && (
                          <button
                            onClick={() => setDeleteConfirm(arch.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-system-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-system-border rounded text-white hover:bg-system-hover transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
