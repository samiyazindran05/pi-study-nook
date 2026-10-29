import { describe, expect, it } from "vitest";
import { sortedNote, youtubeId } from "@/lib/lecture";
describe("Lecture notes and playback", () => {
  it("sorts lecture notes into the same Physics folder and appends formulas", () => {
    const note = sortedNote("Thermodynamics lecture", "Heat and entropy", ["Physics", "Chemistry", "Maths"], "Maths");
    expect(note.folder).toBe("Physics");
    expect(note.body).toContain("ΔU = Q − W");
  });
  it("sorts based on lecture content when the title is generic", () => {
    expect(sortedNote("Lecture 1", "Integration and calculus", ["Physics", "Maths"], "Physics").folder).toBe("Maths");
  });
  it("accepts real YouTube watch and short links", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=SOGnz9wOByc")).toBe("SOGnz9wOByc");
    expect(youtubeId("https://youtu.be/SOGnz9wOByc?t=12")).toBe("SOGnz9wOByc");
  });
  it("rejects other hosts and malformed video ids", () => {
    expect(youtubeId("https://youtube.com.evil.test/watch?v=SOGnz9wOByc")).toBeNull();
    expect(youtubeId("https://youtube.com/watch?v=bad")).toBeNull();
  });
});