import { create } from 'zustand';
import { Architecture, Component, Connection, ValidationWarning, Annotation, Comment } from '../types';

interface ArchitectureStore {
  // Current architecture
  currentArchitecture: Architecture | null;
  setCurrentArchitecture: (architecture: Architecture | null) => void;
  updateArchitectureMetadata: (updates: Partial<Pick<Architecture, 'name' | 'description' | 'problemStatement' | 'constraints' | 'assumptions' | 'nonGoals' | 'knownFailureScenarios'>>) => void;
  
  // Undo/Redo
  history: Architecture[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Components
  addComponent: (component: Component) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  deleteMultipleComponents: (ids: string[]) => void;
  
  // Connections
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  
  // Annotations
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  
  // Comments
  comments: Comment[];
  addComment: (comment: Comment) => void;
  resolveComment: (id: string) => void;
  
  // Validation
  warnings: ValidationWarning[];
  validateArchitecture: () => void;
  
  // Simulation
  simulationMode: boolean;
  toggleSimulationMode: () => void;
  toggleComponentFailure: (componentId: string) => void;
  
  // UI State
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  isMetadataPanelOpen: boolean;
  toggleMetadataPanel: () => void;
}

export const useArchitectureStore = create<ArchitectureStore>((set, get) => ({
  currentArchitecture: null,
  selectedNodeId: null,
  isMetadataPanelOpen: false,
  comments: [],
  warnings: [],
  simulationMode: false,
  history: [],
  historyIndex: -1,

  setCurrentArchitecture: (architecture) => set({ currentArchitecture: architecture, history: [], historyIndex: -1 }),

  pushHistory: () => {
    const state = get();
    if (!state.currentArchitecture) return;
    
    // Create a deep copy of the current architecture
    const snapshot = JSON.parse(JSON.stringify(state.currentArchitecture));
    
    // Remove any history after the current index (for redo after undo)
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(snapshot);
    
    // Limit history to last 50 states to prevent memory issues
    const limitedHistory = newHistory.slice(-50);
    
    set({
      history: limitedHistory,
      historyIndex: limitedHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1];
      set({
        currentArchitecture: JSON.parse(JSON.stringify(previousState)),
        historyIndex: state.historyIndex - 1,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      set({
        currentArchitecture: JSON.parse(JSON.stringify(nextState)),
        historyIndex: state.historyIndex + 1,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },

  updateArchitectureMetadata: (updates) =>
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  addComponent: (component) => {
    get().pushHistory();
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          components: [...state.currentArchitecture.components, component],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  updateComponent: (id, updates) =>
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          components: state.currentArchitecture.components.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  deleteComponent: (id) =>
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          components: state.currentArchitecture.components.filter((c) => c.id !== id),
          connections: state.currentArchitecture.connections.filter(
            (conn) => conn.source !== id && conn.target !== id
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  deleteMultipleComponents: (ids) => {
    get().pushHistory();
    set((state) => {
      if (!state.currentArchitecture) return state;
      const idsSet = new Set(ids);
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          components: state.currentArchitecture.components.filter((c) => !idsSet.has(c.id)),
          connections: state.currentArchitecture.connections.filter(
            (conn) => !idsSet.has(conn.source) && !idsSet.has(conn.target)
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  addConnection: (connection) => {
    get().pushHistory();
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          connections: [...state.currentArchitecture.connections, connection],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  updateConnection: (id, updates) =>
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          connections: state.currentArchitecture.connections.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  deleteConnection: (id) => {
    get().pushHistory();
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          connections: state.currentArchitecture.connections.filter((c) => c.id !== id),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  addAnnotation: (annotation) =>
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          annotations: [...state.currentArchitecture.annotations, annotation],
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  updateAnnotation: (id, updates) =>
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          annotations: state.currentArchitecture.annotations.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  deleteAnnotation: (id) =>
    set((state) => {
      if (!state.currentArchitecture) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          annotations: state.currentArchitecture.annotations.filter((a) => a.id !== id),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  addComment: (comment) => set((state) => ({ comments: [...state.comments, comment] })),

  resolveComment: (id) =>
    set((state) => ({
      comments: state.comments.map((c) => (c.id === id ? { ...c, resolved: true } : c)),
    })),

  validateArchitecture: () => {
    const state = get();
    if (!state.currentArchitecture) return;

    const warnings: ValidationWarning[] = [];
    const { components, connections } = state.currentArchitecture;

    // Check for missing failure modes
    components.forEach((component) => {
      if (component.failureModes.length === 0) {
        warnings.push({
          id: `${component.id}-no-failure-mode`,
          type: 'missing-failure-mode',
          componentId: component.id,
          message: `Component "${component.name}" has no defined failure modes`,
          severity: 'warning',
        });
      }

      if (component.criticality === 'high' && component.recoveryStrategy.length === 0) {
        warnings.push({
          id: `${component.id}-no-recovery`,
          type: 'missing-recovery',
          componentId: component.id,
          message: `Critical component "${component.name}" has no recovery strategy`,
          severity: 'error',
        });
      }

      if (!component.owner || component.owner.trim() === '') {
        warnings.push({
          id: `${component.id}-no-owner`,
          type: 'missing-owner',
          componentId: component.id,
          message: `Component "${component.name}" has no defined owner`,
          severity: 'warning',
        });
      }
    });

    // Check for missing connection notes on external dependencies
    connections.forEach((connection) => {
      const targetComponent = components.find((c) => c.id === connection.target);
      if (targetComponent?.type === 'External' && connection.assumptions.length === 0) {
        warnings.push({
          id: `${connection.id}-no-notes`,
          type: 'missing-dependency-notes',
          connectionId: connection.id,
          message: `External dependency connection has no documented assumptions`,
          severity: 'warning',
        });
      }
    });

    set({ warnings });
  },

  toggleSimulationMode: () => set((state) => ({ simulationMode: !state.simulationMode })),

  toggleComponentFailure: (componentId) =>
    set((state) => {
      if (!state.currentArchitecture || !state.simulationMode) return state;
      return {
        currentArchitecture: {
          ...state.currentArchitecture,
          components: state.currentArchitecture.components.map((c) =>
            c.id === componentId ? { ...c, isFailed: !c.isFailed } : c
          ),
        },
      };
    }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  toggleMetadataPanel: () => set((state) => ({ isMetadataPanelOpen: !state.isMetadataPanelOpen })),
}));
