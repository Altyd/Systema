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
    toggleMetadataPanel,
    simulationMode,
    toggleSimulationMode,
    undo,
    redo,
    canUndo,
    canRedo,
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
  const [edgeContextMenu, setEdgeContextMenu] = useState<{
    x: number;
    y: number;
    edgeId: string;
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
    (_event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      // If multiple nodes are selected, update all of them
      const selectedNodes = allNodes.filter(n => n.selected);
      
      if (selectedNodes.length > 1) {
        // Update all selected nodes' positions
        selectedNodes.forEach(selectedNode => {
          updateComponent(selectedNode.id, { position: selectedNode.position });
        });
      } else {
        // Single node drag
        updateComponent(node.id, { position: node.position });
      }
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
      // Only set selection, don't open metadata panel
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Double-click opens the metadata panel
      setSelectedNodeId(node.id);
      toggleMetadataPanel();
    },
    [setSelectedNodeId, toggleMetadataPanel]
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
    const newNodeIds: string[] = [];
    
    // First, create all new components
    nodesToDuplicate.forEach((component, index) => {
      const newId = `component-${timestamp}-${index}`;
      idMap.set(component.id, newId);
      newNodeIds.push(newId);
      
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
    
    // Select the newly duplicated nodes after a brief delay to ensure they're rendered
    setTimeout(() => {
      setNodes(nds => nds.map(node => ({
        ...node,
        selected: newNodeIds.includes(node.id)
      })));
    }, 100);
  }, [contextMenu, currentArchitecture, addComponent, addConnection, setNodes]);

  // Handle right-click on edges
  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    event.stopPropagation();
    
    setEdgeContextMenu({
      x: event.clientX,
      y: event.clientY,
      edgeId: edge.id,
    });
    setContextMenu(null);
    setPaneContextMenu(null);
  }, []);

  // Handle delete edge from context menu
  const handleDeleteEdge = useCallback(() => {
    if (edgeContextMenu && currentArchitecture) {
      useArchitectureStore.getState().deleteConnection(edgeContextMenu.edgeId);
      setEdgeContextMenu(null);
    }
  }, [edgeContextMenu, currentArchitecture]);

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
    setEdgeContextMenu(null);
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
      setEdgeContextMenu(null);
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
  }, [contextMenu, paneContextMenu, edgeContextMenu]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      // Ctrl/Cmd + Z - undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isTyping) {
        if (canUndo()) {
          e.preventDefault();
          undo();
          console.log('Undo');
        }
        return;
      }
      
      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        if (canRedo() && !isTyping) {
          e.preventDefault();
          redo();
          console.log('Redo');
        }
        return;
      }
      
      // Delete key - delete selected edges
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        const selectedEdges = edges.filter(edge => edge.selected);
        if (selectedEdges.length > 0) {
          e.preventDefault();
          selectedEdges.forEach(edge => {
            if (currentArchitecture) {
              useArchitectureStore.getState().deleteConnection(edge.id);
            }
          });
          return;
        }
      }

      // Ctrl/Cmd + C - copy selected nodes
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey && !isTyping) {
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length > 0 && currentArchitecture) {
          e.preventDefault();
          const nodeIdsSet = new Set(selectedNodes.map(n => n.id));
          const nodesToCopy = currentArchitecture.components.filter(c => nodeIdsSet.has(c.id));
          const connectionsToCopy = currentArchitecture.connections.filter(
            conn => nodeIdsSet.has(conn.source) && nodeIdsSet.has(conn.target)
          );
          
          const copyData = {
            type: 'systema-nodes',
            nodes: nodesToCopy,
            connections: connectionsToCopy,
          };
          
          // Store in sessionStorage for paste
          sessionStorage.setItem('systema-clipboard', JSON.stringify(copyData));
          
          // Also try to copy to system clipboard
          navigator.clipboard.writeText(JSON.stringify(copyData, null, 2)).catch(() => {});
          
          console.log('Copied nodes:', nodesToCopy.length, 'connections:', connectionsToCopy.length);
        }
      }

      // Ctrl/Cmd + V - paste copied nodes or import architecture
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.shiftKey && !isTyping) {
        e.preventDefault();
        
        // Try system clipboard first (to support external JSON paste)
        navigator.clipboard.readText().then(text => {
          try {
            const data = JSON.parse(text);
            
            // Check if it's valid architecture data
            if (data.type === 'systema-nodes' && data.nodes) {
              // Paste nodes (internal format)
              const idMap = new Map<string, string>();
              const timestamp = Date.now();
              const newNodeIds: string[] = [];
              
              data.nodes.forEach((component: Component, index: number) => {
                const newId = `component-${timestamp}-${index}`;
                idMap.set(component.id, newId);
                newNodeIds.push(newId);
                
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
              
              // Paste connections
              data.connections?.forEach((connection: Connection, index: number) => {
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
              
              // Select the newly pasted nodes
              setTimeout(() => {
                setNodes(nds => nds.map(node => ({
                  ...node,
                  selected: newNodeIds.includes(node.id)
                })));
              }, 100);
              
              console.log('Pasted nodes from system clipboard:', data.nodes.length);
            } else if (data.components || data.name) {
              // It's a full architecture - import components
              const idMap = new Map<string, string>();
              const timestamp = Date.now();
              const components = data.components || [];
              const connections = data.connections || [];
              const newNodeIds: string[] = [];
              
              components.forEach((component: Component, index: number) => {
                const newId = `component-${timestamp}-${index}`;
                idMap.set(component.id, newId);
                newNodeIds.push(newId);
                
                const newComponent = {
                  ...component,
                  id: newId,
                  position: {
                    x: component.position.x + 100,
                    y: component.position.y + 100,
                  },
                };
                addComponent(newComponent);
              });
              
              connections.forEach((connection: Connection, index: number) => {
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
              
              // Select the newly imported nodes
              setTimeout(() => {
                setNodes(nds => nds.map(node => ({
                  ...node,
                  selected: newNodeIds.includes(node.id)
                })));
              }, 100);
              
              console.log('Imported architecture from system clipboard with', components.length, 'components');
            }
          } catch (err) {
            // System clipboard doesn't have valid JSON, try sessionStorage fallback
            console.log('System clipboard does not contain valid JSON, trying sessionStorage');
            
            const clipboardData = sessionStorage.getItem('systema-clipboard');
            if (clipboardData) {
              try {
                const data = JSON.parse(clipboardData);
                
                if (data.type === 'systema-nodes' && data.nodes) {
                  // Paste nodes
                  const idMap = new Map<string, string>();
                  const timestamp = Date.now();
                  const newNodeIds: string[] = [];
                  
                  data.nodes.forEach((component: Component, index: number) => {
                    const newId = `component-${timestamp}-${index}`;
                    idMap.set(component.id, newId);
                    newNodeIds.push(newId);
                    
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
                  
                  // Paste connections
                  data.connections?.forEach((connection: Connection, index: number) => {
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
                  
                  // Select the newly pasted nodes
                  setTimeout(() => {
                    setNodes(nds => nds.map(node => ({
                      ...node,
                      selected: newNodeIds.includes(node.id)
                    })));
                  }, 100);
                  
                  console.log('Pasted nodes from sessionStorage:', data.nodes.length);
                }
              } catch (storageErr) {
                console.error('Failed to paste from sessionStorage:', storageErr);
              }
            } else {
              console.log('No valid data in clipboard or sessionStorage');
            }
          }
        }).catch(err => {
          // Could not read from clipboard (permissions issue), try sessionStorage
          console.log('Could not read from system clipboard, trying sessionStorage:', err);
          
          const clipboardData = sessionStorage.getItem('systema-clipboard');
          if (clipboardData) {
            try {
              const data = JSON.parse(clipboardData);
              
              if (data.type === 'systema-nodes' && data.nodes) {
                // Paste nodes
                const idMap = new Map<string, string>();
                const timestamp = Date.now();
                const newNodeIds: string[] = [];
                
                data.nodes.forEach((component: Component, index: number) => {
                  const newId = `component-${timestamp}-${index}`;
                  idMap.set(component.id, newId);
                  newNodeIds.push(newId);
                  
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
                
                // Paste connections
                data.connections?.forEach((connection: Connection, index: number) => {
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
                
                // Select the newly pasted nodes
                setTimeout(() => {
                  setNodes(nds => nds.map(node => ({
                    ...node,
                    selected: newNodeIds.includes(node.id)
                  })));
                }, 100);
                
                console.log('Pasted nodes from sessionStorage:', data.nodes.length);
              }
            } catch (storageErr) {
              console.error('Failed to paste from sessionStorage:', storageErr);
            }
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, currentArchitecture, addComponent, addConnection, undo, redo, canUndo, canRedo, setNodes]);

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
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onSelectionContextMenu={onSelectionContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
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
        style={{ userSelect: 'none' }}
      >
        <Background color="#333" gap={15} />
        
        <Controls
          className="!bg-system-bg !border-system-border"
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
              if (contextMenu.nodeIds.length === 1) {
                setSelectedNodeId(contextMenu.nodeIds[0]);
                // Open the metadata panel if it's not already open
                if (!useArchitectureStore.getState().isMetadataPanelOpen) {
                  toggleMetadataPanel();
                }
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

      {/* Edge Context Menu (right-click on connection) */}
      {edgeContextMenu && (
        <div
          className="fixed bg-system-bg border border-system-border rounded shadow-lg py-1 z-[9999] min-w-[180px]"
          style={{
            left: `${edgeContextMenu.x}px`,
            top: `${edgeContextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDeleteEdge}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Connection</span>
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