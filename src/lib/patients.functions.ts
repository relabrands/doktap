import { z } from "zod";
import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, limit, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const patientInsertSchema = z.object({
  full_name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(50),
  province: z.string().max(80).optional().nullable(),
  cedula: z.string().max(40).optional().nullable(),
  sex: z.enum(["male", "female"]),
  date_of_birth: z.string().optional().nullable(),
  height_cm: z.number().positive().max(280),
  current_weight_kg: z.number().positive().max(400),
  goal_weight_kg: z.number().positive().max(400),
  pace_choice: z.enum(["works", "faster", "too_fast"]).optional().nullable(),
  conditions: z.array(z.string()).default([]),
  medications: z.string().max(2000).optional().nullable(),
  allergies: z.string().max(2000).optional().nullable(),
  blood_pressure_range: z.enum(["normal", "elevated", "high1", "high2", "crisis", "unknown"]).optional().nullable(),
  pregnant_or_nursing: z.boolean().default(false),
  prior_glp1: z.boolean().default(false),
});

export const submitPatient = async (data: unknown) => {
  const parsed = patientInsertSchema.parse(data);
  const docRef = await addDoc(collection(db, "patients"), {
    ...parsed,
    created_at: new Date().toISOString(),
    status: "new",
  });
  return { id: docRef.id };
};

export const listPatients = async () => {
  if (!auth.currentUser) throw new Error("No autenticado");
  const q = query(collection(db, "patients"), orderBy("created_at", "desc"), limit(500));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["new", "contacted", "approved", "rejected"]).optional(),
  doctor_notes: z.string().max(5000).optional(),
});

export const updatePatient = async (data: unknown) => {
  if (!auth.currentUser) throw new Error("No autenticado");
  const { id, ...patch } = updateSchema.parse(data);
  const ref = doc(db, "patients", id);
  await updateDoc(ref, patch);
  return { ok: true };
};

export const myRole = async () => {
  if (!auth.currentUser) return { roles: [], isDoctor: false };
  const snap = await getDoc(doc(db, "user_roles", auth.currentUser.uid));
  if (!snap.exists()) return { roles: [], isDoctor: false };
  const roles = snap.data().roles || [];
  return { roles, isDoctor: roles.includes("doctor") || roles.includes("admin") };
};

export const getPatient = async (id: string) => {
  if (!auth.currentUser) throw new Error("No autenticado");
  const snap = await getDoc(doc(db, "patients", id));
  if (!snap.exists()) throw new Error("Paciente no encontrado");
  return { id: snap.id, ...snap.data() };
};
