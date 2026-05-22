export const API_URL = "http://localhost:2024";

export function computeAverages(results) {
  const grouped = {};
  results.forEach((row) => {
    const rating = Number(row.rating);
    if (!row.location || Number.isNaN(rating)) return;
    if (!grouped[row.location]) grouped[row.location] = [];
    grouped[row.location].push(rating);
  });

  const calculated = {};
  Object.keys(grouped).forEach((loc) => {
    const ratings = grouped[loc];
    calculated[loc] = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  });
  return calculated;
}

export async function fetchAverages() {
  const res = await fetch(`${API_URL}/get-users`);
  if (!res.ok) throw new Error("Failed to load submissions");
  const data = await res.json();
  return computeAverages(data.results);
}
