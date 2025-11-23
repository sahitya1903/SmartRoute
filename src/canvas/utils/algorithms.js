// ✅ FINAL UPDATED graphUtils.js FILE

function buildDijkstraTable(graph, dist, prev) {
  return Object.keys(graph).map((node) => ({
    node: Number(node),
    distance: dist[node] === Infinity ? "∞" : dist[node],
    parent: prev[node] !== null ? Number(prev[node]) : "-",
    neighbors: (graph[node] || []).map(n => Number(n.node)),
  }));
}

export function buildAdjacencyList(graph) {
  return Object.keys(graph).map((node) => ({
    node: Number(node),
    neighbors: (graph[node] || []).map(
      (n) => `${n.node}(${n.weight})`
    ),
  }));
}

export function buildGraph(nodes, edges, isDirected = false) {
  const graph = {};
  nodes.forEach((node) => {
    graph[node.id] = [];
  });
  edges.forEach((edge) => {
    const { from, to, weight } = edge;
    graph[from].push({ node: to, weight });
    if (!isDirected) {
      graph[to].push({ node: from, weight });
    }
  });
  return graph;
}

export function dijkstraTable(graph, startId) {
  const dist = {};
  const prev = {};
  const pq = new MinHeap();
  const visited = new Set();

  for (const node in graph) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[startId] = 0;
  pq.insert([startId, 0]);

  while (!pq.isEmpty()) {
    const [currentNode, currentDist] = pq.extractMin();
    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    for (const neighborData of graph[currentNode] || []) {
      const { node: neighbor, weight } = neighborData;
      const newDist = dist[currentNode] + weight;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        prev[neighbor] = currentNode;
        pq.insert([neighbor, newDist]);
      }
    }
  }

  return buildDijkstraTable(graph, dist, prev);
}

export function dijkstra(graph, startId, endId) {
  const dist = {};
  const prev = {};
  const pq = new MinHeap();
  const visited = new Set();
  const steps = [];

  for (const node in graph) {
    dist[node] = Infinity;
    prev[node] = null;
  }

  dist[startId] = 0;
  pq.insert([startId, 0]);

  while (!pq.isEmpty()) {
    const [currentNode, currentDist] = pq.extractMin();
    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    const prevNode = prev[currentNode];
    const neighbors = (graph[currentNode] || []).map(n => n.node);

    for (const neighborData of graph[currentNode] || []) {
      const { node: neighbor, weight } = neighborData;
      const newDist = dist[currentNode] + weight;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        prev[neighbor] = currentNode;
        pq.insert([neighbor, newDist]);
      }
    }

    steps.push({
      queue: pq.snapshot(),
      log: `Visiting ${currentNode}`,
      currentNode: Number(currentNode),
      prevNode: prevNode !== null ? Number(prevNode) : null,
      neighbors,
      table: buildDijkstraTable(graph, { ...dist }, { ...prev }),
    });
  }

  const path = [];
  let current = endId;
  while (current !== null) {
    path.unshift(Number(current));
    current = prev[current];
  }

  if (path.length === 1 && String(path[0]) !== String(startId) || dist[endId] === Infinity || prev[endId] === null && String(startId) !== String(endId)) {
    return { steps, path: null, distance: null };
  }

  return { steps, path, distance: dist[endId] };
}

export function bfsShortestPath(graph, startId, endId) {
  const queue = [[startId]];
  const visited = new Set([startId]);
  const steps = [];
  let foundPath = null;
  const parent = {};

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];
    const neighbors = (graph[node] || []).map(n => n.node);
    const prevNode = path.length > 1 ? path[path.length - 2] : null;

    steps.push({
      queue: queue.map(p => p.join("→")),
      log: `Visiting ${node}`,
      table: buildBfsTable(visited, parent),
      currentNode: node,
      prevNode,
      neighbors,
    });

    if (String(node) === String(endId)) {
      foundPath = path;
      break;
    }

    for (const neighborObj of graph[node] || []) {
      const neighbor = neighborObj.node;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent[neighbor] = node;
        queue.push([...path, neighbor]);
      }
    }
  }

  if (!foundPath) {
    return { steps, path: null, distance: null };
  }

  let totalDistance = 0;
  for (let i = 1; i < foundPath.length; i++) {
    const from = foundPath[i - 1];
    const to = foundPath[i];
    const edge = (graph[from] || []).find(e => String(e.node) === String(to));
    totalDistance += edge ? edge.weight : 1;
  }

  return { steps, path: foundPath, distance: totalDistance };
}

