// Helper to generate a Tambola ticket
// A standard Tambola ticket: 3 rows × 9 columns, 5 numbers per row (15 total)
// Col 1: 1-9, Col 2: 10-19, ..., Col 9: 80-90

export function generateTambolaTicket(): (number | null)[][] {
  const ticket: (number | null)[][] = [[], [], []];
  
  const columns = [
    { min: 1, max: 9 },
    { min: 10, max: 19 },
    { min: 20, max: 29 },
    { min: 30, max: 39 },
    { min: 40, max: 49 },
    { min: 50, max: 59 },
    { min: 60, max: 69 },
    { min: 70, max: 79 },
    { min: 80, max: 90 },
  ];

  // For each column, pick which rows will have numbers (5 per row total)
  // Track how many numbers each row has
  const rowCounts = [0, 0, 0];
  const colAssignments: number[][] = Array(9).fill(null).map(() => []);

  for (let col = 0; col < 9; col++) {
    // Each column must have 1 or 2 numbers (total 15 across 9 cols = some cols have 2)
    const numInCol = col < 6 ? 2 : 1; // 6 cols with 2, 3 with 1 = 15 total... adjust
    // Actually: pick randomly but ensure each row gets exactly 5
    // Simple approach: assign 1-2 per column ensuring row balance
    const available = [0, 1, 2].filter(r => rowCounts[r] < 5);
    const toAssign = Math.min(numInCol, available.length);
    const shuffled = available.sort(() => Math.random() - 0.5).slice(0, toAssign);
    shuffled.forEach(r => {
      colAssignments[col].push(r);
      rowCounts[r]++;
    });
  }

  // Balance: ensure each row has exactly 5
  // Fill remaining
  let iterations = 0;
  while (rowCounts.some(c => c < 5) && iterations < 100) {
    iterations++;
    const needsMore = [0, 1, 2].filter(r => rowCounts[r] < 5);
    const hasTooFew = colAssignments.findIndex((col, i) => col.length < 2 && !needsMore.every(r => col.includes(r)));
    if (hasTooFew === -1) break;
    const row = needsMore[Math.floor(Math.random() * needsMore.length)];
    if (!colAssignments[hasTooFew].includes(row)) {
      colAssignments[hasTooFew].push(row);
      rowCounts[row]++;
    }
  }

  // Build the ticket grid
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      if (colAssignments[col].includes(row)) {
        const { min, max } = columns[col];
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        ticket[row].push(num);
      } else {
        ticket[row].push(null);
      }
    }
  }

  return ticket;
}

export function generateSimpleTicket(): (number | null)[][] {
  // Simpler, reliable Tambola ticket generation
  const columns = [
    [1,2,3,4,5,6,7,8,9],
    [10,11,12,13,14,15,16,17,18,19],
    [20,21,22,23,24,25,26,27,28,29],
    [30,31,32,33,34,35,36,37,38,39],
    [40,41,42,43,44,45,46,47,48,49],
    [50,51,52,53,54,55,56,57,58,59],
    [60,61,62,63,64,65,66,67,68,69],
    [70,71,72,73,74,75,76,77,78,79],
    [80,81,82,83,84,85,86,87,88,89,90],
  ];

  // Each row will have exactly 5 numbers, each in a unique column
  // 9 columns, 3 rows, 5 per row = need to pick which rows each column contributes to

  // Assign column presence to rows: each col can be in 1-2 rows
  // Total: 5*3 = 15 cells, 9 cols → some cols appear in 2 rows (6 cols×2 + 3 cols×1 = 15)
  const colRowMap: number[][] = Array(9).fill(null).map(() => []);
  const rowCounts = [0, 0, 0];

  // Shuffle columns and assign
  const colOrder = [0,1,2,3,4,5,6,7,8].sort(() => Math.random() - 0.5);
  
  // First pass: assign 2 to 6 columns
  for (let i = 0; i < 6; i++) {
    const col = colOrder[i];
    const availRows = [0,1,2].filter(r => rowCounts[r] < 5).sort(() => Math.random() - 0.5);
    colRowMap[col] = [availRows[0], availRows[1]];
    rowCounts[availRows[0]]++;
    rowCounts[availRows[1]]++;
  }
  
  // Second pass: assign 1 to remaining 3 columns
  for (let i = 6; i < 9; i++) {
    const col = colOrder[i];
    const availRows = [0,1,2].filter(r => rowCounts[r] < 5).sort(() => Math.random() - 0.5);
    colRowMap[col] = [availRows[0]];
    rowCounts[availRows[0]]++;
  }

  // Build grid
  const grid: (number | null)[][] = [[],[],[]];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      if (colRowMap[col].includes(row)) {
        const pool = columns[col];
        const num = pool[Math.floor(Math.random() * pool.length)];
        grid[row].push(num);
      } else {
        grid[row].push(null);
      }
    }
  }

  return grid;
}

export function ticketToFlat(ticket: (number | null)[][]): number[] {
  return ticket.flat().filter((n): n is number => n !== null);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
