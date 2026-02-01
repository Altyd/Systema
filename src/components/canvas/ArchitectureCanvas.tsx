import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection as RFConnection,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
  Panel,
  SelectionMode,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ComponentNode } from '../nodes/ComponentNode';
import { ConnectionEdge } from '../edges/ConnectionEdge';
import { useArchitectureStore } from '../../store/architectureStore';
import { Component, Connection } from '../../types';
import { Plus, Play, Square, Trash2, Copy, Edit } from 'lucide-react';
import { AddComponentModal } from '../modals/AddComponentModal';

const nodeTypes = {
  component: ComponentNode,
};

const edgeTypes = {
  connection: ConnectionEdge,
};

// Inner component that uses useReactFlow (must be inside ReactFlowProvider)
const ArchitectureCanvasInner = () => {
  const {
    currentArchitecture,
    addComponent,
    updateComponent,
    addConnection,
    deleteMultipleComponents,
    setSelectedNodeId,
    simulationMode,
    toggleSimulationMode,
  } = useArchitectureStore();

  const { screenToFlowPosition } = useReactFlow();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addComponentPosition, setAddComponentPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeIds: string[];
  } | null>(null);
  const [paneContextMenu, setPaneContextMenu] = useState<{
    x: number;
    y: number;
    flowPosition: { x: number; y: number };
  } | null>(null);
  const [deletingNodes, setDeletingNodes] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLDivElement>(null);

  // Convert architecture components to React Flow nodes
  const initialNodes: Node<Component>[] = useMemo(() => {
    if (!currentArchitecture) return [];
    return currentArchitecture.components.map((component) => ({
      id: component.id,
      type: 'component',
      position: component.position,
      data: {
        ...component,
        isDeleting: deletingNodes.has(component.id),
      } as Component & { isDeleting?: boolean },
    }));
  }, [currentArchitecture, deletingNodes]);

  // Convert architecture connections to React Flow edges
  const initialEdges: Edge<Connection>[] = useMemo(() => {
    if (!currentArchitecture) return [];
    return currentArchitecture.connections.map((connection) => ({
      id: connection.id,
      source: connection.source,
      target: connection.target,
      type: 'connection',
      data: connection,
      animated: connection.isControlFlow,
    }));
  }, [currentArchitecture]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when architecture changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Update node positions when dragged
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateComponent(node.id, { position: node.position });
    },
    [updateComponent]
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: RFConnection) => {
      if (!connection.source || !connection.target) return;

      const newConnection: Connection = {
        id: `connection-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        direction: 'unidirectional',
        contract: '',
        assumptions: [],
        failureBehavior: '',
        isControlFlow: false,
        isCriticalPath: false,
      };

      addConnection(newConnection);
      
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: newConnection.id,
            type: 'connection',
            data: newConnection,
          },
          eds
        )
      );
    },
    [addConnection, setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const handleAddComponent = () => {
    setIsAddModalOpen(true);
  };

  // Handle right-click on nodes to show context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, clickedNode: Node) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Always show menu with either selected nodes or just the clicked node
      const selectedNodes = nodes.filter(n => n.selected);
      const nodeIdsForMenu = selectedNodes.length > 0 && selectedNodes.some(n => n.id === clickedNode.id)
        ? selectedNodes.map(n => n.id)
        : [clickedNode.id];
      
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeIds: nodeIdsForMenu,
      });
    },
    [nodes]
  );

  // Handle right-click on selection box (multiple selected nodes)
  const onSelectionContextMenu = useCallback(
    (event: React.MouseEvent, selectedNodes: Node[]) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (selectedNodes.length > 0) {
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          nodeIds: selectedNodes.map(n => n.id),
        });
      }
    },
    []
  );

  // Handle delete from context menu with animation
  const handleDeleteFromMenu = useCallback(() => {
    if (contextMenu) {
      const nodeIds = contextMenu.nodeIds;
      setContextMenu(null);
      
      // Start delete animation
      setDeletingNodes(new Set(nodeIds));
      
      // Wait for animation to complete before actually deleting
      setTimeout(() => {
        deleteMultipleComponents(nodeIds);
        setSelectedNodeId(null);
        setDeletingNodes(new Set());
      }, 300); // Match animation duration
    }
  }, [contextMenu, deleteMultipleComponents, setSelectedNodeId]);

  // Handle duplicate from context menu
  const handleDuplicateFromMenu = useCallback(() => {
    if (!contextMenu || !currentArchitecture) return;
    
    const nodeIdsSet = new Set(contextMenu.nodeIds);
    const nodesToDuplicate = currentArchitecture.components.filter(
      c => nodeIdsSet.has(c.id)
    );
    
    // Create a map from old ID to new ID
    const idMap = new Map<string, string>();
    const timestamp = Date.now();
    
    // First, create all new components
    nodesToDuplicate.forEach((component, index) => {
      const newId = `component-${timestamp}-${index}`;
      idMap.set(component.id, newId);
      
      const newComponent = {
        ...component,
        id: newId,
        name: `${component.name} (Copy)`,
        position: {
          x: component.position.x + 50,
          y: component.position.y + 50,
        },
      };
      addComponent(newComponent);
    });
    
    // Then, duplicate connections between the selected nodes
    const connectionsToDuplicate = currentArchitecture.connections.filter(
      conn => nodeIdsSet.has(conn.source) && nodeIdsSet.has(conn.target)
    );
    
    connectionsToDuplicate.forEach((connection, index) => {
      const newSourceId = idMap.get(connection.source);
      const newTargetId = idMap.get(connection.target);
      
      if (newSourceId && newTargetId) {
        const newConnection = {
          ...connection,
          id: `connection-${timestamp}-${index}`,
          source: newSourceId,
          target: newTargetId,
        };
        addConnection(newConnection);
      }
    });
    
    setContextMenu(null);
  }, [contextMenu, currentArchitecture, addComponent, addConnection]);

  // Handle right-click on pane (empty space) to show add component menu
  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    // Convert screen coordinates to flow coordinates
    const flowPosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    setPaneContextMenu({
      x: event.clientX,
      y: event.clientY,
      flowPosition,
    });
    setContextMenu(null); // Close node context menu if open
  }, [screenToFlowPosition]);

  // Handle adding component at position from pane context menu
  const handleAddComponentAtPosition = useCallback(() => {
    if (paneContextMenu) {
      setAddComponentPosition(paneContextMenu.flowPosition);
      setIsAddModalOpen(true);
      setPaneContextMenu(null);
    }
  }, [paneContextMenu]);

  // Close context menus when clicking anywhere and prevent browser context menu on canvas
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setPaneContextMenu(null);
    };
    
    const handleContextMenu = (e: MouseEvent) => {
      // Check if the event target is within our canvas
      if (canvasRef.current?.contains(e.target as globalThis.Node)) {
        e.preventDefault();
      }
    };
    
    if (contextMenu || paneContextMenu) {
      window.addEventListener('click', handleClick);
    }
    
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [contextMenu, paneContextMenu]);

  return (
    <div ref={canvasRef} className="w-full h-full bg-system-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onSelectionContextMenu={onSelectionContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        panOnDrag={true}
        selectionOnDrag={false}
        selectionMode={SelectionMode.Partial}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        className="bg-system-bg"
      >
        <Background color="#333" gap={15} />
        
        <Controls
          className="!bg-system-bg !border-system-border"
          style={{
            button: {
              backgroundColor: '#000',
              color: '#fff',
              borderColor: '#fff',
            },
          }}
        />
        
        <MiniMap
          className="!bg-system-bg !border-system-border"
          maskColor="rgba(0, 0, 0, 0.8)"
          nodeColor={(node: Node<Component>) => {
            const component = node.data as Component;
            if (component.isFailed) return '#ef4444';
            if (component.criticality === 'high') return '#f87171';
            if (component.criticality === 'medium') return '#fbbf24';
            return '#22c55e';
          }}
        />

        <Panel position="top-left" className="flex gap-2">
          <button
            onClick={handleAddComponent}
            className="flex items-center gap-2 px-4 py-2 bg-system-bg border border-system-border text-white rounded hover:bg-system-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Component
          </button>

          <button
            onClick={toggleSimulationMode}
            className={`flex items-center gap-2 px-4 py-2 bg-system-bg border border-system-border text-white rounded hover:bg-system-hover transition-colors ${
              simulationMode ? 'bg-yellow-900/20 border-yellow-500' : ''
            }`}
          >
            {simulationMode ? (
              <>
                <Square className="w-4 h-4" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Simulation
              </>
            )}
          </button>
        </Panel>

        {simulationMode && (
          <Panel position="top-center">
            <div className="px-4 py-2 bg-yellow-900/20 border border-yellow-500 text-yellow-400 rounded text-sm">
              Simulation Mode: Click components to toggle failure
            </div>
          </Panel>
        )}
      </ReactFlow>

      <AddComponentModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setAddComponentPosition(null);
        }}
        initialPosition={addComponentPosition}
      />

      {/* Custom Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-system-bg border border-system-border rounded shadow-lg py-1 z-[9999] min-w-[180px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
                  <button
            onClick={handleDuplicateFromMenu}
            className="w-full px-4 py-2 text-left text-white hover:bg-system-hover transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
            {contextMenu.nodeIds.length > 1 && (
              <span className="text-gray-400 text-sm ml-auto">({contextMenu.nodeIds.length})</span>
            )}
          </button>
          
          <button
            onClick={() => {
              // TODO: Implement edit (open metadata panel)
              if (contextMenu.nodeIds.length === 1) {
                setSelectedNodeId(contextMenu.nodeIds[0]);
              }
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-system-hover transition-colors flex items-center gap-2"
            disabled={contextMenu.nodeIds.length > 1}
          >
            <Edit className="w-4 h-4" />
            <span className={contextMenu.nodeIds.length > 1 ? 'text-gray-500' : ''}>Edit</span>
          </button>

          <div className="border-t border-system-border my-1"></div>
          
          <button
            onClick={handleDeleteFromMenu}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
            {contextMenu.nodeIds.length > 1 && (
              <span className="text-gray-400 text-sm ml-auto">({contextMenu.nodeIds.length})</span>
            )}
          </button>
        </div>
      )}

      {/* Pane Context Menu (right-click on empty space) */}
      {paneContextMenu && (
        <div
          className="fixed bg-system-bg border border-system-border rounded shadow-lg py-1 z-[9999] min-w-[180px]"
          style={{
            left: `${paneContextMenu.x}px`,
            top: `${paneContextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleAddComponentAtPosition}
            className="w-full px-4 py-2 text-left text-white hover:bg-system-hover transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Component</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Wrapper component that provides ReactFlowProvider
export const ArchitectureCanvas = () => {
  return (
    <ReactFlowProvider>
      <ArchitectureCanvasInner />
    </ReactFlowProvider>
  );
};