import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const SEED_DATA_PATH = path.join(__dirname, "seed_data");

// --- CSV Record Interfaces ---

interface AdminCsvRecord {
  id: string; // Add id if you want to explicitly provide it
  username: string;
  password?: string;
}

interface TeamCsvRecord {
  id: string;
  name: string;
  contact: string;
  logo: string;
  player: string; // CSV string "player1,player2,player3"
  payment_status: string; // Should match your Prisma Enum or String type
}

interface TournamentCsvRecord {
  id: string;
  title: string;
  poster: string;
  location: string;
  description: string;
  date: string; // Will be parsed to Date object
  price: string;
}

interface TournamentParticipantCsvRecord {
  id?: string; // Optional ID for explicit seeding
  tournamentId: string;
  teamId: string;
}

// --- Seeding Functions ---

async function seedAdmins() {
  console.log("Seeding admins...");
  await prisma.admin.deleteMany({}); // Assuming your model is 'Admin'
  console.log("Cleared existing admins.");

  // Production mode handling (if you need a default admin without CSV)
  if (process.env.NODE_ENV === "production") {
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_USERNAME and ADMIN_PASSWORD must be set in production"
      );
    }
    const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD);
    await prisma.admin.create({
      // Using prisma.admin for the Admin model
      data: {
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
      },
    });
    console.log("Production admin user seeded.");
    return;
  }

  // Development mode - use CSV
  const adminsCsvPath = path.join(SEED_DATA_PATH, "admin.csv"); // Use 'admins.csv'
  if (!fs.existsSync(adminsCsvPath)) {
    console.log("admin.csv not found. Skipping admin seeding.");
    return;
  }

  const fileContent = fs.readFileSync(adminsCsvPath, { encoding: "utf-8" });
  const records: AdminCsvRecord[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of records) {
    if (!record.username || !record.password) {
      console.warn(
        `Skipping admin record due to missing username or password: ${JSON.stringify(
          record
        )}`
      );
      continue;
    }
    const hashedPassword = await argon2.hash(record.password);

    await prisma.admin.upsert({
      // Using upsert for idempotency
      where: { id: record.id }, // Assuming 'id' is provided in CSV and unique
      update: { username: record.username, password: hashedPassword },
      create: {
        id: record.id,
        username: record.username,
        password: hashedPassword,
      },
    });
  }
  console.log(`${records.length} admins seeded from CSV.`);
}

async function seedTeams() {
  console.log("Seeding teams...");
  await prisma.team.deleteMany({});
  console.log("Cleared existing teams.");

  const teamsCsvPath = path.join(SEED_DATA_PATH, "team.csv");
  if (!fs.existsSync(teamsCsvPath)) {
    console.log("team.csv not found. Skipping team seeding.");
    return;
  }

  const fileContent = fs.readFileSync(teamsCsvPath, { encoding: "utf-8" });
  const records: TeamCsvRecord[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of records) {
    await prisma.team.upsert({
      where: { id: record.id },
      update: {
        name: record.name,
        contact: record.contact,
        logo: record.logo,
        player: record.player.split(",").map((p) => p.trim()), // Convert CSV string to array
        payment_status: record.payment_status,
      },
      create: {
        id: record.id,
        name: record.name,
        contact: record.contact,
        logo: record.logo,
        player: record.player.split(",").map((p) => p.trim()),
        payment_status: record.payment_status,
      },
    });
  }
  console.log(`${records.length} teams seeded from CSV.`);
}

async function seedTournaments() {
  console.log("Seeding tournaments...");
  await prisma.tournament.deleteMany({});
  console.log("Cleared existing tournaments.");

  const tournamentsCsvPath = path.join(SEED_DATA_PATH, "tournament.csv");
  if (!fs.existsSync(tournamentsCsvPath)) {
    console.log("tournament.csv not found. Skipping tournament seeding.");
    return;
  }

  const fileContent = fs.readFileSync(tournamentsCsvPath, {
    encoding: "utf-8",
  });
  const records: TournamentCsvRecord[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      // === MODIFIED: Using native Date parsing ===
      if (context.column === "date") {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          // Check for invalid date
          throw new Error(
            `Invalid date format for column 'date' in CSV row ${context.lines}: ${value}`
          );
        }
        return date;
      }
      // === END MODIFIED ===
      return value;
    },
  });

  for (const record of records) {
    // Convert base64 poster string to Buffer for Prisma Bytes field
    let posterBuffer: Buffer;
    try {
      // Handle both data URL format (data:image/jpeg;base64,xxx) and plain base64
      const base64Data = record.poster.includes(",")
        ? record.poster.split(",")[1]
        : record.poster;
      posterBuffer = Buffer.from(base64Data, "base64");
    } catch (error) {
      console.warn(
        `Invalid base64 format for poster in tournament ${record.id}, using empty buffer`
      );
      posterBuffer = Buffer.alloc(0); // Empty buffer as fallback
    }

    await prisma.tournament.upsert({
      where: { id: record.id },
      update: {
        title: record.title,
        poster: record.poster, // Now using Buffer instead of string
        location: record.location,
        description: record.description,
        date: record.date as unknown as Date, // Cast needed due to `cast` function returning `unknown` or `string` initially
        price: record.price,
      },
      create: {
        id: record.id,
        title: record.title,
        poster: record.poster, // Now using Buffer instead of string
        location: record.location,
        description: record.description,
        date: record.date as unknown as Date,
        price: record.price,
      },
    });
  }
  console.log(`${records.length} tournaments seeded from CSV.`);
}

async function seedTournamentParticipants() {
  console.log("Seeding tournament participants...");
  await prisma.tournamentParticipant.deleteMany({});
  console.log("Cleared existing tournament participants.");

  const participantsCsvPath = path.join(
    SEED_DATA_PATH,
    "tournament_participants.csv"
  );
  if (!fs.existsSync(participantsCsvPath)) {
    console.log(
      "tournament_participants.csv not found. Skipping participant seeding."
    );
    return;
  }

  const fileContent = fs.readFileSync(participantsCsvPath, {
    encoding: "utf-8",
  });
  const records: TournamentParticipantCsvRecord[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  for (const record of records) {
    // Since we removed the composite primary key, we can't use tournamentId_teamId
    // Instead, we'll create new records or use the id if provided
    if (record.id) {
      // If ID is provided in CSV, use upsert with id
      await prisma.tournamentParticipant.upsert({
        where: { id: record.id },
        update: {
          tournamentId: record.tournamentId,
          teamId: record.teamId,
        },
        create: {
          id: record.id,
          tournamentId: record.tournamentId,
          teamId: record.teamId,
          // registeredAt will default to now() if not provided in CSV
        },
      });
    } else {
      // If no ID provided, just create new records
      await prisma.tournamentParticipant.create({
        data: {
          tournamentId: record.tournamentId,
          teamId: record.teamId,
          // registeredAt will default to now()
        },
      });
    }
  }
  console.log(`${records.length} tournament participants seeded from CSV.`);
}

// --- Main Seeding Orchestrator ---

async function main() {
  console.log("Start seeding ...");

  // Seed independent models first
  await seedAdmins();
  await seedTeams();
  await seedTournaments();

  // Seed relation/junction tables after their related models are present
  await seedTournamentParticipants();

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
