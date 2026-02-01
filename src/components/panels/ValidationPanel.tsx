import { useEffect } from 'react';
import { useArchitectureStore } from '../../store/architectureStore';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export const ValidationPanel = () => {
  const { warnings, validateArchitecture } = useArchitectureStore();

  useEffect(() => {
    // Validate on mount and when architecture changes
    validateArchitecture();
  }, [validateArchitecture]);

  if (warnings.length === 0) return null;

  const errors = warnings.filter(w => w.severity === 'error');
  const warningsOnly = warnings.filter(w => w.severity === 'warning');

  return (
    <div className="fixed bottom-4 left-4 max-w-md bg-system-bg border border-system-border rounded-lg shadow-2xl text-white z-40">
      <div className="p-4 border-b border-system-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold">
            {errors.length} Errors, {warningsOnly.length} Warnings
          </h3>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {errors.length > 0 && (
          <div className="p-4 space-y-2">
            <h4 className="text-sm font-semibold text-red-400 mb-2">Errors</h4>
            {errors.map((error) => (
              <div
                key={error.id}
                className="flex items-start gap-2 p-2 bg-red-900/20 border border-red-500 rounded text-sm"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-200">{error.message}</span>
              </div>
            ))}
          </div>
        )}

        {warningsOnly.length > 0 && (
          <div className="p-4 space-y-2">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">Warnings</h4>
            {warningsOnly.map((warning) => (
              <div
                key={warning.id}
                className="flex items-start gap-2 p-2 bg-yellow-900/20 border border-yellow-500 rounded text-sm"
              >
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-yellow-200">{warning.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
