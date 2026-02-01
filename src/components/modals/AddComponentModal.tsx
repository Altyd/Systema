import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Component, ComponentType, Environment, Criticality } from '../../types';
import { useArchitectureStore } from '../../store/architectureStore';

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number } | null;
}

export const AddComponentModal = ({ isOpen, onClose, initialPosition }: AddComponentModalProps) => {
  const { addComponent } = useArchitectureStore();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'API' as ComponentType,
    responsibility: '',
    owner: '',
    environment: 'prod' as Environment,
    criticality: 'medium' as Criticality,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use provided position or default to center
    const position = initialPosition || { x: 250, y: 250 };
    
    const newComponent: Component = {
      id: `component-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      responsibility: formData.responsibility,
      inputs: [],
      outputs: [],
      dependencies: [],
      owner: formData.owner,
      environment: formData.environment,
      criticality: formData.criticality,
      failureModes: [],
      recoveryStrategy: [],
      notes: '',
      assumptions: [],
      position,
    };

    addComponent(newComponent);
    
    // Reset form
    setFormData({
      name: '',
      type: 'API',
      responsibility: '',
      owner: '',
      environment: 'prod',
      criticality: 'medium',
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-system-bg border border-system-border rounded-lg w-full max-w-md p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Component</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-system-hover rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="e.g., API Gateway"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Type *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ComponentType })}
              className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
            >
              <option value="API">API</option>
              <option value="DB">Database</option>
              <option value="Worker">Worker</option>
              <option value="Queue">Queue</option>
              <option value="External">External Service</option>
              <option value="Human">Human Process</option>
              <option value="Control">Control Logic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Responsibility (single sentence) *</label>
            <textarea
              required
              value={formData.responsibility}
              onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })}
              rows={2}
              className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white resize-none"
              placeholder="e.g., Route and authenticate incoming requests"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Owner *</label>
            <input
              type="text"
              required
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="e.g., Backend Team"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Environment</label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value as Environment })}
                className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="dev">Development</option>
                <option value="staging">Staging</option>
                <option value="prod">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Criticality</label>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value as Criticality })}
                className="w-full bg-system-bg border border-system-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded font-medium hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Component
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-system-border rounded hover:bg-system-hover transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
