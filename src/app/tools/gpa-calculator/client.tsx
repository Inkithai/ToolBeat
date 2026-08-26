"use client";
import { useState, useMemo } from "react";
import IoWorkspace from "@/components/tools/io-workspace";
const GRADES = [{ grade: "A+", points: 4.0 }, { grade: "A", points: 4.0 }, { grade: "A-", points: 3.7 }, { grade: "B+", points: 3.3 }, { grade: "B", points: 3.0 }, { grade: "B-", points: 2.7 }, { grade: "C+", points: 2.3 }, { grade: "C", points: 2.0 }, { grade: "C-", points: 1.7 }, { grade: "D+", points: 1.3 }, { grade: "D", points: 1.0 }, { grade: "F", points: 0 }];
type Course = { name: string; credits: number; grade: number };
export default function Client() {
  const [courses, setCourses] = useState<Course[]>([
    { name: "Mathematics", credits: 4, grade: 0 }, { name: "Physics", credits: 3, grade: 1 }, { name: "English", credits: 3, grade: 2 }, { name: "History", credits: 3, grade: 4 },
  ]);
  const result = useMemo(() => {
    const totalCredits = courses.reduce((a, c) => a + c.credits, 0);
    const totalPoints = courses.reduce((a, c) => a + c.credits * GRADES[c.grade].points, 0);
    return { gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00", totalCredits, totalPoints };
  }, [courses]);
  const update = (i: number, field: keyof Course, value: string | number) => setCourses(prev => prev.map((c, j) => j === i ? { ...c, [field]: value } : c));
  const addCourse = () => setCourses(prev => [...prev, { name: "", credits: 3, grade: 0 }]);
  const removeCourse = (i: number) => setCourses(prev => prev.filter((_, j) => j !== i));
  return (
    <IoWorkspace inputLabel="Courses" outputLabel="GPA" status="complete"
      input={<div className="space-y-2">
        {courses.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_3rem_5rem_auto] items-center gap-1">
            <input type="text" value={c.name} onChange={e => update(i, "name", e.target.value)} placeholder="Course name" className="field py-1 text-xs" />
            <input type="number" value={c.credits} onChange={e => update(i, "credits", +e.target.value)} min={1} max={10} className="field py-1 text-center text-xs" />
            <select value={c.grade} onChange={e => update(i, "grade", +e.target.value)} className="field py-1 text-xs">{GRADES.map((g, gi) => <option key={g.grade} value={gi}>{g.grade} ({g.points})</option>)}</select>
            <button type="button" onClick={() => removeCourse(i)} className="text-ink-600 hover:text-rose-300 text-xs">×</button>
          </div>
        ))}
        <button type="button" onClick={addCourse} className="text-xs text-indigo-300 hover:text-white">+ Add course</button>
      </div>}
      output={<div className="space-y-3">
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4 text-center"><p className="text-xs text-ink-500">Cumulative GPA</p><p className="text-5xl font-bold text-white">{result.gpa}</p><p className="text-xs text-ink-400">{result.totalCredits} credits</p></div>
      </div>}
    />
  );
}
