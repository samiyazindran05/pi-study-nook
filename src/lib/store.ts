import { useEffect, useState } from "react";

export function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, loaded]);
  return [value, setValue] as const;
}

export type Doc = { id: string; title: string; body: string; folder: string; date: string };

export const FORMULAS: { keys: string[]; folder: string; rows: [string, string][] }[] = [
  { keys: ["thermo", "heat", "entropy"], folder: "Physics", rows: [
    ["First Law", "ΔU = Q − W"], ["Ideal Gas", "PV = nRT"], ["Entropy change", "ΔS = Q_rev / T"],
    ["Carnot efficiency", "η = 1 − T_c / T_h"], ["Gibbs free energy", "ΔG = ΔH − TΔS"] ] },
  { keys: ["kinematic", "motion", "velocity", "newton", "force", "mechanic"], folder: "Physics", rows: [
    ["Velocity", "v = u + at"], ["Displacement", "s = ut + ½at²"], ["Velocity²", "v² = u² + 2as"],
    ["Newton's 2nd Law", "F = ma"], ["Momentum", "p = mv"] ] },
  { keys: ["electr", "circuit", "current", "magnet"], folder: "Physics", rows: [
    ["Ohm's Law", "V = IR"], ["Power", "P = VI = I²R"], ["Coulomb's Law", "F = kq₁q₂ / r²"], ["Capacitance", "C = Q / V"] ] },
  { keys: ["mole", "stoich", "solution", "concentration"], folder: "Chemistry", rows: [
    ["Moles", "n = m / M"], ["Molarity", "M = n / V"], ["Dilution", "M₁V₁ = M₂V₂"], ["Avogadro", "N = n × 6.022×10²³"] ] },
  { keys: ["kinetic", "rate", "equilibri", "acid", "ph", "chem"], folder: "Chemistry", rows: [
    ["pH", "pH = −log[H⁺]"], ["Rate law", "r = k[A]ᵐ[B]ⁿ"], ["Arrhenius", "k = A·e^(−Ea/RT)"], ["Kc", "Kc = [C]ᶜ[D]ᵈ / [A]ᵃ[B]ᵇ"] ] },
  { keys: ["calculus", "deriv", "integra", "limit"], folder: "Maths", rows: [
    ["Power rule", "d/dx xⁿ = nxⁿ⁻¹"], ["Product rule", "(uv)' = u'v + uv'"], ["Chain rule", "(f∘g)' = f'(g)·g'"],
    ["Integration", "∫xⁿ dx = xⁿ⁺¹/(n+1) + C"] ] },
  { keys: ["trig", "angle", "sin", "cos"], folder: "Maths", rows: [
    ["Pythagorean", "sin²θ + cos²θ = 1"], ["Double angle", "sin2θ = 2sinθcosθ"], ["Cosine rule", "c² = a² + b² − 2ab·cosC"] ] },
  { keys: ["algebra", "quadratic", "math", "equation"], folder: "Maths", rows: [
    ["Quadratic formula", "x = (−b ± √(b²−4ac)) / 2a"], ["Discriminant", "Δ = b² − 4ac"], ["Binomial (a+b)²", "a² + 2ab + b²"] ] },
];

export function enrich(title: string, folders: string[], fallback: string) {
  const t = title.toLowerCase();
  const hit = FORMULAS.find((f) => f.keys.some((k) => t.includes(k)));
  if (!hit) return { table: "", folder: fallback };
  const table = `\n\n## 📐 Key Formulas — ${title}\n\n| Concept | Formula |\n|---|---|\n${hit.rows.map(([a, b]) => `| ${a} | \`${b}\` |`).join("\n")}\n`;
  return { table, folder: folders.includes(hit.folder) ? hit.folder : fallback };
}
