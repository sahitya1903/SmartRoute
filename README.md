# 🎯 SmartRoute

> _Visualize Graph Algorithms. Understand them like never before._

[![MIT License](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Powered%20by-Vite-purple)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38bdf8)](https://tailwindcss.com/)




## 🚀 What is SmartRoute?

**SmartRoute** is an interactive web application for visualizing and understanding graph algorithms like:

- 📌 **Dijkstra's Algorithm**
- 🔄 **Breadth-First Search (BFS)**

Built for **learners, educators, and curious minds** who want to explore how shortest path algorithms really work—step by step.

---

## 🌟 Features
- 🎨 **Interactive Graph Editor** – Add, drag, and link nodes visually.
- 🔁 **Directed & Undirected Graphs** – Easily toggle graph types.
- 🧠 **Multiple Algorithms** – Choose from Dijkstra or BFS.
- 🎮 **Step-by-Step Animations** – Watch the algorithm unfold in real time or at your own pace.
- 📏 **Path & Distance Display** – Clearly shows results of the shortest path.
- 💬 **Instant Node Feedback** – Get quick messages when selecting source/destination nodes.
- 📱 **Responsive UI** – Built with React + Tailwind CSS for a clean and modern interface.

---



## 🛠️ Tech Stack

| Area             | Tools                     |
| ---------------- | ------------------------- |
| 🖥 Frontend       | React                     |
| 💅 Styling       | Tailwind CSS, Material UI |
| 🎨 Icons         | React Icons               |
| ⚙️ Build         | Vite                      |
| 📊 Visualization | SVG                       |
| ↻ State Mgmt     | React Hooks               |

---

## 📦 Installation Guide

```bash
# 1. Clone the repo
git clone https://github.com/sahitya1903/SmartRoute.git
cd SmartRoute

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open your browser and navigate to [http://localhost:5173](http://localhost:5173)

---

## 📚 Algorithms Explained

<details>
<summary><strong>🔹 Dijkstra’s Algorithm</strong></summary>

- **Purpose:** Finds shortest paths from a single source node to all others in a weighted graph (no negative weights).
- **How:** Uses a priority queue to always explore the lowest-distance node next.
- **Use Case:** GPS, traffic routing, network latency.
</details>

<details>
<summary><strong>🔸 Breadth-First Search (BFS)</strong></summary>

- **Purpose:** Shortest path in an unweighted graph (or equal-weight edges).
- **How:** Explores layer by layer using a queue.
- **Use Case:** Social networks, games, tree traversals.
</details>


---

## 🧪 How to Use

1. **Add Nodes:** Click on the canvas to add nodes.
2. **Connect Nodes:** Click and drag from one node to another to create edges. Double-click edge weights to edit them.
3. **Select Source/Destination:** Double-click a node to set it as the source, then double-click another node to set as destination. Temporary messages will confirm your selection.
4. **Choose Graph Type:** Use the dropdown to switch between directed and undirected graphs.
5. **Select Algorithm:** Use the dropdown to choose Dijkstra or BFS.
6. **Start Animation:** Click "Start" to visualize the algorithm. Use the play/pause/reset controls as needed.
7. **Step Mode:** Enable "Steps" to manually advance the algorithm using the "Next Step" button.
8. **View Results:** The shortest path and its total distance will be displayed in the left panel.

---

## 🪩 File Structure

```
src/
├── App.jsx
├── main.jsx
├── index.css
└── canvas/
    ├── components/
    │   ├── Content/
    │   │   └── index.jsx
    │   └── GraphCanvas/
    │       ├── index.jsx
    │       └── styles.css
    └── utils/
        ├── algorithms.js
        └── utils.js
```

---

## 🤝 Contribute to SmartRoute!

We love contributions! 💚  
If you'd like to add features, fix bugs, or suggest improvements:

1. **Fork this repo**
2. **Create a branch with your feature/fix**
3. **Submit a Pull Request with a clear description**

💬 If you spot any mistakes or want to help improve documentation, feel free to open an issue or PR!

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
