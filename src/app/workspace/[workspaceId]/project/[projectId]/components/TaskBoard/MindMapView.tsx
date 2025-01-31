'use client';

import { useState } from 'react';

interface MindMapNode {
  id: string;
  title: string;
  children: MindMapNode[];
}

export default function MindMapView() {
  const [nodes] = useState<MindMapNode[]>([
    {
      id: '1',
      title: 'Project Overview',
      children: [
        {
          id: '1-1',
          title: 'Planning',
          children: [
            {
              id: '1-1-1',
              title: 'Requirements',
              children: [],
            },
            {
              id: '1-1-2',
              title: 'Timeline',
              children: [],
            },
          ],
        },
        {
          id: '1-2',
          title: 'Development',
          children: [
            {
              id: '1-2-1',
              title: 'Frontend',
              children: [],
            },
            {
              id: '1-2-2',
              title: 'Backend',
              children: [],
            },
          ],
        },
      ],
    },
  ]);

  const renderNode = (node: MindMapNode, level: number = 0) => (
    <div
      key={node.id}
      className="relative"
      style={{ marginLeft: `${level * 40}px` }}
    >
      <div className="p-3 border rounded-lg bg-background shadow-sm mb-2 hover:bg-muted/50 transition-colors">
        <h3 className="font-medium">{node.title}</h3>
      </div>
      {node.children.length > 0 && (
        <div className="space-y-2">
          {node.children.map((child) => renderNode(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Mind Map View</h2>
      <div className="space-y-4">
        {nodes.map((node) => renderNode(node))}
      </div>
    </div>
  );
} 