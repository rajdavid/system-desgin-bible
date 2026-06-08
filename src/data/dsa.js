// Auto-ported from dsa-tracker HTML — 27 topics, 271 questions.
// N = NeetCode150, B = Blind75, S = Striver.

export const TOPICS = [
  // DS topics 1-13
  { id: 1, name: "Arrays", category: "DS" },
  { id: 2, name: "Strings", category: "DS" },
  { id: 3, name: "Linked Lists", category: "DS" },
  { id: 4, name: "Stacks", category: "DS" },
  { id: 5, name: "Queues & Deque", category: "DS" },
  { id: 6, name: "Hash Maps / Sets", category: "DS" },
  { id: 7, name: "Trees", category: "DS" },
  { id: 8, name: "Heaps", category: "DS" },
  { id: 9, name: "Tries", category: "DS" },
  { id: 10, name: "Graphs", category: "DS" },
  { id: 11, name: "Union-Find", category: "DS" },
  { id: 12, name: "Segment / Fenwick Trees", category: "DS" },
  { id: 13, name: "LRU / LFU Cache", category: "DS" },
  // Algo topics 14-27
  { id: 14, name: "Sorting", category: "A" },
  { id: 15, name: "Binary Search", category: "A" },
  { id: 16, name: "Two Pointers", category: "A" },
  { id: 17, name: "Sliding Window", category: "A" },
  { id: 18, name: "Backtracking", category: "A" },
  { id: 19, name: "Divide & Conquer", category: "A" },
  { id: 20, name: "Greedy", category: "A" },
  { id: 21, name: "Dynamic Programming", category: "A" },
  { id: 22, name: "Graph Algorithms", category: "A" },
  { id: 23, name: "Bit Manipulation", category: "A" },
  { id: 24, name: "Math & Number Theory", category: "A" },
  { id: 25, name: "String Algorithms", category: "A" },
  { id: 26, name: "Interval Algorithms", category: "A" },
  { id: 27, name: "Prefix Sum", category: "A" },
];

