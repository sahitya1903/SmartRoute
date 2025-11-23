import React, { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import { FaPlay, FaPause } from "react-icons/fa6";
import { VscDebugRestart } from "react-icons/vsc";
import GraphCanvas from "../GraphCanvas";
import Header from "../../../Header";
import {
  buildAdjacencyList,
  astar,
  bfsShortestPath,
  buildGraph,
  dijkstra,
} from "../../utils/algorithms"; // Adjust path accordingly

const Content = () => {
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [weights, setWeights] = useState([]);
  const [nodeId, setNodeId] = useState(1);
  const [shortestPath, setShortestPath] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(400);
  const [logMessages, setLogMessages] = useState([]);
  const [animationIndex, setAnimationIndex] = useState(0);

  const [currentTable, setCurrentTable] = useState([]);
  const [fullPriorityQueue, setFullPriorityQueue] = useState([]);

  const [totalDistance, setTotalDistance] = useState(null);

  const [currentQueue, setCurrentQueue] = useState([]);

  const [isDirected, setIsDirected] = useState(false);

  const [adjacencyListRows, setAdjacencyListRows] = useState([]);

  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const stepsRef = useRef([]);
  const currentStepRef = useRef(0);

  const visualDelay = 1000 - animationSpeed;

  const [tempMessage, setTempMessage] = useState("");
  const tempMessageTimer = useRef(null);

  const [stepMode, setStepMode] = useState(false); // false = auto, true = manual

  const [showPopup, setShowPopup] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popupType, setPopupType] = useState("table");

  useEffect(() => {
    const saved = localStorage.getItem("smartroute-graph");
    if (saved) {
      try {
        const { nodes, edges, nodeId } = JSON.parse(saved);
        setNodes(nodes || []);
        setEdges(edges || []);
        setNodeId(nodeId ?? 1);
      } catch (e) {
        // if corrupted data, reset to empty
        setNodes([]);
        setEdges([]);
        setNodeId(1);
      }
    }
  }, []);

  const handleNodeDoubleClick = (nodeId) => {
    if (!source) {
      setSource(nodeId);
      setTempMessage("Source selected");
    } else if (!destination && nodeId !== source) {
      setDestination(nodeId);
      setTempMessage("Destination selected");
    } else if (nodeId === source) {
      setTempMessage("Already selected as Source");
    } else if (nodeId === destination) {
      setTempMessage("Already selected as Destination");
    } else {
      setTempMessage("Select a different node");
    }

    // Clear message after 1 second
    if (tempMessageTimer.current) clearTimeout(tempMessageTimer.current);
    tempMessageTimer.current = setTimeout(() => setTempMessage(""), 1000);
  };

  const handleReset = () => {
    // Stop any running animation
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setSource("");
    setDestination("");
    setShortestPath([]);
    setLogMessages([]);
    // setVisibleLogSteps([]);
    setAnimationIndex(0);
    setIsAnimating(false);
    setIsPlaying(false);
    setIsPaused(false);
    stepsRef.current = [];
    currentStepRef.current = 0;
  };

  const [currentHighlight, setCurrentHighlight] = useState({
    node: null,
    edge: null,
    neighbors: [],
    blink: false,
  });

  const executeStep = () => {
    const steps = stepsRef.current;
    const i = currentStepRef.current;

    if (i >= steps.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      setCurrentHighlight({
        node: null,
        edge: null,
        neighbors: [],
        blink: false,
      });
      return;
    }
    const currentStep = steps[i];
    setCurrentTable(currentStep.table || []);
    setCurrentQueue(currentStep.queue || []);
    setFullPriorityQueue((prev) => {
      const current = currentStep.queue || [];
      const newItems = current.filter(
        (item) => !prev.some((p) => p.node === item.node)
      );
      return [...prev, ...newItems];
    });

    const { currentNode, prevNode, neighbors } = currentStep || {};

    setCurrentHighlight((prev) => ({
      node: currentNode != null ? { from: prevNode, to: currentNode } : null,
      neighbors: neighbors || [],
      blink: !prev.blink, // Toggle blink state
    }));

    // update logs
    setLogMessages((prev) => [
      ...prev,
      currentStep.log || `Step ${i + 1}: No Log message`,
    ]);

    currentStepRef.current += 1;

    if (!currentStep) {
      console.error(`Step ${i} is undefined in steps array`);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
      return;
    }
  };

  const handleStart = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!source || !destination) {
      alert("Please select both source and destination nodes");
      return;
    }

    // Reset everything first
    setLogMessages([]);
    setShortestPath([]);
    setTotalDistance(null);
    stepsRef.current = [];
    currentStepRef.current = 0;

    const graph = buildGraph(nodes, edges, isDirected);

    const adjList = buildAdjacencyList(graph);
    setAdjacencyListRows(adjList);

    setIsPlaying(true);
    setIsPaused(false);

    try {
      let result;
      if (algorithm === "bfs") {
        result = bfsShortestPath(graph, source, destination);
      } else if (algorithm === "dijkstra") {
        result = dijkstra(graph, source, destination);
      } else if (algorithm === "astar") {
        result = astar(graph, source, destination, nodes);
      } else {
        console.error("Unknown algorithm selected:", algorithm);
        alert("Error: Unknown algorithm selected");
        setIsPlaying(false);
        return;
      }

      if (!result || !result.steps || !Array.isArray(result.steps)) {
        console.error("Algorithm returned invalid result:", result);
        alert("Error: Algorithm returned invalid result");
        setIsPlaying(false);
        return;
      }

      const { steps, path, distance } = result;
      setShortestPath(path ?? null);
      setTotalDistance(distance ?? null);
      stepsRef.current = steps;

      if (!stepMode) {
        // Automatic mode
        intervalRef.current = setInterval(() => {
          executeStep();
        }, visualDelay);
      } else {
        // Manual step mode
        executeStep();
      }
    } catch (error) {
      console.error("Error running Dijkstra algorithm:", error);
      alert("Error occurred while running the algorithm");
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleResume = () => {
    if (isPaused && stepsRef.current.length > 0) {
      setIsPaused(false);
      setIsPlaying(true);

      // Resume animation from current position
      intervalRef.current = setInterval(() => {
        executeStep();
      }, visualDelay);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else if (isPaused) {
      handleResume();
    } else {
      handleStart();
    }
  };

  useEffect(() => {
    // saving in local storage
    localStorage.setItem(
      "smartroute-graph",
      JSON.stringify({ nodes, edges, nodeId })
    );
  }, [nodes, edges, nodeId]);

  return (
    <>
      <Header
        setShowPopup={setShowPopup}
        setAnchorEl={setAnchorEl}
        setPopupType={setPopupType}
      />
      <div className="container w-[98%] m-[1rem]">
        <div className="min-h-screen bg-white text-gray-900 p-6">
          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Left Panel */}
            <div className="left-cnt w-[21%] p-4 rounded-lg shadow mr-[1rem] bg-white">
              <label className="block mb-[1rem]">
                <span className="text-gray-700">Graph Type</span>
                <select
                  className="mt-[.8rem] p-[.3rem] block w-full border-gray-300 rounded-[.2rem]"
                  value={isDirected ? "directed" : "undirected"}
                  onChange={(e) => setIsDirected(e.target.value === "directed")}
                >
                  <option value="undirected">Undirected</option>
                  <option value="directed">Directed</option>
                </select>
              </label>
              <label className="block mb-[1rem]">
                <span className="text-gray-700">Source</span>
                <select
                  className="mt-[.8rem] p-[.3rem] block w-full border-gray-300 rounded-[.2rem]"
                  value={source}
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected === destination) {
                      alert("Source and destination cannot be the same.");
                      return;
                    }
                    setSource(selected);
                  }}
                >
                  <option value="" disabled>
                    Select Source
                  </option>
                  {nodes.map((node) => (
                    <option
                      key={node.id}
                      value={node.id}
                      disabled={node.id === destination}
                    >
                      Node {node.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block mb-[1rem]">
                <span className="text-gray-700">Destination</span>
                <select
                  className="mt-[.8rem] p-[.3rem] block w-full border-gray-300 rounded-[.2rem]"
                  value={destination}
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected === source) {
                      alert("Source and destination cannot be the same.");
                      return;
                    }
                    setDestination(selected);
                  }}
                >
                  <option value="" disabled>
                    Select Destination
                  </option>
                  {nodes.map((node) => (
                    <option
                      key={node.id}
                      value={node.id}
                      disabled={node.id === source}
                    >
                      Node {node.id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-row items-center justify-between mb-[1rem]">
                <div className="flex gap-[.5rem] mb-[1rem]">
                  <Button
                    variant="contained"
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={handleStart}
                    disabled={isPlaying}
                  >
                    Start
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded !color-[#000]"
                  >
                    Reset
                  </Button>
                </div>
                <label className="flex items-center gap-[.4rem] mb-[.4rem] p-[.2rem]">
                  <input
                    type="checkbox"
                    checked={stepMode}
                    onChange={() => setStepMode((prev) => !prev)}
                    className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                    disabled={isPlaying}
                  />
                  <span className="text-[1.3em]">Steps</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Animation Speed
                </label>
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="50"
                  className="w-full"
                  value={animationSpeed}
                  onChange={(e) => {
                    const speed = Number(e.target.value);
                    setAnimationSpeed(speed);
                  }}
                />
                <div className="text-xs text-gray-500 text-center mt-1">
                  {animationSpeed}ms
                </div>
              </div>

              <label className="block mb-[1rem]">
                <span className="text-gray-700">Algorithm</span>
                <select
                  className="mt-[.8rem] p-[.3rem] block w-full border-gray-300 rounded-[.2rem]"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                >
                  <option value="dijkstra">Dijkstra</option>
                  <option value="bfs">BFS</option>
{/*                   <option value="astar">A*</option> */}
                </select>
              </label>

              {/* Shortest Path Display */}
              <div className="bg-[#ede8e8] mt-[1rem] p-[.5rem] rounded-[.4rem] shadow-inner min-h-16 max-h-32 overflow-x-auto text-sm break-words">
                <p>
                  <strong>Shortest Path:</strong>
                </p>
                <div className="mt-1 font-mono text-xs leading-relaxed text-gray-700">
                  {shortestPath === null ? (
                    <p className="text-red-500">No path exists</p>
                  ) : shortestPath.length === 0 ? (
                    <p className="text-gray-500">No path found yet</p>
                  ) : (
                    <>
                      {shortestPath.map((node, idx) => (
                        <span key={idx}>
                          {node}
                          {idx !== shortestPath.length - 1 && " → "}
                        </span>
                      ))}
                      <div className="mt-[.4rem] text-[#37b9f5] font-[400]">
                        <strong>Total Distance:</strong>{" "}
                        {totalDistance ?? "N/A"}
                      </div>
                    </>
                  )}
                </div>
                <hr />
                <div>
                  <strong>Priority Queue:</strong>
                  <div className="mt-1 font-mono text-xs leading-relaxed text-gray-700">
                    <ul className="text-xs list-disc list-inside">
                      {currentQueue.length === 0 ? (
                        <li className="text-gray-400">Queue is empty.</li>
                      ) : (
                        currentQueue.map((item, idx) => (
                          <li key={idx} className="mb-[.2rem]">
                            {typeof item === "object"
                              ? JSON.stringify(item)
                              : String(item)}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel (Graph Canvas) */}
            <div className="right-cnt flex-1 bg-[#b8b6b6] ml-[1rem] rounded-[.5rem] shadow relative overflow-hidden">
              {tempMessage && (
                <div
                  className="fixed mt-[10px] ml-[35%] transform -translate-x-1/2 z-50 px-[1.2rem] py-[.6rem] rounded-[8px] shadow-[8px] bg-[#eceae3] text-[#302e28] text-lg font-semibold transition-opacity duration-500"
                  style={{
                    opacity: tempMessage ? 1 : 0,
                    pointerEvents: "none",
                    minWidth: "220px",
                    textAlign: "center",
                  }}
                >
                  {tempMessage}
                </div>
              )}
              <GraphCanvas
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
                nodeId={nodeId}
                setNodeId={setNodeId}
                shortestPath={shortestPath}
                animationSpeed={animationSpeed}
                isDirected={isDirected}
                onNodeDoubleClick={handleNodeDoubleClick}
                currentHighlight={currentHighlight}
                dijkstraRows={currentTable}
                showPopup={showPopup}
                anchorEl={anchorEl}
                setShowPopup={setShowPopup}
                popupType={popupType}
                logMessages={logMessages}
                adjacencyListRows={adjacencyListRows}
              />
            </div>
          </div>

          {/* Bottom Control Bar - Fixed alignment and functionality */}
          <div className="mt-[1.2rem] bg-gradient-to-r from-gray-100 to-gray-200 p-[1rem] rounded-lg shadow flex justify-between items-center mx-auto">
            {/* Control Buttons */}
            <div className="play-panel flex items-center justify-center flex-row gap-[1rem]">
              <button
                onClick={handlePlayPause}
                className={`
                flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-md
                ${
                  isPlaying
                    ? "bg-[#f59b56] hover:bg-[#d16b1d] text-white"
                    : "bg-[#bc4cf5] hover:bg-[#670299] text-white"
                }
                ${
                  !source || !destination
                    ? "opacity-[50%] cursor-not-allowed"
                    : "hover:scale-105"
                }
              `}
                disabled={!source || !destination}
                title={isPlaying ? "Pause" : isPaused ? "Resume" : "Play"}
              >
                {isPlaying ? (
                  <FaPause className="w-[18px] h-[18px]" />
                ) : (
                  <FaPlay className="w-[18px] h-[18px] ml-1" />
                )}
              </button>

              <button
                onClick={handleReset}
                className="
                flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-md
                bg-red-500 hover:bg-red-600 text-white hover:scale-105
              "
                title="Reset"
              >
                <VscDebugRestart className="w-[20px] h-[20px]" />
              </button>
              <Button
                onClick={() => {
                  if (stepMode && isPlaying) executeStep();
                }}
                className="bg-[#4cf181] hover:bg-[#fbd3ea] text-white px-4 py-2 rounded transition-all duration-200 shadow-md"
                disabled={!stepMode || !isPlaying}
              >
                Next Step
              </Button>
            </div>

            {/* Status and Progress */}
            <div className="flex items-center gap-4">
              {/* Progress indicator */}
              {stepsRef.current.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Progress: {currentStepRef.current}/{stepsRef.current.length}
                  </div>{" "}
                  &nbsp;
                  <div className="w-32 bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          stepsRef.current.length > 0
                            ? (currentStepRef.current /
                                stepsRef.current.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isPlaying
                      ? "bg-green-500 animate-pulse"
                      : isPaused
                      ? "bg-orange-500"
                      : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  {isPlaying ? "Running" : isPaused ? "Paused" : "Ready"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Content;
