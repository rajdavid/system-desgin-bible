import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodeTypes';

/**
 * Converts extracted diagram data (nodes array from questions.js) into
 * React Flow nodes + edges with auto-layout (horizontal row).
 */
function buildFlowData(diagramNodes) {
  if (!diagramNodes?.length) return { nodes: [], edges: [] };

  const spacing = 200;
  const nodes = diagramNodes.map((n, i) => ({
    id: n.id,
    type: n.type || 'service',
    data: { label: n.label, subtitle: n.subtitle },
    position: { x: i * spacing, y: 60 },
  }));

  const edges = [];
  for (let i = 0; i < diagramNodes.length - 1; i++) {
    edges.push({
      id: `e-${diagramNodes[i].id}-${diagramNodes[i + 1].id}`,
      source: diagramNodes[i].id,
      target: diagramNodes[i + 1].id,
      animated: true,
      style: { stroke: '#C4643A', strokeWidth: 2 },
    });
  }

  return { nodes, edges };
}

export default function DiagramViewer({ diagramNodes, diagramTitle }) {
  const { nodes: initialNodes, edges: initialEdges } = buildFlowData(diagramNodes);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!diagramNodes?.length) return null;

  return (
    <div className="my-8 rounded-2xl border border-white/10 dark:border-night-400 overflow-hidden bg-gradient-to-br from-night-50/80 to-night-200/80 backdrop-blur-xl">
      {diagramTitle && (
        <div className="px-5 py-3 border-b border-white/10 dark:border-night-400 text-sm font-semibold text-night-900 dark:text-night-900">
          {diagramTitle}
        </div>
      )}
      <div className="h-[340px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="#3A3A40" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-night-300/80 !border-night-500 !rounded-xl !shadow-xl [&>button]:!bg-night-200 [&>button]:!border-night-500 [&>button]:!text-night-800 [&>button:hover]:!bg-night-400"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
