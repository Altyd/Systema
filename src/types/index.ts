// Core type definitions for SystemA

export type ComponentType = 
  | 'API' 
  | 'DB' 
  | 'Worker' 
  | 'Queue' 
  | 'External' 
  | 'Human' 
  | 'Control';

export type Environment = 'dev' | 'staging' | 'prod';

export type Criticality = 'low' | 'medium' | 'high';

export type SystemState = 
  | 'Normal' 
  | 'Degraded' 
  | 'Read-only' 
  | 'Fail-open' 
  | 'Fail-closed';

export type ArchitectureStatus = 'Valid' | 'Incomplete' | 'Risky';

export type UserRole = 'Owner' | 'Editor' | 'Commenter' | 'Viewer';

export interface FailureMode {
  id: string;
  description: string;
  impact: string;
  probability: 'low' | 'medium' | 'high';
}

export interface RecoveryStrategy {
  id: string;
  description: string;
  automaticRetry: boolean;
  manualIntervention: boolean;
  estimatedRecoveryTime: string;
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  responsibility: string; // Single sentence
  inputs: string[];
  outputs: string[];
  dependencies: string[]; // IDs of other components
  owner: string;
  environment: Environment;
  criticality: Criticality;
  failureModes: FailureMode[];
  recoveryStrategy: RecoveryStrategy[];
  notes: string;
  assumptions: string[];
  
  // Visual properties
  position: { x: number; y: number };
  isFailed?: boolean; // For simulation
  isNotWorking?: boolean; // Marked as not working (persisted)
}

export interface Connection {
  id: string;
  source: string; // Component ID
  target: string; // Component ID
  direction: 'unidirectional' | 'bidirectional';
  contract: string; // What is guaranteed
  assumptions: string[];
  failureBehavior: string;
  retryPolicy?: {
    enabled: boolean;
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
  };
  timeoutSeconds?: number;
  isControlFlow: boolean; // vs data flow
  isCriticalPath: boolean;
}

export interface Annotation {
  id: string;
  componentId?: string; // Optional - if attached to component
  type: 'risk' | 'tradeoff' | 'weakness' | 'note';
  content: string;
  author: string;
  createdAt: string;
  position?: { x: number; y: number };
}

export interface ValidationWarning {
  id: string;
  type: 
    | 'missing-failure-mode' 
    | 'missing-recovery' 
    | 'missing-owner' 
    | 'missing-dependency-notes' 
    | 'implicit-control';
  componentId?: string;
  connectionId?: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface Architecture {
  id: string;
  name: string;
  description: string;
  problemStatement: string;
  constraints: string[];
  assumptions: string[];
  nonGoals: string[];
  knownFailureScenarios: string[];
  
  components: Component[];
  connections: Connection[];
  annotations: Annotation[];
  
  status: ArchitectureStatus;
  currentState: SystemState;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  
  // Collaboration
  collaborators: Collaborator[];
  isPublic: boolean;
  publicReadOnlyLink?: string;
}

export interface Collaborator {
  userId: string;
  email: string;
  role: UserRole;
  addedAt: string;
}

export interface Comment {
  id: string;
  architectureId: string;
  componentId?: string;
  connectionId?: string;
  content: string;
  author: string;
  authorEmail: string;
  createdAt: string;
  resolved: boolean;
  position?: { x: number; y: number };
}

export interface ArchitectureSnapshot {
  id: string;
  architectureId: string;
  name: string;
  description: string;
  data: Architecture;
  createdAt: string;
  createdBy: string;
}

export interface ChangeLogEntry {
  id: string;
  architectureId: string;
  userId: string;
  userEmail: string;
  action: string;
  changes: Record<string, unknown>;
  timestamp: string;
}

// Drawing and annotation types
export interface DrawingElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text' | 'freehand';
  position: { x: number; y: number };
  properties: {
    width?: number;
    height?: number;
    radius?: number;
    points?: { x: number; y: number }[];
    text?: string;
    fontSize?: number;
    color?: string;
    strokeWidth?: number;
  };
}
