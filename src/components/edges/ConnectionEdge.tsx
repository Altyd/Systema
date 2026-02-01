import { memo } from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import { Connection } from '../../types';

export const ConnectionEdge = memo((props: EdgeProps<Connection>) => {
  const { sourceX, sourceY, targetX, targetY, data } = props;
  
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const isControl = data?.isControlFlow;
  const isCritical = data?.isCriticalPath;

  return (
    <>
      <BaseEdge
        path={edgePath}
        {...props}
        style={{
          stroke: isCritical ? '#ef4444' : isControl ? '#facc15' : '#ffffff',
          strokeWidth: isCritical ? 3 : 2,
          strokeDasharray: isControl ? '5,5' : 'none',
        }}
      />
    </>
  );
});

ConnectionEdge.displayName = 'ConnectionEdge';