export const QUESTIONS = [
  // ===== TOPIC 1: Arrays =====
  { id: 1, topic: 1, name: "Two Sum", lc: 1, d: "E", co: ["G","Am","Me","Ap","Nf"], role: ["AI","BE","FE"], lists: "N,B,S", tc: "O(n)", sc: "O(n)", pattern: "Hash Map lookup" },
  { id: 2, topic: 1, name: "Best Time to Buy and Sell Stock", lc: 121, d: "E", co: ["G","Am","Me","Ap"], role: ["AI","BE"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Kadane's variant" },
  { id: 3, topic: 1, name: "Contains Duplicate", lc: 217, d: "E", co: ["Am","Ap"], role: ["AI","BE","FE"], lists: "N,B", tc: "O(n)", sc: "O(n)", pattern: "Hash Set" },
  { id: 4, topic: 1, name: "Product of Array Except Self", lc: 238, d: "M", co: ["G","Am","Me","Ap"], role: ["AI","BE"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Prefix/Suffix" },
  { id: 5, topic: 1, name: "Maximum Subarray", lc: 53, d: "M", co: ["G","Am","Ap"], role: ["AI"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Kadane's Algorithm" },
  { id: 6, topic: 1, name: "Maximum Product Subarray", lc: 152, d: "M", co: ["Am","Ap"], role: ["AI"], lists: "N,B", tc: "O(n)", sc: "O(1)", pattern: "DP tracking min/max" },
  { id: 7, topic: 1, name: "Rotate Image", lc: 48, d: "M", co: ["G","Am","Ap"], role: ["AI"], lists: "N,S,B", tc: "O(n²)", sc: "O(1)", pattern: "Matrix rotation" },
  { id: 8, topic: 1, name: "Spiral Matrix", lc: 54, d: "M", co: ["G","Am","Ap"], role: ["AI"], lists: "N,S,B", tc: "O(m×n)", sc: "O(1)", pattern: "Boundary simulation" },
  { id: 9, topic: 1, name: "Set Matrix Zeroes", lc: 73, d: "M", co: ["Am","G"], role: ["AI"], lists: "N,S,B", tc: "O(m×n)", sc: "O(1)", pattern: "In-place marking" },
  { id: 10, topic: 1, name: "Pascal's Triangle", lc: 118, d: "E", co: ["G","Am"], role: ["AI"], lists: "S", tc: "O(n²)", sc: "O(n²)", pattern: "Row building" },
  { id: 11, topic: 1, name: "Sort Colors", lc: 75, d: "M", co: ["G","Am"], role: ["BE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Dutch National Flag" },
  { id: 12, topic: 1, name: "Move Zeroes", lc: 283, d: "E", co: ["Me","Ap","Am"], role: ["FE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Two pointer swap" },
  { id: 13, topic: 1, name: "Majority Element", lc: 169, d: "E", co: ["G","Me","Am"], role: ["AI"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Boyer-Moore voting" },
  { id: 14, topic: 1, name: "First Missing Positive", lc: 41, d: "H", co: ["G","Am"], role: ["BE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Index as hash" },
  { id: 15, topic: 1, name: "Next Permutation", lc: 31, d: "M", co: ["G","Me","Am"], role: ["AI","BE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Rightmost ascent" },

  // ===== TOPIC 2: Strings =====
  { id: 16, topic: 2, name: "Valid Palindrome", lc: 125, d: "E", co: ["Me","Am"], role: ["FE"], lists: "N,B", tc: "O(n)", sc: "O(1)", pattern: "Two pointer" },
  { id: 17, topic: 2, name: "Valid Anagram", lc: 242, d: "E", co: ["Am","Me"], role: ["FE","BE"], lists: "N,B", tc: "O(n)", sc: "O(1)", pattern: "Char frequency" },
  { id: 18, topic: 2, name: "Group Anagrams", lc: 49, d: "M", co: ["G","Am","Me","Ap"], role: ["BE"], lists: "N,B,S", tc: "O(n·k log k)", sc: "O(n·k)", pattern: "Sorted key hash" },
  { id: 19, topic: 2, name: "Longest Palindromic Substring", lc: 5, d: "M", co: ["G","Am","Me"], role: ["AI","BE"], lists: "N,B,S", tc: "O(n²)", sc: "O(1)", pattern: "Expand around center" },
  { id: 20, topic: 2, name: "Palindromic Substrings", lc: 647, d: "M", co: ["G","Am"], role: ["AI"], lists: "N,B", tc: "O(n²)", sc: "O(1)", pattern: "Expand around center" },
  { id: 21, topic: 2, name: "Encode and Decode Strings", lc: 271, d: "M", co: ["G"], role: ["BE"], lists: "N,B", tc: "O(n)", sc: "O(n)", pattern: "Length prefix" },
  { id: 22, topic: 2, name: "Minimum Remove to Make Valid Parentheses", lc: 1249, d: "M", co: ["Me"], role: ["FE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Stack + rebuild" },
  { id: 23, topic: 2, name: "Valid Palindrome II", lc: 680, d: "E", co: ["Me"], role: ["FE"], lists: "", tc: "O(n)", sc: "O(1)", pattern: "Two pointer skip" },
  { id: 24, topic: 2, name: "Longest Common Prefix", lc: 14, d: "E", co: ["G","Me","Am"], role: ["FE"], lists: "S", tc: "O(n·m)", sc: "O(1)", pattern: "Vertical scan" },
  { id: 25, topic: 2, name: "Integer to English Words", lc: 273, d: "H", co: ["Am"], role: ["FE"], lists: "", tc: "O(1)", sc: "O(1)", pattern: "Recursive chunking" },
  { id: 26, topic: 2, name: "Zigzag Conversion", lc: 6, d: "M", co: ["Am","G"], role: ["FE"], lists: "S", tc: "O(n)", sc: "O(n)", pattern: "Row simulation" },

  // ===== TOPIC 3: Linked Lists =====
  { id: 27, topic: 3, name: "Reverse Linked List", lc: 206, d: "E", co: ["Am","Ap","Nf"], role: ["BE","FE"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Iterative reversal" },
  { id: 28, topic: 3, name: "Merge Two Sorted Lists", lc: 21, d: "E", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,B,S", tc: "O(n+m)", sc: "O(1)", pattern: "Dummy head merge" },
  { id: 29, topic: 3, name: "Linked List Cycle", lc: 141, d: "E", co: ["G","Am"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Floyd's slow-fast" },
  { id: 30, topic: 3, name: "Reorder List", lc: 143, d: "M", co: ["Me"], role: ["BE"], lists: "N,B", tc: "O(n)", sc: "O(1)", pattern: "Find mid + reverse + merge" },
  { id: 31, topic: 3, name: "Remove Nth Node From End", lc: 19, d: "M", co: ["Me","G","Am"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Two pointer gap" },
  { id: 32, topic: 3, name: "Add Two Numbers", lc: 2, d: "M", co: ["Am","Me","G","Ap"], role: ["BE"], lists: "N,S", tc: "O(max(m,n))", sc: "O(max(m,n))", pattern: "Carry addition" },
  { id: 33, topic: 3, name: "Copy List with Random Pointer", lc: 138, d: "M", co: ["Me","Am"], role: ["BE"], lists: "N,S", tc: "O(n)", sc: "O(n)", pattern: "Hash map clone" },
  { id: 34, topic: 3, name: "Merge k Sorted Lists", lc: 23, d: "H", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,B,S", tc: "O(n log k)", sc: "O(k)", pattern: "Min-heap merge" },
  { id: 35, topic: 3, name: "Reverse Nodes in k-Group", lc: 25, d: "H", co: ["Me","Am"], role: ["BE"], lists: "N,S", tc: "O(n)", sc: "O(1)", pattern: "Group reversal" },
  { id: 36, topic: 3, name: "LRU Cache", lc: 146, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,S", tc: "O(1)", sc: "O(n)", pattern: "HashMap + DLL" },
  { id: 37, topic: 3, name: "Find the Duplicate Number", lc: 287, d: "M", co: ["G","Am"], role: ["BE"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Floyd's cycle" },

  // ===== TOPIC 4: Stacks =====
  { id: 38, topic: 4, name: "Valid Parentheses", lc: 20, d: "E", co: ["G","Am","Me","Ap","Nf"], role: ["FE"], lists: "N,B,S", tc: "O(n)", sc: "O(n)", pattern: "Stack matching" },
  { id: 39, topic: 4, name: "Min Stack", lc: 155, d: "M", co: ["Am","Nf"], role: ["BE"], lists: "N,S", tc: "O(1)", sc: "O(n)", pattern: "Auxiliary min stack" },
  { id: 40, topic: 4, name: "Evaluate Reverse Polish Notation", lc: 150, d: "M", co: ["Am","G"], role: ["FE"], lists: "N", tc: "O(n)", sc: "O(n)", pattern: "Operand stack" },
  { id: 41, topic: 4, name: "Daily Temperatures", lc: 739, d: "M", co: ["G","Nf"], role: ["BE"], lists: "N", tc: "O(n)", sc: "O(n)", pattern: "Monotonic stack" },
  { id: 42, topic: 4, name: "Largest Rectangle in Histogram", lc: 84, d: "H", co: ["Am","G"], role: ["AI"], lists: "N,S", tc: "O(n)", sc: "O(n)", pattern: "Monotonic stack" },
  { id: 43, topic: 4, name: "Basic Calculator II", lc: 227, d: "M", co: ["Me","Am","G"], role: ["FE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Operator precedence" },
  { id: 44, topic: 4, name: "Decode String", lc: 394, d: "M", co: ["G","Am"], role: ["FE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Nested stack" },
  { id: 45, topic: 4, name: "Asteroid Collision", lc: 735, d: "M", co: ["Me","Am"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Directional stack" },
  { id: 46, topic: 4, name: "Car Fleet", lc: 853, d: "M", co: ["G"], role: ["BE"], lists: "N", tc: "O(n log n)", sc: "O(n)", pattern: "Sort + stack" },
  { id: 47, topic: 4, name: "Trapping Rain Water", lc: 42, d: "H", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,S", tc: "O(n)", sc: "O(1)", pattern: "Two pointer / stack" },

  // ===== TOPIC 5: Queues & Deque =====
  { id: 48, topic: 5, name: "Sliding Window Maximum", lc: 239, d: "H", co: ["G","Am","Me"], role: ["BE"], lists: "N,S", tc: "O(n)", sc: "O(k)", pattern: "Monotonic deque" },
  { id: 49, topic: 5, name: "Design Hit Counter", lc: 362, d: "M", co: ["Nf","Am"], role: ["BE"], lists: "", tc: "O(1) amort", sc: "O(n)", pattern: "Queue + binary search" },
  { id: 50, topic: 5, name: "Moving Average from Data Stream", lc: 346, d: "E", co: ["Me","Ap"], role: ["BE"], lists: "", tc: "O(1)", sc: "O(k)", pattern: "Circular queue" },
  { id: 51, topic: 5, name: "Implement Queue using Stacks", lc: 232, d: "E", co: ["Am"], role: ["BE"], lists: "S", tc: "O(1) amort", sc: "O(n)", pattern: "Two stacks" },

  // ===== TOPIC 6: Hash Maps / Sets =====
  { id: 52, topic: 6, name: "Subarray Sum Equals K", lc: 560, d: "M", co: ["Me","Am","G"], role: ["AI"], lists: "S", tc: "O(n)", sc: "O(n)", pattern: "Prefix sum + hash" },
  { id: 53, topic: 6, name: "Top K Frequent Elements", lc: 347, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,B", tc: "O(n)", sc: "O(n)", pattern: "Bucket sort" },
  { id: 54, topic: 6, name: "Longest Consecutive Sequence", lc: 128, d: "M", co: ["Am","G","Me"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(n)", pattern: "Hash set streak" },
  { id: 55, topic: 6, name: "Insert Delete GetRandom O(1)", lc: 380, d: "M", co: ["Am","Me"], role: ["BE"], lists: "", tc: "O(1)", sc: "O(n)", pattern: "HashMap + array swap" },
  { id: 56, topic: 6, name: "Dot Product of Two Sparse Vectors", lc: 1570, d: "M", co: ["Me"], role: ["AI"], lists: "", tc: "O(min(L1,L2))", sc: "O(L)", pattern: "Index-value pairs" },
  { id: 57, topic: 6, name: "Isomorphic Strings", lc: 205, d: "E", co: ["G","Am"], role: ["FE","BE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Bijection map" },
  { id: 58, topic: 6, name: "Logger Rate Limiter", lc: 359, d: "E", co: ["G","Ap"], role: ["BE"], lists: "", tc: "O(1)", sc: "O(n)", pattern: "Timestamp map" },

  // ===== TOPIC 7: Trees =====
  { id: 59, topic: 7, name: "Invert Binary Tree", lc: 226, d: "E", co: ["Am","Ap"], role: ["FE","BE"], lists: "N,B,S", tc: "O(n)", sc: "O(h)", pattern: "Recursive swap" },
  { id: 60, topic: 7, name: "Maximum Depth of Binary Tree", lc: 104, d: "E", co: ["G","Am"], role: ["FE","BE"], lists: "N,B,S", tc: "O(n)", sc: "O(h)", pattern: "DFS depth" },
  { id: 61, topic: 7, name: "Same Tree", lc: 100, d: "E", co: ["Am","G"], role: ["FE"], lists: "N,B", tc: "O(n)", sc: "O(h)", pattern: "Parallel DFS" },
  { id: 62, topic: 7, name: "Subtree of Another Tree", lc: 572, d: "E", co: ["Am"], role: ["FE"], lists: "N,B", tc: "O(m×n)", sc: "O(h)", pattern: "DFS + same tree" },
  { id: 63, topic: 7, name: "Lowest Common Ancestor", lc: 236, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["FE"], lists: "S", tc: "O(n)", sc: "O(h)", pattern: "Post-order DFS" },
  { id: 64, topic: 7, name: "Binary Tree Level Order Traversal", lc: 102, d: "M", co: ["Am","G","Me"], role: ["FE"], lists: "N,S,B", tc: "O(n)", sc: "O(n)", pattern: "BFS queue" },
  { id: 65, topic: 7, name: "Validate BST", lc: 98, d: "M", co: ["G","Am","Me"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(h)", pattern: "In-order / range" },
  { id: 66, topic: 7, name: "Kth Smallest Element in BST", lc: 230, d: "M", co: ["Me","G"], role: ["BE"], lists: "N,B", tc: "O(h+k)", sc: "O(h)", pattern: "In-order traversal" },
  { id: 67, topic: 7, name: "Construct Binary Tree from Preorder & Inorder", lc: 105, d: "M", co: ["G","Am"], role: ["BE"], lists: "N,S,B", tc: "O(n)", sc: "O(n)", pattern: "Recursive partition" },
  { id: 68, topic: 7, name: "Binary Tree Right Side View", lc: 199, d: "M", co: ["Me","Am","Ap","G"], role: ["FE"], lists: "N", tc: "O(n)", sc: "O(n)", pattern: "BFS last per level" },
  { id: 69, topic: 7, name: "Diameter of Binary Tree", lc: 543, d: "E", co: ["Me","Am","G"], role: ["FE"], lists: "N", tc: "O(n)", sc: "O(h)", pattern: "DFS height + diameter" },
  { id: 70, topic: 7, name: "Balanced Binary Tree", lc: 110, d: "E", co: ["Am","G"], role: ["FE","BE"], lists: "N,S", tc: "O(n)", sc: "O(h)", pattern: "Height-balanced DFS" },
  { id: 71, topic: 7, name: "Serialize and Deserialize Binary Tree", lc: 297, d: "H", co: ["G","Am","Me","Nf"], role: ["BE"], lists: "N,S,B", tc: "O(n)", sc: "O(n)", pattern: "Preorder + queue" },
  { id: 72, topic: 7, name: "Binary Tree Maximum Path Sum", lc: 124, d: "H", co: ["G","Me"], role: ["AI"], lists: "N,B", tc: "O(n)", sc: "O(h)", pattern: "DFS max gain" },
  { id: 73, topic: 7, name: "Binary Tree Vertical Order Traversal", lc: 314, d: "M", co: ["Me"], role: ["FE"], lists: "", tc: "O(n log n)", sc: "O(n)", pattern: "BFS + column map" },
  { id: 74, topic: 7, name: "Count Good Nodes in Binary Tree", lc: 1448, d: "M", co: ["Am","G"], role: ["BE"], lists: "N", tc: "O(n)", sc: "O(h)", pattern: "DFS with max" },
  { id: 75, topic: 7, name: "Word Search II (Trie+DFS)", lc: 212, d: "H", co: ["Am","Me"], role: ["BE"], lists: "N,B", tc: "O(m·n·4^L)", sc: "O(W·L)", pattern: "Trie + backtrack" },

  // ===== TOPIC 8: Heaps =====
  { id: 76, topic: 8, name: "Kth Largest Element in Array", lc: 215, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,S", tc: "O(n) avg", sc: "O(1)", pattern: "QuickSelect / MinHeap" },
  { id: 77, topic: 8, name: "Find Median from Data Stream", lc: 295, d: "H", co: ["G","Am","Nf","Me"], role: ["AI"], lists: "N,S,B", tc: "O(log n)", sc: "O(n)", pattern: "Two heaps" },
  { id: 78, topic: 8, name: "K Closest Points to Origin", lc: 973, d: "M", co: ["G","Am","Me"], role: ["AI"], lists: "N", tc: "O(n log k)", sc: "O(k)", pattern: "MaxHeap size-k" },
  { id: 79, topic: 8, name: "Task Scheduler", lc: 621, d: "M", co: ["Am","G"], role: ["BE"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Greedy + heap" },
  { id: 80, topic: 8, name: "Reorganize String", lc: 767, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(n log n)", sc: "O(n)", pattern: "MaxHeap interleave" },
  { id: 81, topic: 8, name: "Find K Pairs with Smallest Sums", lc: 373, d: "M", co: ["Am"], role: ["AI"], lists: "", tc: "O(k log k)", sc: "O(k)", pattern: "MinHeap expand" },

  // ===== TOPIC 9: Tries =====
  { id: 82, topic: 9, name: "Implement Trie (Prefix Tree)", lc: 208, d: "M", co: ["G","Nf","Am"], role: ["BE"], lists: "N,S,B", tc: "O(L)", sc: "O(n·L)", pattern: "TrieNode children" },
  { id: 83, topic: 9, name: "Design Add and Search Words", lc: 211, d: "M", co: ["Am","Me"], role: ["BE"], lists: "N,B", tc: "O(26^L)", sc: "O(n·L)", pattern: "Trie + DFS wildcard" },
  { id: 84, topic: 9, name: "Design Search Autocomplete System", lc: 642, d: "H", co: ["Am"], role: ["BE"], lists: "", tc: "O(n·L)", sc: "O(n·L)", pattern: "Trie + priority queue" },

  // ===== TOPIC 10: Graphs =====
  { id: 85, topic: 10, name: "Number of Islands", lc: 200, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["BE","FE"], lists: "N,B,S", tc: "O(m×n)", sc: "O(m×n)", pattern: "DFS/BFS flood fill" },
  { id: 86, topic: 10, name: "Clone Graph", lc: 133, d: "M", co: ["Me","G"], role: ["BE"], lists: "N,S,B", tc: "O(V+E)", sc: "O(V)", pattern: "BFS/DFS + hashmap" },
  { id: 87, topic: 10, name: "Pacific Atlantic Water Flow", lc: 417, d: "M", co: ["Am","G"], role: ["BE"], lists: "N,B", tc: "O(m×n)", sc: "O(m×n)", pattern: "Reverse DFS from edges" },
  { id: 88, topic: 10, name: "Course Schedule", lc: 207, d: "M", co: ["G","Am","Ap","Nf"], role: ["BE"], lists: "N,B,S", tc: "O(V+E)", sc: "O(V+E)", pattern: "Cycle detection" },
  { id: 89, topic: 10, name: "Course Schedule II", lc: 210, d: "M", co: ["G","Am","Nf"], role: ["BE"], lists: "N,S", tc: "O(V+E)", sc: "O(V+E)", pattern: "Topological sort (Kahn)" },
  { id: 90, topic: 10, name: "Number of Connected Components", lc: 323, d: "M", co: ["Am","G"], role: ["BE"], lists: "N,B", tc: "O(V+E)", sc: "O(V)", pattern: "Union-Find / DFS" },
  { id: 91, topic: 10, name: "Graph Valid Tree", lc: 261, d: "M", co: ["Am"], role: ["BE"], lists: "N,B", tc: "O(V+E)", sc: "O(V)", pattern: "Cycle + connected check" },
  { id: 92, topic: 10, name: "Rotting Oranges", lc: 994, d: "M", co: ["Am"], role: ["BE","FE"], lists: "N,S", tc: "O(m×n)", sc: "O(m×n)", pattern: "Multi-source BFS" },
  { id: 93, topic: 10, name: "Walls and Gates", lc: 286, d: "M", co: ["Me"], role: ["BE"], lists: "N", tc: "O(m×n)", sc: "O(m×n)", pattern: "Multi-source BFS" },
  { id: 94, topic: 10, name: "Surrounded Regions", lc: 130, d: "M", co: ["Am","G"], role: ["BE"], lists: "N,S", tc: "O(m×n)", sc: "O(m×n)", pattern: "Border DFS" },
  { id: 95, topic: 10, name: "Word Ladder", lc: 127, d: "H", co: ["G","Am","Nf"], role: ["BE"], lists: "N,S", tc: "O(M²×N)", sc: "O(M²×N)", pattern: "BFS shortest path" },
  { id: 96, topic: 10, name: "Alien Dictionary", lc: 269, d: "H", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,B", tc: "O(C)", sc: "O(U+min(U²,N))", pattern: "Topo sort from edges" },
  { id: 97, topic: 10, name: "Making a Large Island", lc: 827, d: "H", co: ["Me","Am"], role: ["BE"], lists: "", tc: "O(m×n)", sc: "O(m×n)", pattern: "DFS + union sizes" },

  // ===== TOPIC 11: Union-Find =====
  { id: 98, topic: 11, name: "Accounts Merge", lc: 721, d: "M", co: ["Me","G"], role: ["BE"], lists: "", tc: "O(n·k·α(n))", sc: "O(n·k)", pattern: "Union-Find + sort" },
  { id: 99, topic: 11, name: "Redundant Connection", lc: 684, d: "M", co: ["Am","G"], role: ["BE"], lists: "N", tc: "O(n·α(n))", sc: "O(n)", pattern: "Union-Find cycle" },
  { id: 100, topic: 11, name: "Longest Consecutive Sequence (UF)", lc: 128, d: "M", co: ["Am","G"], role: ["BE"], lists: "N,B", tc: "O(n)", sc: "O(n)", pattern: "Union + component size" },

  // ===== TOPIC 12: Segment / Fenwick Trees =====
  { id: 101, topic: 12, name: "Range Sum Query Mutable", lc: 307, d: "M", co: ["G"], role: ["AI"], lists: "", tc: "O(log n)", sc: "O(n)", pattern: "BIT / Segment Tree" },
  { id: 102, topic: 12, name: "Count of Smaller Numbers After Self", lc: 315, d: "H", co: ["G"], role: ["AI"], lists: "", tc: "O(n log n)", sc: "O(n)", pattern: "Merge sort / BIT" },
  { id: 103, topic: 12, name: "Range Sum Query 2D Mutable", lc: 308, d: "H", co: ["G"], role: ["AI"], lists: "", tc: "O(log m · log n)", sc: "O(m×n)", pattern: "2D BIT" },

  // ===== TOPIC 13: LRU/LFU Cache =====
  { id: 104, topic: 13, name: "LRU Cache", lc: 146, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,S", tc: "O(1)", sc: "O(n)", pattern: "HashMap + DLL" },
  { id: 105, topic: 13, name: "LFU Cache", lc: 460, d: "H", co: ["Am","Me"], role: ["BE"], lists: "", tc: "O(1)", sc: "O(n)", pattern: "HashMap + freq DLL" },
  { id: 106, topic: 13, name: "All O'One Data Structure", lc: 432, d: "H", co: ["G"], role: ["BE"], lists: "", tc: "O(1)", sc: "O(n)", pattern: "Bucket DLL + HashMap" },

  // ===== TOPIC 14: Sorting =====
  { id: 107, topic: 14, name: "Merge Intervals", lc: 56, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,B,S", tc: "O(n log n)", sc: "O(n)", pattern: "Sort + merge" },
  { id: 108, topic: 14, name: "Merge Sorted Array", lc: 88, d: "E", co: ["Me","Am","Nf"], role: ["BE"], lists: "S", tc: "O(m+n)", sc: "O(1)", pattern: "Reverse two pointer" },
  { id: 109, topic: 14, name: "Largest Number", lc: 179, d: "M", co: ["G"], role: ["BE"], lists: "", tc: "O(n log n)", sc: "O(n)", pattern: "Custom comparator" },
  { id: 110, topic: 14, name: "Meeting Rooms", lc: 252, d: "E", co: ["Am"], role: ["BE"], lists: "N,B", tc: "O(n log n)", sc: "O(1)", pattern: "Sort + overlap" },
  { id: 111, topic: 14, name: "Meeting Rooms II", lc: 253, d: "M", co: ["Am","Nf"], role: ["BE"], lists: "N,B", tc: "O(n log n)", sc: "O(n)", pattern: "Sort + min-heap" },

  // ===== TOPIC 15: Binary Search =====
  { id: 112, topic: 15, name: "Binary Search", lc: 704, d: "E", co: ["G","Am"], role: ["BE","FE"], lists: "N,S", tc: "O(log n)", sc: "O(1)", pattern: "Classic BS" },
  { id: 113, topic: 15, name: "Search in Rotated Sorted Array", lc: 33, d: "M", co: ["G","Am","Me","Nf"], role: ["BE"], lists: "N,B,S", tc: "O(log n)", sc: "O(1)", pattern: "Modified BS" },
  { id: 114, topic: 15, name: "Find Minimum in Rotated Sorted Array", lc: 153, d: "M", co: ["Am","G"], role: ["BE"], lists: "N,B", tc: "O(log n)", sc: "O(1)", pattern: "BS on rotation" },
  { id: 115, topic: 15, name: "Search a 2D Matrix", lc: 74, d: "M", co: ["Ap","Am"], role: ["BE"], lists: "N,S", tc: "O(log(m×n))", sc: "O(1)", pattern: "Flattened BS" },
  { id: 116, topic: 15, name: "Koko Eating Bananas", lc: 875, d: "M", co: ["G","Nf","Am"], role: ["BE"], lists: "N", tc: "O(n log m)", sc: "O(1)", pattern: "BS on answer" },
  { id: 117, topic: 15, name: "Find Peak Element", lc: 162, d: "M", co: ["Me","Am","G"], role: ["BE"], lists: "", tc: "O(log n)", sc: "O(1)", pattern: "BS on peak" },
  { id: 118, topic: 15, name: "Median of Two Sorted Arrays", lc: 4, d: "H", co: ["G","Am","Ap","Me"], role: ["AI"], lists: "N,S", tc: "O(log min(m,n))", sc: "O(1)", pattern: "BS partition" },
  { id: 119, topic: 15, name: "Time Based Key-Value Store", lc: 981, d: "M", co: ["G","Am"], role: ["BE"], lists: "N", tc: "O(log n)", sc: "O(n)", pattern: "BS on timestamps" },
  { id: 120, topic: 15, name: "Maximum Profit in Job Scheduling", lc: 1235, d: "H", co: ["Ap","Am"], role: ["BE"], lists: "", tc: "O(n log n)", sc: "O(n)", pattern: "DP + BS" },
  { id: 121, topic: 15, name: "Random Pick with Weight", lc: 528, d: "M", co: ["Me","Am"], role: ["AI"], lists: "", tc: "O(log n)", sc: "O(n)", pattern: "Prefix sum + BS" },

  // ===== TOPIC 16: Two Pointers =====
  { id: 122, topic: 16, name: "3Sum", lc: 15, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["BE","AI"], lists: "N,B,S", tc: "O(n²)", sc: "O(1)", pattern: "Sort + two pointer" },
  { id: 123, topic: 16, name: "Container With Most Water", lc: 11, d: "M", co: ["G","Am","Ap"], role: ["AI","BE"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Shrink from wider side" },
  { id: 124, topic: 16, name: "Two Sum II - Sorted", lc: 167, d: "M", co: ["Am"], role: ["BE"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Classic two pointer" },
  { id: 125, topic: 16, name: "3Sum Closest", lc: 16, d: "M", co: ["Am","G"], role: ["AI"], lists: "S", tc: "O(n²)", sc: "O(1)", pattern: "Sort + closest track" },
  { id: 126, topic: 16, name: "Remove Duplicates from Sorted Array II", lc: 80, d: "M", co: ["G","Me"], role: ["BE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Overwrite pointer" },

  // ===== TOPIC 17: Sliding Window =====
  { id: 127, topic: 17, name: "Longest Substring Without Repeating Characters", lc: 3, d: "M", co: ["G","Am","Me","Ap","Nf"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(min(n,m))", pattern: "Expand + hash set" },
  { id: 128, topic: 17, name: "Minimum Window Substring", lc: 76, d: "H", co: ["G","Am","Me","Nf"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(k)", pattern: "Frequency map window" },
  { id: 129, topic: 17, name: "Longest Repeating Character Replacement", lc: 424, d: "M", co: ["G","Am","Ap"], role: ["BE"], lists: "N,B", tc: "O(n)", sc: "O(1)", pattern: "Max freq window" },
  { id: 130, topic: 17, name: "Permutation in String", lc: 567, d: "M", co: ["Am","G"], role: ["BE"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Fixed-size window" },
  { id: 131, topic: 17, name: "Max Consecutive Ones III", lc: 1004, d: "M", co: ["Me"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(1)", pattern: "Flip-count window" },
  { id: 132, topic: 17, name: "Fruit Into Baskets", lc: 904, d: "M", co: ["G"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(1)", pattern: "At-most-K distinct" },

  // ===== TOPIC 18: Backtracking =====
  { id: 134, topic: 18, name: "Subsets", lc: 78, d: "M", co: ["Me","Am","Ap"], role: ["AI"], lists: "N,S", tc: "O(2^n)", sc: "O(n)", pattern: "Include/exclude" },
  { id: 135, topic: 18, name: "Combination Sum", lc: 39, d: "M", co: ["Am","G"], role: ["AI"], lists: "N,S,B", tc: "O(2^t)", sc: "O(t)", pattern: "Unbounded choices" },
  { id: 136, topic: 18, name: "Permutations", lc: 46, d: "M", co: ["Me","Am","G"], role: ["AI"], lists: "N,S", tc: "O(n!)", sc: "O(n)", pattern: "Swap / used array" },
  { id: 137, topic: 18, name: "Word Search", lc: 79, d: "M", co: ["Am","G","Me"], role: ["BE"], lists: "N,S,B", tc: "O(m·n·4^L)", sc: "O(L)", pattern: "Grid DFS" },
  { id: 138, topic: 18, name: "Palindrome Partitioning", lc: 131, d: "M", co: ["G"], role: ["AI"], lists: "N", tc: "O(n·2^n)", sc: "O(n)", pattern: "Partition + check" },
  { id: 139, topic: 18, name: "Letter Combinations of Phone Number", lc: 17, d: "M", co: ["G","Am","Me"], role: ["FE","BE"], lists: "N,S", tc: "O(4^n)", sc: "O(n)", pattern: "Digit map + DFS" },
  { id: 140, topic: 18, name: "N-Queens", lc: 51, d: "H", co: ["G"], role: ["AI"], lists: "N,S", tc: "O(n!)", sc: "O(n)", pattern: "Col/diag constraint" },
  { id: 141, topic: 18, name: "Subsets II", lc: 90, d: "M", co: ["Am"], role: ["AI"], lists: "N", tc: "O(2^n)", sc: "O(n)", pattern: "Sort + skip dups" },
  { id: 142, topic: 18, name: "Combination Sum II", lc: 40, d: "M", co: ["Am"], role: ["AI"], lists: "N", tc: "O(2^n)", sc: "O(n)", pattern: "Sort + skip dups" },
  { id: 143, topic: 18, name: "Generate Parentheses", lc: 22, d: "M", co: ["G","Am"], role: ["FE"], lists: "N,S", tc: "O(4^n/√n)", sc: "O(n)", pattern: "Open/close count" },

  // ===== TOPIC 19: Divide & Conquer =====
  { id: 144, topic: 19, name: "Median of Two Sorted Arrays", lc: 4, d: "H", co: ["G","Am","Ap","Me"], role: ["AI"], lists: "N,S", tc: "O(log min(m,n))", sc: "O(1)", pattern: "BS partition" },
  { id: 146, topic: 19, name: "Maximum Subarray (D&C)", lc: 53, d: "M", co: ["G","Am"], role: ["AI"], lists: "N,B", tc: "O(n log n)", sc: "O(log n)", pattern: "Cross-boundary max" },

  // ===== TOPIC 20: Greedy =====
  { id: 147, topic: 20, name: "Jump Game", lc: 55, d: "M", co: ["Am","G","Ap"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Max reach" },
  { id: 148, topic: 20, name: "Jump Game II", lc: 45, d: "M", co: ["Am","G"], role: ["BE"], lists: "N,S", tc: "O(n)", sc: "O(1)", pattern: "BFS levels" },
  { id: 149, topic: 20, name: "Gas Station", lc: 134, d: "M", co: ["Am"], role: ["BE"], lists: "N,S", tc: "O(n)", sc: "O(1)", pattern: "Surplus tracking" },
  { id: 150, topic: 20, name: "Hand of Straights", lc: 846, d: "M", co: ["Am"], role: ["BE"], lists: "N", tc: "O(n log n)", sc: "O(n)", pattern: "TreeMap consume" },
  { id: 151, topic: 20, name: "Partition Labels", lc: 763, d: "M", co: ["Am"], role: ["BE"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Last occurrence" },
  { id: 152, topic: 20, name: "Valid Parenthesis String", lc: 678, d: "M", co: ["Am","G"], role: ["FE"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Low-high range" },
  { id: 153, topic: 20, name: "Maximum Swap", lc: 670, d: "M", co: ["Me"], role: ["AI"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Rightmost max digit" },
  { id: 154, topic: 20, name: "Can Place Flowers", lc: 605, d: "E", co: ["Me"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(1)", pattern: "Gap counting" },

  // ===== TOPIC 21: Dynamic Programming =====
  { id: 155, topic: 21, name: "Climbing Stairs", lc: 70, d: "E", co: ["G","Am"], role: ["AI"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Fibonacci DP" },
  { id: 156, topic: 21, name: "House Robber", lc: 198, d: "M", co: ["Am","Ap"], role: ["AI"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Skip/take DP" },
  { id: 157, topic: 21, name: "House Robber II", lc: 213, d: "M", co: ["Am"], role: ["AI"], lists: "N,B", tc: "O(n)", sc: "O(1)", pattern: "Circular skip/take" },
  { id: 158, topic: 21, name: "Coin Change", lc: 322, d: "M", co: ["G","Am"], role: ["AI"], lists: "N,B,S", tc: "O(n×m)", sc: "O(n)", pattern: "Min coins BFS / DP" },
  { id: 159, topic: 21, name: "Longest Increasing Subsequence", lc: 300, d: "M", co: ["G","Nf","Am"], role: ["AI"], lists: "N,B,S", tc: "O(n log n)", sc: "O(n)", pattern: "Patience sort / BS" },
  { id: 160, topic: 21, name: "Word Break", lc: 139, d: "M", co: ["Me","Am","Ap"], role: ["BE"], lists: "N,B,S", tc: "O(n²)", sc: "O(n)", pattern: "DP + trie/set" },
  { id: 161, topic: 21, name: "Unique Paths", lc: 62, d: "M", co: ["G","Am","Me"], role: ["AI"], lists: "N,S,B", tc: "O(m×n)", sc: "O(n)", pattern: "2D grid DP" },
  { id: 162, topic: 21, name: "Decode Ways", lc: 91, d: "M", co: ["Am","Me","G"], role: ["BE"], lists: "N,S,B", tc: "O(n)", sc: "O(1)", pattern: "1/2 digit branching" },
  { id: 163, topic: 21, name: "Longest Common Subsequence", lc: 1143, d: "M", co: ["Am"], role: ["AI"], lists: "N,S", tc: "O(m×n)", sc: "O(min(m,n))", pattern: "2D string DP" },
  { id: 164, topic: 21, name: "Edit Distance", lc: 72, d: "H", co: ["G","Nf"], role: ["AI"], lists: "N,S", tc: "O(m×n)", sc: "O(m×n)", pattern: "Insert/delete/replace" },
  { id: 165, topic: 21, name: "Best Time Buy Sell Stock with Cooldown", lc: 309, d: "M", co: ["Am"], role: ["AI"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "State machine DP" },
  { id: 166, topic: 21, name: "Regular Expression Matching", lc: 10, d: "H", co: ["Me","Am"], role: ["FE"], lists: "N,S", tc: "O(m×n)", sc: "O(m×n)", pattern: "2D DP regex" },
  { id: 168, topic: 21, name: "Maximal Square", lc: 221, d: "M", co: ["G"], role: ["AI"], lists: "", tc: "O(m×n)", sc: "O(n)", pattern: "2D DP min sides" },
  { id: 169, topic: 21, name: "Target Sum", lc: 494, d: "M", co: ["Am"], role: ["AI"], lists: "N", tc: "O(n×S)", sc: "O(S)", pattern: "Subset sum DP" },
  { id: 170, topic: 21, name: "Interleaving String", lc: 97, d: "M", co: ["Am"], role: ["AI"], lists: "N", tc: "O(m×n)", sc: "O(n)", pattern: "2D interleave" },
  { id: 171, topic: 21, name: "Distinct Subsequences", lc: 115, d: "H", co: ["G"], role: ["AI"], lists: "N", tc: "O(m×n)", sc: "O(n)", pattern: "Count matching" },
  { id: 172, topic: 21, name: "Burst Balloons", lc: 312, d: "H", co: ["G"], role: ["AI"], lists: "N", tc: "O(n³)", sc: "O(n²)", pattern: "Interval DP" },
  { id: 173, topic: 21, name: "Partition Equal Subset Sum", lc: 416, d: "M", co: ["Am"], role: ["AI"], lists: "N", tc: "O(n×S)", sc: "O(S)", pattern: "0/1 Knapsack" },

  // ===== TOPIC 22: Graph Algorithms =====
  { id: 174, topic: 22, name: "Network Delay Time (Dijkstra)", lc: 743, d: "M", co: ["Nf"], role: ["BE"], lists: "N", tc: "O((V+E)logV)", sc: "O(V+E)", pattern: "Dijkstra MinHeap" },
  { id: 175, topic: 22, name: "Cheapest Flights Within K Stops", lc: 787, d: "M", co: ["G"], role: ["BE"], lists: "N", tc: "O(K·E)", sc: "O(V)", pattern: "Bellman-Ford / BFS" },
  { id: 176, topic: 22, name: "Swim in Rising Water", lc: 778, d: "H", co: ["Am"], role: ["BE"], lists: "N", tc: "O(n²log n)", sc: "O(n²)", pattern: "BS + BFS / Dijkstra" },
  { id: 177, topic: 22, name: "Min Cost to Connect All Points", lc: 1584, d: "M", co: ["Am"], role: ["BE"], lists: "N", tc: "O(n²log n)", sc: "O(n²)", pattern: "Prim's / Kruskal's" },
  { id: 178, topic: 22, name: "Reconstruct Itinerary", lc: 332, d: "H", co: ["G"], role: ["BE"], lists: "N", tc: "O(E log E)", sc: "O(E)", pattern: "Hierholzer Euler path" },
  { id: 179, topic: 22, name: "Evaluate Division", lc: 399, d: "M", co: ["G","Ap"], role: ["AI"], lists: "", tc: "O(Q·(V+E))", sc: "O(V+E)", pattern: "BFS weighted graph" },
  { id: 180, topic: 22, name: "All Nodes Distance K in Binary Tree", lc: 863, d: "M", co: ["Me","Am"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Tree→graph BFS" },

  // ===== TOPIC 23: Bit Manipulation =====
  { id: 181, topic: 23, name: "Single Number", lc: 136, d: "E", co: ["G","Am"], role: ["BE"], lists: "N,S", tc: "O(n)", sc: "O(1)", pattern: "XOR all" },
  { id: 182, topic: 23, name: "Number of 1 Bits", lc: 191, d: "E", co: ["G","Am"], role: ["BE"], lists: "N,S,B", tc: "O(1)", sc: "O(1)", pattern: "Brian Kernighan" },
  { id: 183, topic: 23, name: "Counting Bits", lc: 338, d: "E", co: ["G","Ap"], role: ["AI"], lists: "N,B", tc: "O(n)", sc: "O(n)", pattern: "DP on bits" },
  { id: 184, topic: 23, name: "Missing Number", lc: 268, d: "E", co: ["G","Am","Ap"], role: ["BE"], lists: "N,S,B", tc: "O(n)", sc: "O(1)", pattern: "XOR / sum" },
  { id: 185, topic: 23, name: "Reverse Bits", lc: 190, d: "E", co: ["G"], role: ["BE"], lists: "N,B", tc: "O(1)", sc: "O(1)", pattern: "Bit shift build" },
  { id: 186, topic: 23, name: "Sum of Two Integers", lc: 371, d: "M", co: ["G"], role: ["BE"], lists: "N,B", tc: "O(1)", sc: "O(1)", pattern: "XOR + carry AND" },

  // ===== TOPIC 24: Math & Number Theory =====
  { id: 187, topic: 24, name: "Palindrome Number", lc: 9, d: "E", co: ["G","Am"], role: ["FE","BE"], lists: "S", tc: "O(log n)", sc: "O(1)", pattern: "Half reversal" },
  { id: 188, topic: 24, name: "Roman to Integer", lc: 13, d: "E", co: ["G","Me","Am"], role: ["FE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Subtraction rule" },
  { id: 189, topic: 24, name: "Pow(x, n)", lc: 50, d: "M", co: ["Me"], role: ["AI"], lists: "N,S", tc: "O(log n)", sc: "O(1)", pattern: "Fast exponentiation" },
  { id: 190, topic: 24, name: "Multiply Strings", lc: 43, d: "M", co: ["Me","Am"], role: ["AI"], lists: "N,S", tc: "O(m×n)", sc: "O(m+n)", pattern: "Grade school multiply" },
  { id: 192, topic: 24, name: "Happy Number", lc: 202, d: "E", co: ["Am"], role: ["BE"], lists: "N", tc: "O(log n)", sc: "O(1)", pattern: "Floyd's cycle" },
  { id: 193, topic: 24, name: "Plus One", lc: 66, d: "E", co: ["G"], role: ["FE","BE"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Carry propagation" },

  // ===== TOPIC 25: String Algorithms =====
  { id: 194, topic: 25, name: "Find Index of First Occurrence (strStr)", lc: 28, d: "E", co: ["Am","G","Me"], role: ["BE"], lists: "S", tc: "O(n×m)", sc: "O(1)", pattern: "Naive / KMP" },
  { id: 196, topic: 25, name: "Wildcard Matching", lc: 44, d: "H", co: ["Me"], role: ["FE"], lists: "", tc: "O(m×n)", sc: "O(m×n)", pattern: "DP wildcard" },

  // ===== TOPIC 26: Interval Algorithms =====
  { id: 197, topic: 26, name: "Insert Interval", lc: 57, d: "M", co: ["G"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(n)", pattern: "Before/overlap/after" },
  { id: 198, topic: 26, name: "Non-overlapping Intervals", lc: 435, d: "M", co: ["Am"], role: ["BE"], lists: "N,B", tc: "O(n log n)", sc: "O(1)", pattern: "Greedy earliest end" },
  { id: 199, topic: 26, name: "Interval List Intersections", lc: 986, d: "M", co: ["Me"], role: ["BE"], lists: "", tc: "O(m+n)", sc: "O(m+n)", pattern: "Two pointer merge" },
  { id: 200, topic: 26, name: "Minimum Number of Arrows", lc: 452, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(n log n)", sc: "O(1)", pattern: "Sort + greedy" },

  // ===== TOPIC 27: Prefix Sum =====
  { id: 201, topic: 27, name: "Subarray Sum Equals K", lc: 560, d: "M", co: ["Me","Am","G"], role: ["AI"], lists: "S", tc: "O(n)", sc: "O(n)", pattern: "Prefix sum + hash" },
  { id: 202, topic: 27, name: "Product of Array Except Self", lc: 238, d: "M", co: ["G","Am","Me","Ap"], role: ["BE"], lists: "N,B,S", tc: "O(n)", sc: "O(1)", pattern: "Prefix × suffix" },
  { id: 203, topic: 27, name: "Continuous Subarray Sum", lc: 523, d: "M", co: ["Me"], role: ["AI"], lists: "", tc: "O(n)", sc: "O(min(n,k))", pattern: "Mod prefix sum" },
  { id: 204, topic: 27, name: "Range Sum Query 2D Immutable", lc: 304, d: "M", co: ["G"], role: ["AI"], lists: "", tc: "O(1) query", sc: "O(m×n)", pattern: "2D prefix sum" },

  // ===== BONUS: HIGH-FREQUENCY FAANG EXTRAS (to reach 260+) =====
  { id: 205, topic: 1, name: "Squares of a Sorted Array", lc: 977, d: "E", co: ["Me"], role: ["FE"], lists: "S", tc: "O(n)", sc: "O(n)", pattern: "Two pointer ends" },
  { id: 206, topic: 1, name: "Remove Duplicates from Sorted Array", lc: 26, d: "E", co: ["G","Me","Am"], role: ["BE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Slow-fast pointer" },
  { id: 207, topic: 2, name: "Add Strings", lc: 415, d: "E", co: ["Me","Ap"], role: ["FE"], lists: "", tc: "O(max(m,n))", sc: "O(max(m,n))", pattern: "Carry addition" },
  { id: 208, topic: 2, name: "Custom Sort String", lc: 791, d: "M", co: ["Me"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Order map sort" },
  { id: 209, topic: 7, name: "Sum Root to Leaf Numbers", lc: 129, d: "M", co: ["Me","Ap"], role: ["FE"], lists: "", tc: "O(n)", sc: "O(h)", pattern: "DFS accumulator" },
  { id: 210, topic: 7, name: "Flatten Binary Tree to Linked List", lc: 114, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(1)", pattern: "Morris threading" },
  { id: 211, topic: 7, name: "Lowest Common Ancestor of BST", lc: 235, d: "M", co: ["G","Am"], role: ["FE","BE"], lists: "N,B", tc: "O(h)", sc: "O(1)", pattern: "BST split path" },
  { id: 212, topic: 10, name: "Shortest Path in Binary Matrix", lc: 1091, d: "M", co: ["Me"], role: ["BE"], lists: "", tc: "O(m×n)", sc: "O(m×n)", pattern: "BFS 8-directional" },
  { id: 213, topic: 17, name: "Subarrays with K Different Integers", lc: 992, d: "H", co: ["Am"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(k)", pattern: "At-most-K trick" },
  { id: 214, topic: 21, name: "Minimum Path Sum", lc: 64, d: "M", co: ["Am","Ap"], role: ["AI"], lists: "S", tc: "O(m×n)", sc: "O(n)", pattern: "Grid DP" },
  { id: 215, topic: 21, name: "Coin Change II", lc: 518, d: "M", co: ["G"], role: ["AI"], lists: "N", tc: "O(n×m)", sc: "O(n)", pattern: "Unbounded knapsack" },
  { id: 216, topic: 10, name: "Is Graph Bipartite?", lc: 785, d: "M", co: ["Me"], role: ["AI"], lists: "", tc: "O(V+E)", sc: "O(V)", pattern: "2-color BFS" },
  { id: 217, topic: 8, name: "Meeting Rooms III", lc: 2402, d: "H", co: ["Am","G"], role: ["BE"], lists: "", tc: "O(n log n)", sc: "O(m)", pattern: "Two heaps scheduling" },
  { id: 218, topic: 6, name: "Analyze User Website Visit Pattern", lc: 1152, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(n³)", sc: "O(n³)", pattern: "Combo + hash count" },
  { id: 219, topic: 4, name: "Simplify Path", lc: 71, d: "M", co: ["Me"], role: ["FE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Stack path tokens" },
  { id: 220, topic: 4, name: "Buildings With Ocean View", lc: 1762, d: "M", co: ["Me"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Reverse monotonic" },
  { id: 221, topic: 6, name: "Minimum Number of Pushes to Type Word II", lc: 3016, d: "M", co: ["G"], role: ["FE"], lists: "", tc: "O(n)", sc: "O(1)", pattern: "Frequency sort" },
  { id: 222, topic: 15, name: "Capacity To Ship Packages", lc: 1011, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(n log S)", sc: "O(1)", pattern: "BS on answer" },
  { id: 224, topic: 7, name: "Range Sum of BST", lc: 938, d: "E", co: ["Me"], role: ["AI"], lists: "", tc: "O(n)", sc: "O(h)", pattern: "BST pruning DFS" },
  { id: 225, topic: 7, name: "Check Completeness of Binary Tree", lc: 958, d: "M", co: ["Me","Ap"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "BFS null check" },
  { id: 226, topic: 7, name: "Closest BST Value", lc: 270, d: "E", co: ["Me"], role: ["BE"], lists: "", tc: "O(h)", sc: "O(1)", pattern: "BST traversal" },
  { id: 227, topic: 7, name: "Find Leaves of Binary Tree", lc: 366, d: "M", co: ["Me","Ap"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Height grouping DFS" },
  { id: 228, topic: 3, name: "Insert into Sorted Circular Linked List", lc: 708, d: "M", co: ["Me"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(1)", pattern: "Circular traversal" },
  { id: 229, topic: 3, name: "Palindrome Linked List", lc: 234, d: "E", co: ["G","Am"], role: ["BE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Reverse half + compare" },
  { id: 230, topic: 6, name: "First Unique Character in String", lc: 387, d: "E", co: ["Am"], role: ["FE"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Frequency count" },
  { id: 231, topic: 22, name: "Open the Lock", lc: 752, d: "M", co: ["Ap"], role: ["BE"], lists: "", tc: "O(10^4)", sc: "O(10^4)", pattern: "BFS state space" },
  { id: 232, topic: 22, name: "Bus Routes", lc: 815, d: "H", co: ["Ap"], role: ["BE"], lists: "", tc: "O(R²·S)", sc: "O(R²)", pattern: "BFS route graph" },
  { id: 233, topic: 3, name: "Convert BST to Sorted Doubly LL", lc: 426, d: "M", co: ["Me"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(h)", pattern: "In-order + DLL" },
  { id: 234, topic: 10, name: "Critical Connections in a Network", lc: 1192, d: "H", co: ["Am"], role: ["BE"], lists: "", tc: "O(V+E)", sc: "O(V+E)", pattern: "Tarjan's bridges" },
  { id: 235, topic: 20, name: "Best Time Buy Sell Stock II", lc: 122, d: "M", co: ["Am"], role: ["AI"], lists: "S", tc: "O(n)", sc: "O(1)", pattern: "Sum all gains" },
  { id: 236, topic: 14, name: "Reorder Data in Log Files", lc: 937, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(n·m log n)", sc: "O(n·m)", pattern: "Custom sort" },
  { id: 237, topic: 15, name: "Find First and Last Position", lc: 34, d: "M", co: ["Me","Am","Nf"], role: ["BE"], lists: "S", tc: "O(log n)", sc: "O(1)", pattern: "BS left + right" },
  { id: 238, topic: 5, name: "Continuous Subarrays", lc: 2762, d: "M", co: ["G"], role: ["BE"], lists: "", tc: "O(n)", sc: "O(1)", pattern: "Sorted deque window" },
  { id: 239, topic: 16, name: "Merge Strings Alternately", lc: 1768, d: "E", co: ["G","Am","Me"], role: ["FE"], lists: "", tc: "O(n+m)", sc: "O(n+m)", pattern: "Interleave pointers" },
  { id: 240, topic: 21, name: "Frog Jump", lc: 403, d: "H", co: ["G"], role: ["AI"], lists: "", tc: "O(n²)", sc: "O(n²)", pattern: "DP on jumps" },
  { id: 241, topic: 10, name: "Flood Fill", lc: 733, d: "E", co: ["Am"], role: ["FE"], lists: "S", tc: "O(m×n)", sc: "O(m×n)", pattern: "DFS coloring" },
  { id: 242, topic: 4, name: "Basic Calculator", lc: 224, d: "H", co: ["G","Am"], role: ["FE"], lists: "", tc: "O(n)", sc: "O(n)", pattern: "Recursive stack" },
  { id: 243, topic: 21, name: "Longest Increasing Path in a Matrix", lc: 329, d: "H", co: ["G","Me"], role: ["AI"], lists: "N", tc: "O(m×n)", sc: "O(m×n)", pattern: "DFS + memoization" },
  { id: 244, topic: 8, name: "Top K Frequent Words", lc: 692, d: "M", co: ["Am","G"], role: ["BE"], lists: "", tc: "O(n log k)", sc: "O(n)", pattern: "MinHeap + custom cmp" },
  { id: 245, topic: 27, name: "Plates Between Candles", lc: 2055, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(n+q)", sc: "O(n)", pattern: "Prefix sum + BS" },
  { id: 248, topic: 22, name: "Shortest Bridge", lc: 934, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(m×n)", sc: "O(m×n)", pattern: "DFS mark + BFS expand" },
  { id: 249, topic: 11, name: "Min Cost to Connect All Points (UF)", lc: 1584, d: "M", co: ["Am"], role: ["BE"], lists: "N", tc: "O(n² log n)", sc: "O(n²)", pattern: "Kruskal's + UF" },
  { id: 250, topic: 4, name: "Maximum Frequency Stack", lc: 895, d: "H", co: ["G","Am"], role: ["BE"], lists: "", tc: "O(1)", sc: "O(n)", pattern: "Freq map + stack groups" },
  { id: 252, topic: 21, name: "Word Break II", lc: 140, d: "H", co: ["Me","Am"], role: ["AI"], lists: "", tc: "O(2^n)", sc: "O(2^n)", pattern: "Backtrack + memo" },
  { id: 253, topic: 24, name: "Sqrt(x)", lc: 69, d: "E", co: ["G","Am"], role: ["AI"], lists: "S", tc: "O(log n)", sc: "O(1)", pattern: "Binary search" },
  { id: 254, topic: 24, name: "Integer to Roman", lc: 12, d: "M", co: ["G","Am"], role: ["FE"], lists: "S", tc: "O(1)", sc: "O(1)", pattern: "Greedy subtraction" },
  { id: 255, topic: 17, name: "Frequency of Most Frequent Element", lc: 1838, d: "M", co: ["G"], role: ["BE"], lists: "", tc: "O(n log n)", sc: "O(1)", pattern: "Sort + sliding window" },
  { id: 256, topic: 26, name: "Two Best Non-Overlapping Events", lc: 2054, d: "M", co: ["G","Am"], role: ["BE"], lists: "", tc: "O(n log n)", sc: "O(n)", pattern: "Sort + suffix max" },
  { id: 257, topic: 9, name: "Longest Word in Dictionary", lc: 720, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(Σlen)", sc: "O(Σlen)", pattern: "Trie + DFS" },
  { id: 258, topic: 13, name: "Design In-Memory File System", lc: 588, d: "H", co: ["G"], role: ["BE"], lists: "", tc: "O(L)", sc: "O(n·L)", pattern: "Trie of dirs" },
  { id: 259, topic: 22, name: "Find Eventual Safe States", lc: 802, d: "M", co: ["Am"], role: ["BE"], lists: "", tc: "O(V+E)", sc: "O(V+E)", pattern: "Reverse topo / cycle" },
  { id: 260, topic: 10, name: "Redundant Connection II", lc: 685, d: "H", co: ["Am"], role: ["BE"], lists: "", tc: "O(n·α(n))", sc: "O(n)", pattern: "Union-Find + parent" },

  // ===== MISSING NEETCODE 150 PROBLEMS (added to complete all 150) =====
  { id: 261, topic: 1, name: "Valid Sudoku", lc: 36, d: "M", co: ["Am","G"], role: ["BE","FE"], lists: "N", tc: "O(81)", sc: "O(81)", pattern: "Hash set per row/col/box" },
  { id: 262, topic: 10, name: "Max Area of Island", lc: 695, d: "M", co: ["Am","G"], role: ["BE","FE"], lists: "N", tc: "O(m×n)", sc: "O(m×n)", pattern: "DFS area tracking" },
  { id: 263, topic: 8, name: "Kth Largest Element in a Stream", lc: 703, d: "E", co: ["Am"], role: ["BE"], lists: "N", tc: "O(log k)", sc: "O(k)", pattern: "Min-heap size k" },
  { id: 264, topic: 8, name: "Last Stone Weight", lc: 1046, d: "E", co: ["Am"], role: ["BE"], lists: "N", tc: "O(n log n)", sc: "O(n)", pattern: "Max-heap smash" },
  { id: 265, topic: 8, name: "Design Twitter", lc: 355, d: "M", co: ["Am"], role: ["BE"], lists: "N", tc: "O(k log k)", sc: "O(n)", pattern: "Heap + HashMap feed merge" },
  { id: 266, topic: 21, name: "Min Cost Climbing Stairs", lc: 746, d: "E", co: ["Am"], role: ["AI"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Two-variable DP" },
  { id: 267, topic: 26, name: "Minimum Interval to Include Each Query", lc: 1851, d: "H", co: ["G"], role: ["BE"], lists: "N", tc: "O(n log n + q log q)", sc: "O(n+q)", pattern: "Sort + min-heap sweep" },
  { id: 268, topic: 24, name: "Detect Squares", lc: 2013, d: "M", co: ["G"], role: ["AI"], lists: "N", tc: "O(n)", sc: "O(n)", pattern: "Count map + diagonal check" },
  { id: 269, topic: 20, name: "Merge Triplets to Form Target Triplet", lc: 1899, d: "M", co: ["Am"], role: ["BE"], lists: "N", tc: "O(n)", sc: "O(1)", pattern: "Greedy filter valid triplets" },
  { id: 270, topic: 23, name: "Reverse Integer", lc: 7, d: "M", co: ["Am","G"], role: ["FE","BE"], lists: "N", tc: "O(log n)", sc: "O(1)", pattern: "Digit extraction + overflow check" },
  { id: 271, topic: 21, name: "Combination Sum IV", lc: 377, d: "M", co: ["Am","G"], role: ["AI"], lists: "B", tc: "O(n×t)", sc: "O(t)", pattern: "Unbounded DP permutation count" },
];

export const COMPANY_NAMES = { G: "Google", Am: "Amazon", Me: "Meta", Ap: "Apple", Nf: "Netflix" };
export const DIFF_NAMES = { E: "Easy", M: "Medium", H: "Hard" };
export const ROLE_NAMES = { AI: "AI Engineer", BE: "Backend Full Stack", FE: "Frontend Full Stack" };
export const LIST_NAMES = { N: "NeetCode 150", B: "Blind 75", S: "Striver" };
