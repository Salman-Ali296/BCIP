import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "trials.json");

const TRIAL_DAYS = 14;

const PLANS = [
  { id: "starter", monthly: 49 },
  { id: "professional", monthly: 99 },
  { id: "enterprise", monthly: 199 },
];

type TrialRecord = {
  id: string;
  name: string;
  business: string;
  email: string;
  plan: string;
  startedAt: string;
  endsAt: string;
};

async function readAll(): Promise<TrialRecord[]> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(content) as TrialRecord[];
  } catch {
    return [];
  }
}

async function writeAll(records: TrialRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(records, null, 2),
    "utf8"
  );
}

export async function createTrial(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;

    const name = String(body.name ?? "").trim();
    const business = String(body.business ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const plan = String(body.plan ?? "").trim();

    if (!name || !business) {
      res.status(400).json({
        error: "Name and business name are required.",
      });
      return;
    }

    if (name.length > 100 || business.length > 150) {
      res.status(400).json({
        error: "Name or business name is too long.",
      });
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 200
    ) {
      res.status(400).json({
        error: "Please enter a valid email address.",
      });
      return;
    }

    const selectedPlan = PLANS.find(
      (p) => p.id === plan && p.monthly !== null
    );

    if (!selectedPlan) {
      res.status(400).json({
        error: "Please choose a valid plan.",
      });
      return;
    }

    const records = await readAll();

    if (records.some((record) => record.email === email)) {
      res.status(409).json({
        error: "A trial already exists for this email address.",
      });
      return;
    }

    const now = new Date();

    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + TRIAL_DAYS);

    const record: TrialRecord = {
      id: crypto.randomUUID(),
      name,
      business,
      email,
      plan,
      startedAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
    };

    await writeAll([...records, record]);

    res.status(201).json({
      id: record.id,
      plan: record.plan,
      endsAt: record.endsAt,
    });
  } catch (error) {
    console.error("Create trial error:", error);

    res.status(500).json({
      error: "Unable to create trial.",
    });
  }
}