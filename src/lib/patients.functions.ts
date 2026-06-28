import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export const submitPatient = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => patientInsertSchema.parse(data))
  .handler(async ({ data }) => {
    // Public insert — use publishable key client (anon role + RLS policy)
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data: row, error } = await supabase
      .from("patients")
      .insert(data)
      .select("id")
      .single();
    if (error) {
      console.error("submitPatient error", error);
      throw new Error("No se pudo guardar tu información. Intenta de nuevo.");
    }
    return { id: row.id };
  });

export const listPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data;
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "approved", "rejected"]).optional(),
  doctor_notes: z.string().max(5000).optional(),
});

export const updatePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase
      .from("patients")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const myRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r) => r.role);
    return { roles, isDoctor: roles.includes("doctor") || roles.includes("admin") };
  });
