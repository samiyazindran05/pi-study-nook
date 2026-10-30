export type LectureResult = { id: string; title: string; channel: string; length: string };
const catalog: LectureResult[] = [
  { id: "WUvTyaaNkzM", title: "The Essence of Calculus", channel: "3Blue1Brown", length: "17:04" },
  { id: "ZM8ECpBuQYE", title: "Motion in a Straight Line", channel: "CrashCourse Physics", length: "10:00" },
  { id: "SOGnz9wOByc", title: "Exam Revision Walkthrough", channel: "Study Lecture", length: "12:30" },
];
export function searchLectures(query: string): LectureResult[] {
  const q = query.trim();
  return catalog.map((v, i) => ({ ...v, title: i === 2 && q ? `${q} — Full Lecture` : v.title }));
}
export const materials: { name: string; body: string }[] = [
  { name: "[Syllabus] Thermodynamics.pdf", body: "THERMODYNAMICS — COURSE SYLLABUS\n\nUnit 1: Systems, surroundings and state functions. Intensive vs extensive properties.\n\nUnit 2: The Zeroth and First Laws. Internal energy, work and heat. ΔU = Q − W.\n\nUnit 3: Ideal gases. PV = nRT, isothermal and adiabatic processes, PV^γ = constant.\n\nUnit 4: The Second Law. Entropy, ΔS = Q_rev / T, heat engines and the Carnot cycle (η = 1 − T_c/T_h).\n\nUnit 5: Free energy and spontaneity. ΔG = ΔH − TΔS.\n\nAssessment: 2 problem sets (20%), mid-term (30%), final exam (50%)." },
  { name: "[Notes] Heat Transfer Guide.pdf", body: "HEAT TRANSFER — STUDY GUIDE\n\n1. Conduction\nHeat flows through a solid from hot to cold. Fourier's law: q = −kA (dT/dx). Metals have high k; insulators low k.\n\n2. Convection\nHeat carried by a moving fluid. Newton's law of cooling: q = hA (T_s − T_∞). Forced convection (fans) beats natural convection.\n\n3. Radiation\nNo medium needed. Stefan–Boltzmann: q = εσA T⁴, where σ = 5.67 × 10⁻⁸ W/m²K⁴.\n\nExam tip: always identify which mode dominates before choosing a formula, and keep temperatures in kelvin for radiation." },
  { name: "[Formula Sheet] Calculus.pdf", body: "CALCULUS — FORMULA SHEET\n\nDerivatives\n• d/dx xⁿ = nxⁿ⁻¹\n• d/dx sin x = cos x,  d/dx cos x = −sin x\n• d/dx eˣ = eˣ,  d/dx ln x = 1/x\n• Product rule: (uv)' = u'v + uv'\n• Chain rule: (f∘g)' = f'(g)·g'\n\nIntegrals\n• ∫xⁿ dx = xⁿ⁺¹/(n+1) + C\n• ∫1/x dx = ln|x| + C\n• ∫eˣ dx = eˣ + C\n• By parts: ∫u dv = uv − ∫v du\n\nLimits\n• lim (sin x)/x = 1 as x → 0" },
];
