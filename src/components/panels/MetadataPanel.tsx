import { useState, useRef, useEffect } from 'react';
import { useArchitectureStore } from '../../store/architectureStore';
import { Component, ComponentType, Environment, Criticality } from '../../types';
import { X, Plus, Trash2, GripHorizontal } from 'lucide-react';

export const MetadataPanel = () => {
  const { 
    currentArchitecture, 
    selectedNodeId, 
    updateComponent, 
    isMetadataPanelOpen,
    toggleMetadataPanel,
  } = useArchitectureStore();

  const component = currentArchitecture?.components.find(c => c.id === selectedNodeId);

  if (!isMetadataPanelOpen || !component) return null;

  return (
    <MetadataPanelContent 
      component={component} 
      onUpdate={updateComponent}
      onClose={toggleMetadataPanel}
    />
  );
};

interface MetadataPanelContentProps {
  component: Component;
  onUpdate: (id: string, updates: Partial<Component>) => void;
  onClose: () => void;
}

const MetadataPanelContent = ({ component, onUpdate, onClose }: MetadataPanelContentProps) => {
  const [localComponent, setLocalComponent] = useState<Component>(component);
  const [position, setPosition] = useState({ 
    x: Math.max(20, (window.innerWidth - 600) / 2), 
    y: Math.max(20, (window.innerHeight * 0.1) / 2)
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Trigger fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleSave = () => {
    onUpdate(component.id, localComponent);
    onClose();
  };

  const updateField = <K extends keyof Component>(field: K, value: Component[K]) => {
    setLocalComponent(prev => ({ ...prev, [field]: value }));
  };

  const addFailureMode = () => {
    setLocalComponent(prev => ({
      ...prev,
      failureModes: [
        ...prev.failureModes,
        {
          id: `failure-${Date.now()}`,
          description: '',
          impact: '',
          probability: 'low' as const,
        },
      ],
    }));
  };

  const removeFailureMode = (id: string) => {
    setLocalComponent(prev => ({
      ...prev,
      failureModes: prev.failureModes.filter(fm => fm.id !== id),
    }));
  };

  const addRecoveryStrategy = () => {
    setLocalComponent(prev => ({
      ...prev,
      recoveryStrategy: [
        ...prev.recoveryStrategy,
        {
          id: `recovery-${Date.now()}`,
          description: '',
          automaticRetry: false,
          manualIntervention: false,
          estimatedRecoveryTime: '',
        },
      ],
    }));
  };

  const removeRecoveryStrategy = (id: string) => {
    setLocalComponent(prev => ({
      ...prev,
      recoveryStrategy: prev.recoveryStrategy.filter(rs => rs.id !== id),
    }));
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        style={{ 
          backdropFilter: 'blur(4px)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
        }}
        onClick={onClose}
      />
      
      {/* Draggable Panel */}
      <div 
        ref={panelRef}
        className="fixed bg-system-bg border-2 border-system-border text-white overflow-hidden z-50 rounded-lg shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '600px',
          maxHeight: '90vh',
          cursor: isDragging ? 'grabbing' : 'default',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: isDragging ? 'none' : 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="sticky top-0 bg-system-bg border-b border-system-border p-4 flex items-center justify-between drag-handle cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Component Metadata</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-system-hover rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 70px)' }}>
          {/* Basic Info */}
          <section data-tutorial-section="basic-info">
            <h3 className="text-sm font-semibold mb-3 text-gray-400">Basic Information</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input
                type="text"
                value={localComponent.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Type *</label>
              <select
                value={localComponent.type}
                onChange={(e) => updateField('type', e.target.value as ComponentType)}
                className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="API">API</option>
                <option value="DB">Database</option>
                <option value="Worker">Worker</option>
                <option value="Queue">Queue</option>
                <option value="External">External</option>
                <option value="Human">Human</option>
                <option value="Control">Control</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Responsibility (single sentence) *</label>
              <textarea
                value={localComponent.responsibility}
                onChange={(e) => updateField('responsibility', e.target.value)}
                rows={2}
                className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Owner *</label>
              <input
                type="text"
                value={localComponent.owner}
                onChange={(e) => updateField('owner', e.target.value)}
                className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Environment</label>
                <select
                  value={localComponent.environment}
                  onChange={(e) => updateField('environment', e.target.value as Environment)}
                  className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="prod">Production</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Criticality</label>
                <select
                  value={localComponent.criticality}
                  onChange={(e) => updateField('criticality', e.target.value as Criticality)}
                  className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localComponent.isNotWorking || false}
                  onChange={(e) => updateField('isNotWorking', e.target.checked)}
                  className="w-4 h-4 bg-system-bg border border-system-border rounded focus:outline-none focus:ring-1 focus:ring-white"
                />
                <span className="text-xs text-gray-400">Mark as Not Working (persisted on save)</span>
              </label>
              {localComponent.isNotWorking && (
                <p className="text-xs text-orange-400 mt-1 ml-6">
                  This component will be displayed with an orange border and saved as not working.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Failure Modes */}
        <section data-tutorial-section="failure-modes">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400">Failure Modes *</h3>
            <button
              onClick={addFailureMode}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-system-border rounded hover:bg-system-hover transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          <div className="space-y-3">
            {localComponent.failureModes.map((fm) => (
              <div key={fm.id} className="p-3 border border-system-border rounded space-y-2">
                <div className="flex items-start justify-between">
                  <input
                    type="text"
                    placeholder="Description"
                    value={fm.description}
                    onChange={(e) => {
                      setLocalComponent(prev => ({
                        ...prev,
                        failureModes: prev.failureModes.map(f =>
                          f.id === fm.id ? { ...f, description: e.target.value } : f
                        ),
                      }));
                    }}
                    className="flex-1 bg-system-bg border border-system-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                  />
                  <button
                    onClick={() => removeFailureMode(fm.id)}
                    className="ml-2 p-1 hover:bg-system-hover rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Impact"
                  value={fm.impact}
                  onChange={(e) => {
                    setLocalComponent(prev => ({
                      ...prev,
                      failureModes: prev.failureModes.map(f =>
                        f.id === fm.id ? { ...f, impact: e.target.value } : f
                      ),
                    }));
                  }}
                  className="w-full bg-system-bg border border-system-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                />
                <select
                  value={fm.probability}
                  onChange={(e) => {
                    setLocalComponent(prev => ({
                      ...prev,
                      failureModes: prev.failureModes.map(f =>
                        f.id === fm.id ? { ...f, probability: e.target.value as 'low' | 'medium' | 'high' } : f
                      ),
                    }));
                  }}
                  className="w-full bg-system-bg border border-system-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                >
                  <option value="low">Low Probability</option>
                  <option value="medium">Medium Probability</option>
                  <option value="high">High Probability</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Recovery Strategies */}
        <section data-tutorial-section="recovery-strategies">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-400">Recovery Strategies</h3>
            <button
              onClick={addRecoveryStrategy}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-system-border rounded hover:bg-system-hover transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          <div className="space-y-3">
            {localComponent.recoveryStrategy.map((rs) => (
              <div key={rs.id} className="p-3 border border-system-border rounded space-y-2">
                <div className="flex items-start justify-between">
                  <textarea
                    placeholder="Recovery description"
                    value={rs.description}
                    onChange={(e) => {
                      setLocalComponent(prev => ({
                        ...prev,
                        recoveryStrategy: prev.recoveryStrategy.map(r =>
                          r.id === rs.id ? { ...r, description: e.target.value } : r
                        ),
                      }));
                    }}
                    rows={2}
                    className="flex-1 bg-system-bg border border-system-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-white resize-none"
                  />
                  <button
                    onClick={() => removeRecoveryStrategy(rs.id)}
                    className="ml-2 p-1 hover:bg-system-hover rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Estimated recovery time"
                  value={rs.estimatedRecoveryTime}
                  onChange={(e) => {
                    setLocalComponent(prev => ({
                      ...prev,
                      recoveryStrategy: prev.recoveryStrategy.map(r =>
                        r.id === rs.id ? { ...r, estimatedRecoveryTime: e.target.value } : r
                      ),
                    }));
                  }}
                  className="w-full bg-system-bg border border-system-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-gray-400">Notes & Assumptions</h3>
          <textarea
            value={localComponent.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={4}
            className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white resize-none"
            placeholder="Additional notes, assumptions, or context..."
          />
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-system-border">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-white text-black rounded font-medium hover:bg-gray-200 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-system-border rounded hover:bg-system-hover transition-colors"
          >
            Cancel
          </button>
        </div>
        </div>
      </div>
    </>
  );
};
