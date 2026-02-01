import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Component } from '../../types';
import { clsx } from 'clsx';
import { 
  Database, 
  Server, 
  Cog, 
  ListOrdered, 
  Globe, 
  User, 
  GitBranch 
} from 'lucide-react';

const getIconForType = (type: Component['type']) => {
  switch (type) {
    case 'API':
      return Server;
    case 'DB':
      return Database;
    case 'Worker':
      return Cog;
    case 'Queue':
      return ListOrdered;
    case 'External':
      return Globe;
    case 'Human':
      return User;
    case 'Control':
      return GitBranch;
    default:
      return Server;
  }
};

const getCriticalityColor = (criticality: Component['criticality'], isFailed?: boolean) => {
  if (isFailed) return 'border-red-500 bg-red-900/20';
  
  switch (criticality) {
    case 'high':
      return 'border-red-400';
    case 'medium':
      return 'border-yellow-400';
    case 'low':
      return 'border-green-400';
    default:
      return 'border-system-border';
  }
};

export const ComponentNode = memo(({ data, selected }: NodeProps<Component & { isDeleting?: boolean }>) => {
  const Icon = getIconForType(data.type);
  const isExternal = data.type === 'External';
  const isControl = data.type === 'Control';
  
  return (
    <div
      className={clsx(
        'min-w-[200px] bg-system-bg border-2 rounded-lg p-4 transition-all duration-300',
        getCriticalityColor(data.criticality, data.isFailed),
        selected && 'ring-2 ring-white ring-offset-2 ring-offset-black',
        isControl && 'border-dashed',
        isExternal && 'border-dotted',
        data.isDeleting && 'opacity-0 scale-75'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-white border-2 border-black"
      />
      
      <div className="flex items-start gap-3">
        <Icon className={clsx(
          'w-6 h-6 flex-shrink-0',
          data.isFailed ? 'text-red-500' : 'text-white'
        )} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-semibold text-sm leading-tight">
              {data.name}
            </h3>
            {data.criticality === 'high' && (
              <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500">
                CRITICAL
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-400 mt-1 leading-tight">
            {data.type}
          </p>
          
          {data.responsibility && (
            <p className="text-xs text-gray-300 mt-2 leading-tight line-clamp-2">
              {data.responsibility}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>{data.environment}</span>
            {data.owner && (
              <>
                <span>•</span>
                <span>{data.owner}</span>
              </>
            )}
          </div>
          
          {data.isFailed && (
            <div className="mt-2 text-xs text-red-400 font-medium">
              ⚠ FAILED (Simulation)
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-white border-2 border-black"
      />
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';
