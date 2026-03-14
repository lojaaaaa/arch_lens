import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';

import type { ArchitectureNode, LayerType } from '@/shared/model/types';

const LAYER_RANK: Record<LayerType, number> = {
    frontend: 0,
    backend: 1,
    data: 2,
};

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;

export function applyDagreLayout(
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' = 'TB',
): Node[] {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({
        rankdir: direction,
        nodesep: 60,
        ranksep: 100,
        edgesep: 30,
        marginx: 40,
        marginy: 40,
    });

    for (const node of nodes) {
        const archNode = (node.data as { node?: ArchitectureNode })?.node;
        const layer = archNode?.layer ?? 'backend';
        g.setNode(node.id, {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            rank: LAYER_RANK[layer],
        });
    }

    for (const edge of edges) {
        g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    return nodes.map((node) => {
        const pos = g.node(node.id);
        if (!pos) {
            return node;
        }

        return {
            ...node,
            position: {
                x: pos.x - NODE_WIDTH / 2,
                y: pos.y - NODE_HEIGHT / 2,
            },
        };
    });
}