export function buildBfsTable(visitedSet, parentMap) {
  return Array.from(visitedSet).map(node => ({
    node,
    distance: "-",
    parent: parentMap?.[node] ?? "-",
    neighbors: "-",
  }));
}

export class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(item) {
    this.heap.push(item);
    this.bubbleUp();
  }

  bubbleUp() {
    let idx = this.heap.length - 1;
    while (idx > 0) {
      let parentIdx = Math.floor((idx - 1) / 2);
      if (this.heap[parentIdx][1] <= this.heap[idx][1]) break;
      [this.heap[parentIdx], this.heap[idx]] = [this.heap[idx], this.heap[parentIdx]];
      idx = parentIdx;
    }
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return min;
  }

  sinkDown(i) {
    const length = this.heap.length;
    while (true) {
      let left = 2 * i + 1;
      let right = 2 * i + 2;
      let smallest = i;
      if (left < length && this.heap[left][1] < this.heap[smallest][1]) smallest = left;
      if (right < length && this.heap[right][1] < this.heap[smallest][1]) smallest = right;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  snapshot() {
    return [...this.heap].sort((a, b) => a[1] - b[1]).map(([node, dist]) => `${node}(${dist.toFixed(2)})`);
  }

  toArray() {
    return this.heap.map(([id, dist]) => `${id}(${dist})`);
  }
}

function heuristic(nodeA, nodeB, nodeCoords) {
  if (!nodeCoords[nodeA] || !nodeCoords[nodeB]) return 0;
  const dx = nodeCoords[nodeA].x - nodeCoords[nodeB].x;
  const dy = nodeCoords[nodeA].y - nodeCoords[nodeB].y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function astar(graph, startId, endId, nodes = []) {
  const nodeCoords = {};
  nodes.forEach(n => nodeCoords[n.id] = { x: n.x, y: n.y });

  const openSet = new MinHeap();
  const cameFrom = {};
  const gScore = {};
  const fScore = {};
  const steps = [];
  const visited = new Set();

  for (const node in graph) {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
  }
  gScore[startId] = 0;
  fScore[startId] = heuristic(startId, endId, nodeCoords);
  openSet.insert([startId, fScore[startId]]);

  while (!openSet.isEmpty()) {
    const [current] = openSet.extractMin();
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = (graph[current] || []).map(n => n.node);
    const prevNode = cameFrom[current] ?? null;

    steps.push({
      queue: openSet.snapshot(),
      log: `Visiting ${current}`,
      table: buildBfsTable(visited, cameFrom),
      currentNode: Number(current),
      prevNode: prevNode !== null ? Number(prevNode) : null,
      neighbors,
    });

    if (String(current) === String(endId)) break;

    for (const neighborObj of graph[current] || []) {
      const neighbor = neighborObj.node;
      const tentative_gScore = gScore[current] + neighborObj.weight;
      if (tentative_gScore < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentative_gScore;
        fScore[neighbor] = tentative_gScore + heuristic(neighbor, endId, nodeCoords);
        openSet.insert([neighbor, fScore[neighbor]]);
      }
    }
  }

  const path = [];
  let current = endId;
  while (current in cameFrom) {
    path.unshift(Number(current));
    current = cameFrom[current];
  }
  if (String(current) === String(startId)) {
    path.unshift(Number(startId));
  }

  if (path.length === 0 || String(path[0]) !== String(startId)) {
    return { steps, path: null, distance: null };
  }

  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1];
    const to = path[i];
    const edge = (graph[from] || []).find(e => String(e.node) === String(to));
    totalDistance += edge ? edge.weight : 1;
  }

  return { steps, path, distance: totalDistance };
}
