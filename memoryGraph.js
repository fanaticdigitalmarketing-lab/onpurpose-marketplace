// 🧬 MEMORY GRAPH SYSTEM
// Tracks ALL issues and learning relationships

const fs = require('fs');
const path = require('path');

class MemoryGraph {
  constructor() {
    this.memoryFile = 'memoryGraph.json';
    this.graph = this.loadMemoryGraph();
    this.nodeIdCounter = this.getNextNodeId();
  }

  loadMemoryGraph() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
        return {
          nodes: data.nodes || [],
          edges: data.edges || [],
          metadata: data.metadata || {
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.error('Error loading memory graph:', error.message);
    }
    
    // Return default structure
    return {
      nodes: [],
      edges: [],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };
  }

  saveMemoryGraph() {
    try {
      this.graph.metadata.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.graph, null, 2));
      console.log('💾 Memory graph saved');
    } catch (error) {
      console.error('Error saving memory graph:', error.message);
    }
  }

  getNextNodeId() {
    const maxId = this.graph.nodes.reduce((max, node) => {
      const id = parseInt(node.id.replace(/\D/g, '')) || 0;
      return Math.max(max, id);
    }, 0);
    return maxId + 1;
  }

  addMemory(issue, fix) {
    console.log(`🧬 Adding memory: ${issue.type} → ${fix.type || 'solution'}`);
    
    // Create or find issue node
    const issueNode = this.findOrCreateNode(issue, 'issue');
    
    // Create or find solution node
    const solutionNode = this.findOrCreateNode(fix, 'solution');
    
    // Create or update edge
    const edge = this.findOrCreateEdge(issueNode.id, solutionNode.id);
    
    // Update edge weight based on success
    if (fix.success !== false) {
      this.increaseEdgeWeight(edge.id, fix.confidence || 0.8);
    } else {
      this.decreaseEdgeWeight(edge.id);
    }
    
    // Add context metadata
    this.addNodeMetadata(issueNode.id, {
      file: issue.file,
      description: issue.description,
      severity: issue.severity || 'medium',
      timestamp: new Date().toISOString()
    });
    
    this.addNodeMetadata(solutionNode.id, {
      action: fix.action,
      confidence: fix.confidence,
      explanation: fix.explanation,
      timestamp: new Date().toISOString()
    });
    
    this.saveMemoryGraph();
    
    return {
      issueNode: issueNode.id,
      solutionNode: solutionNode.id,
      edge: edge.id
    };
  }

  findOrCreateNode(entity, type) {
    let node = this.graph.nodes.find(n => 
      n.type === type && 
      (n.label === entity.type || n.label === entity.action)
    );
    
    if (!node) {
      node = {
        id: `node_${this.nodeIdCounter++}`,
        label: entity.type || entity.action || 'unknown',
        type: type,
        metadata: {},
        createdAt: new Date().toISOString()
      };
      
      this.graph.nodes.push(node);
      console.log(`🆕 Created ${type} node: ${node.label}`);
    }
    
    return node;
  }

  findOrCreateEdge(fromNodeId, toNodeId) {
    let edge = this.graph.edges.find(e => 
      e.from === fromNodeId && e.to === toNodeId
    );
    
    if (!edge) {
      edge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from: fromNodeId,
        to: toNodeId,
        weight: 0.5,
        usageCount: 0,
        successCount: 0,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
      
      this.graph.edges.push(edge);
      console.log(`🔗 Created edge: ${fromNodeId} → ${toNodeId}`);
    }
    
    return edge;
  }

  increaseEdgeWeight(edgeId, confidence) {
    const edge = this.graph.edges.find(e => e.id === edgeId);
    if (edge) {
      edge.usageCount = (edge.usageCount || 0) + 1;
      edge.successCount = (edge.successCount || 0) + 1;
      
      // Calculate new weight based on success rate and confidence
      const successRate = edge.successCount / edge.usageCount;
      edge.weight = (edge.weight * 0.7) + (successRate * confidence * 0.3);
      edge.lastUsed = new Date().toISOString();
      
      console.log(`⬆️ Increased edge weight: ${edgeId} → ${edge.weight.toFixed(3)}`);
    }
  }

  decreaseEdgeWeight(edgeId) {
    const edge = this.graph.edges.find(e => e.id === edgeId);
    if (edge) {
      edge.usageCount = (edge.usageCount || 0) + 1;
      edge.weight = Math.max(0.1, edge.weight * 0.8);
      edge.lastUsed = new Date().toISOString();
      
      console.log(`⬇️ Decreased edge weight: ${edgeId} → ${edge.weight.toFixed(3)}`);
    }
  }

  addNodeMetadata(nodeId, metadata) {
    const node = this.graph.nodes.find(n => n.id === nodeId);
    if (node) {
      node.metadata = { ...node.metadata, ...metadata };
    }
  }

  findBestFix(issueType) {
    console.log(`🔍 Finding best fix for: ${issueType}`);
    
    // Find all issue nodes matching the type
    const issueNodes = this.graph.nodes.filter(n => 
      n.type === 'issue' && n.label === issueType
    );
    
    if (issueNodes.length === 0) {
      console.log(`❌ No memory found for issue type: ${issueType}`);
      return null;
    }
    
    // Find all edges from these issue nodes
    const candidateEdges = this.graph.edges.filter(e => 
      issueNodes.some(node => node.id === e.from)
    );
    
    if (candidateEdges.length === 0) {
      console.log(`❌ No solutions found for issue type: ${issueType}`);
      return null;
    }
    
    // Sort by weight (highest first)
    candidateEdges.sort((a, b) => b.weight - a.weight);
    
    const bestEdge = candidateEdges[0];
    const solutionNode = this.graph.nodes.find(n => n.id === bestEdge.to);
    
    console.log(`✅ Best fix found: ${solutionNode.label} (weight: ${bestEdge.weight.toFixed(3)})`);
    
    return {
      solution: solutionNode,
      edge: bestEdge,
      confidence: bestEdge.weight,
      usageCount: bestEdge.usageCount,
      successRate: bestEdge.successCount / bestEdge.usageCount
    };
  }

  getRelatedIssues(issueType) {
    const issueNode = this.graph.nodes.find(n => 
      n.type === 'issue' && n.label === issueType
    );
    
    if (!issueNode) return [];
    
    // Find all edges connected to this issue
    const connectedEdges = this.graph.edges.filter(e => 
      e.from === issueNode.id || e.to === issueNode.id
    );
    
    const relatedNodes = connectedEdges.map(edge => {
      const connectedNodeId = edge.from === issueNode.id ? edge.to : edge.from;
      return this.graph.nodes.find(n => n.id === connectedNodeId);
    }).filter(node => node);
    
    return relatedNodes;
  }

  getGraphStatistics() {
    const issueNodes = this.graph.nodes.filter(n => n.type === 'issue');
    const solutionNodes = this.graph.nodes.filter(n => n.type === 'solution');
    
    const totalUsage = this.graph.edges.reduce((sum, edge) => sum + (edge.usageCount || 0), 0);
    const totalSuccess = this.graph.edges.reduce((sum, edge) => sum + (edge.successCount || 0), 0);
    const averageWeight = this.graph.edges.reduce((sum, edge) => sum + edge.weight, 0) / this.graph.edges.length;
    
    return {
      totalNodes: this.graph.nodes.length,
      totalEdges: this.graph.edges.length,
      issueNodes: issueNodes.length,
      solutionNodes: solutionNodes.length,
      totalUsage,
      totalSuccess,
      averageSuccessRate: totalUsage > 0 ? totalSuccess / totalUsage : 0,
      averageWeight,
      lastUpdated: this.graph.metadata.lastUpdated
    };
  }

  getTopPerformingSolutions(limit = 10) {
    const solutionEdges = this.graph.edges.map(edge => {
      const solutionNode = this.graph.nodes.find(n => n.id === edge.to && n.type === 'solution');
      return {
        solution: solutionNode,
        edge: edge,
        successRate: edge.usageCount > 0 ? edge.successCount / edge.usageCount : 0,
        weight: edge.weight,
        usageCount: edge.usageCount
      };
    }).filter(item => item.solution);
    
    // Sort by success rate and weight
    solutionEdges.sort((a, b) => {
      const scoreA = a.successRate * a.weight;
      const scoreB = b.successRate * b.weight;
      return scoreB - scoreA;
    });
    
    return solutionEdges.slice(0, limit);
  }

  getHighRiskIssues() {
    const issueEdges = this.graph.edges.map(edge => {
      const issueNode = this.graph.nodes.find(n => n.id === edge.from && n.type === 'issue');
      return {
        issue: issueNode,
        edge: edge,
        successRate: edge.usageCount > 0 ? edge.successCount / edge.usageCount : 0,
        weight: edge.weight,
        usageCount: edge.usageCount
      };
    }).filter(item => item.issue);
    
    // High risk = low success rate or high usage with low weight
    const highRiskIssues = issueEdges.filter(item => 
      item.successRate < 0.5 || (item.usageCount > 5 && item.weight < 0.3)
    );
    
    // Sort by risk (highest first)
    highRiskIssues.sort((a, b) => {
      const riskA = (1 - a.successRate) * a.usageCount;
      const riskB = (1 - b.successRate) * b.usageCount;
      return riskB - riskA;
    });
    
    return highRiskIssues;
  }

  exportGraph() {
    return {
      ...this.graph,
      statistics: this.getGraphStatistics(),
      topSolutions: this.getTopPerformingSolutions(),
      highRiskIssues: this.getHighRiskIssues(),
      exportTimestamp: new Date().toISOString()
    };
  }

  importGraph(graphData) {
    try {
      // Validate imported data
      if (!graphData.nodes || !Array.isArray(graphData.nodes)) {
        throw new Error('Invalid graph data: missing nodes array');
      }
      
      if (!graphData.edges || !Array.isArray(graphData.edges)) {
        throw new Error('Invalid graph data: missing edges array');
      }
      
      // Merge with existing graph
      const existingNodeLabels = new Set(this.graph.nodes.map(n => n.label));
      const existingEdgePairs = new Set(this.graph.edges.map(e => `${e.from}-${e.to}`));
      
      // Add new nodes
      graphData.nodes.forEach(node => {
        if (!existingNodeLabels.has(node.label)) {
          this.graph.nodes.push({
            ...node,
            id: node.id || `node_${this.nodeIdCounter++}`,
            createdAt: node.createdAt || new Date().toISOString()
          });
        }
      });
      
      // Add new edges
      graphData.edges.forEach(edge => {
        const edgeKey = `${edge.from}-${edge.to}`;
        if (!existingEdgePairs.has(edgeKey)) {
          this.graph.edges.push({
            ...edge,
            id: edge.id || `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: edge.createdAt || new Date().toISOString()
          });
        }
      });
      
      this.saveMemoryGraph();
      console.log(`📥 Imported graph: +${graphData.nodes.length} nodes, +${graphData.edges.length} edges`);
      
    } catch (error) {
      console.error('Error importing graph:', error.message);
      throw error;
    }
  }

  visualizeGraph() {
    const visualization = {
      nodes: this.graph.nodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        metadata: node.metadata
      })),
      edges: this.graph.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        weight: edge.weight,
        usageCount: edge.usageCount,
        successCount: edge.successCount
      }))
    };
    
    return visualization;
  }

  pruneOldEdges(daysOld = 30) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    const originalEdgeCount = this.graph.edges.length;
    this.graph.edges = this.graph.edges.filter(edge => 
      new Date(edge.lastUsed) > cutoffDate
    );
    
    const prunedCount = originalEdgeCount - this.graph.edges.length;
    
    if (prunedCount > 0) {
      console.log(`🗑️ Pruned ${prunedCount} old edges (older than ${daysOld} days)`);
      this.saveMemoryGraph();
    }
    
    return prunedCount;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // High-risk issues
    const highRiskIssues = this.getHighRiskIssues();
    highRiskIssues.slice(0, 5).forEach(item => {
      recommendations.push({
        type: 'HIGH_RISK_ISSUE',
        priority: 'HIGH',
        issue: item.issue.label,
        reason: `Low success rate (${(item.successRate * 100).toFixed(1)}%) with ${item.usageCount} attempts`,
        action: 'Review and improve fix strategy'
      });
    });
    
    // Low-performing solutions
    const lowPerformingEdges = this.graph.edges.filter(edge => 
      edge.weight < 0.3 && edge.usageCount > 3
    );
    
    lowPerformingEdges.slice(0, 3).forEach(edge => {
      const solutionNode = this.graph.nodes.find(n => n.id === edge.to);
      recommendations.push({
        type: 'LOW_PERFORMING_SOLUTION',
        priority: 'MEDIUM',
        solution: solutionNode?.label,
        reason: `Low weight (${edge.weight.toFixed(3)}) after ${edge.usageCount} uses`,
        action: 'Consider alternative solution'
      });
    });
    
    return recommendations;
  }
}

module.exports = MemoryGraph;
