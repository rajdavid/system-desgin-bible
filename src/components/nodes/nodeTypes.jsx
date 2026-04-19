import { Handle, Position } from '@xyflow/react';

const base =
  'px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-xl min-w-[100px] text-center';

function NodeShell({ children, className, data }) {
  return (
    <div className={`${base} ${className}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-white/60 !border-white/30" />
      <div className="font-semibold leading-tight">{data.label}</div>
      {data.subtitle && (
        <div className="text-[10px] opacity-70 mt-0.5">{data.subtitle}</div>
      )}
      {children}
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-white/60 !border-white/30" />
    </div>
  );
}

export function ClientNode({ data }) {
  return (
    <NodeShell data={data} className="bg-blue-500/20 border-blue-400/40 text-blue-100 dark:text-blue-200" />
  );
}

export function LoadBalancerNode({ data }) {
  return (
    <NodeShell data={data} className="bg-violet-500/20 border-violet-400/40 text-violet-100 dark:text-violet-200" />
  );
}

export function AppServerNode({ data }) {
  return (
    <NodeShell data={data} className="bg-sky-500/20 border-sky-400/40 text-sky-100 dark:text-sky-200" />
  );
}

export function DatabaseNode({ data }) {
  return (
    <NodeShell data={data} className="bg-emerald-500/20 border-emerald-400/40 text-emerald-100 dark:text-emerald-200 rounded-[16px_16px_8px_8px]" />
  );
}

export function CacheNode({ data }) {
  return (
    <NodeShell data={data} className="bg-amber-500/20 border-amber-400/40 text-amber-100 dark:text-amber-200" />
  );
}

export function MessageQueueNode({ data }) {
  return (
    <NodeShell data={data} className="bg-orange-500/20 border-orange-400/40 text-orange-100 dark:text-orange-200" />
  );
}

export function CDNNode({ data }) {
  return (
    <NodeShell data={data} className="bg-cyan-500/20 border-cyan-400/40 text-cyan-100 dark:text-cyan-200" />
  );
}

export function ServiceNode({ data }) {
  return (
    <NodeShell data={data} className="bg-indigo-500/20 border-indigo-400/40 text-indigo-100 dark:text-indigo-200" />
  );
}

export function DecisionNode({ data }) {
  return (
    <NodeShell data={data} className="bg-purple-500/20 border-purple-400/40 text-purple-100 dark:text-purple-200 rotate-0" />
  );
}

export function WarningNode({ data }) {
  return (
    <NodeShell data={data} className="bg-red-500/20 border-red-400/40 text-red-100 dark:text-red-200" />
  );
}

export function SuccessNode({ data }) {
  return (
    <NodeShell data={data} className="bg-green-500/20 border-green-400/40 text-green-100 dark:text-green-200" />
  );
}

export function ExternalNode({ data }) {
  return (
    <NodeShell data={data} className="bg-slate-500/20 border-slate-400/40 text-slate-100 dark:text-slate-200 border-dashed" />
  );
}

export const nodeTypes = {
  client: ClientNode,
  loadbalancer: LoadBalancerNode,
  appserver: AppServerNode,
  database: DatabaseNode,
  cache: CacheNode,
  queue: MessageQueueNode,
  cdn: CDNNode,
  service: ServiceNode,
  decision: DecisionNode,
  warning: WarningNode,
  success: SuccessNode,
  external: ExternalNode,
};
