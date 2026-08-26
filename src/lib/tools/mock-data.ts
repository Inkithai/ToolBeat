/**
 * Deterministic mock-data generation: seedable pseudo-random rows from small
 * built-in word lists. Same seed + fields + count always yields the same rows.
 */

export type MockField =
  | "name"
  | "email"
  | "phone"
  | "company"
  | "city"
  | "street"
  | "date"
  | "amount"
  | "uuid";

export const MOCK_FIELDS: { key: MockField; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "street", label: "Street" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount" },
  { key: "uuid", label: "UUID" },
];

const FIRST_NAMES = [
  "Arosha", "Ben", "Chamari", "Devi", "Eranga", "Faruhaan", "Gamini", "Hiruni",
  "Isuranga", "Janith", "Kavindu", "Lakmini", "Madhushani", "Nadeesha",
  "Oshani", "Pasindu", "Ravindu", "Sachini", "Tharindu", "Uthpala",
  "Vishal", "Wayne", "Yasoda", "Zack", "Amara", "Brian", "Carla", "David",
  "Elena", "Farhan", "Grace", "Hassan", "Isla", "Jonas", "Kira", "Liam",
  "Mira", "Noel", "Olga", "Peter", "Quinn", "Rosa", "Sam", "Tara",
  "Uma", "Victor", "Wendy", "Ximena",
];

const LAST_NAMES = [
  "Silva", "Fernando", "Perera", "Weerasinghe", "Jayawardena", "Dias",
  "Gunasekara", "Herath", "Kumarasinghe", "Liyanage", "Mendis",
  "Nagaraj", "Obeysekera", "Pillay", "Ranatunga", "Samarasinha",
  "Tennakoon", "Udawatte", "Vasudevan", "Wickramasinghe", "Anderson",
  "Brown", "Clark", "Davis", "Evans", "Foster", "Garcia", "Hunt",
  "Iyer", "Johnson", "Khan", "Lewis", "Martin", "Nguyen", "O'Brien",
  "Patel", "Reed", "Smith", "Turner", "Walker", "Xu", "Young", "Zhang",
  "Ali", "Bauer", "Costa", "Dubois", "Eriksen", "Fischer",
];

const CITIES = [
  "Kandy", "Colombo", "Galle", "Nuwara Eliya", "Jaffna", "Anuradhapura",
  "Beruwala", "Trincomalee", "Kurunegala", "Badulla", "Matara", "Polonnaruwa",
  "London", "Berlin", "Tokyo", "Singapore", "Sydney", "Toronto",
  "Austin", "Lisbon", "Mumbai", "Nairobi", "Oslo", "Seoul",
];

const STREET_NAMES = [
  "Oak Street", "Maple Avenue", "Highland Road", "River Lane", "Station Road",
  "Lake View Drive", "Church Street", "Palm Boulevard", "Garden Close",
  "Market Street", "Hill Road", "Beach Road", "Temple Street", "Park Lane",
  "Victoria Avenue", "Sunrise Terrace",
];

const COMPANY_ADJECTIVES = [
  "Bright", "Cobalt", "Golden", "Northwind", "Silver", "Quantum",
  "Velvet", "Crimson", "Orbital", "Tidal",
];

const COMPANY_NOUNS = [
  "Analytics", "Software", "Logistics", "Media", "Labs", "Systems",
  "Studios", "Dynamics", "Solutions", "Works",
];

/** mulberry32 — tiny seedable PRNG (same algorithm as lorem-ipsum's). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Row = Record<string, string>;

function makeRow(random: () => number, fields: MockField[], rowIndex: number): Row {
  const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)];
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const row: Row = {};
  for (const field of fields) {
    switch (field) {
      case "name":
        row.name = name;
        break;
      case "email": {
        const local = `${firstName}.${lastName}${rowIndex}`
          .toLowerCase()
          .replace(/[^a-z0-9.]/g, "");
        row.email = `${local}@example.com`;
        break;
      }
      case "phone":
        row.phone = `+1-555-01${String(Math.floor(random() * 100)).padStart(2, "0")}`;
        break;
      case "company":
        row.company = `${pick(COMPANY_ADJECTIVES)} ${pick(COMPANY_NOUNS)}`;
        break;
      case "city":
        row.city = pick(CITIES);
        break;
      case "street":
        row.street = `${1 + Math.floor(random() * 999)} ${pick(STREET_NAMES)}`;
        break;
      case "date": {
        const year = 2016 + Math.floor(random() * 10);
        const month = 1 + Math.floor(random() * 12);
        const day = 1 + Math.floor(random() * 28);
        row.date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        break;
      }
      case "amount":
        row.amount = (Math.round(random() * 1000000) / 100).toFixed(2);
        break;
      case "uuid": {
        const hex = "0123456789abcdef";
        let value = "";
        for (let i = 0; i < 32; i++) value += hex[Math.floor(random() * 16)];
        row.uuid = `${value.slice(0, 8)}-${value.slice(8, 12)}-4${value.slice(13, 16)}-a${value.slice(17, 20)}-${value.slice(20)}`;
        break;
      }
    }
  }
  return row;
}

export type MockDataResult = {
  rows: Row[];
  columns: MockField[];
};

export function generateMockData(
  count: number,
  fields: MockField[],
  seed = 1,
): MockDataResult {
  if (!Number.isFinite(count) || count < 1) throw new Error("Row count must be at least 1.");
  if (count > 5000) throw new Error("Keep the row count at 5,000 or less.");
  if (fields.length === 0) throw new Error("Pick at least one field.");
  const random = mulberry32(seed);
  const rows: Row[] = [];
  for (let i = 0; i < count; i++) rows.push(makeRow(random, fields, i + 1));
  return { rows, columns: [...fields] };
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function mockRowsToCsv(result: MockDataResult): string {
  const header = result.columns.join(",");
  const lines = result.rows.map((row) =>
    result.columns.map((column) => csvEscape(row[column] ?? "")).join(","),
  );
  return [header, ...lines].join("\n");
}

export function mockRowsToJson(result: MockDataResult, pretty = true): string {
  return JSON.stringify(result.rows, null, pretty ? 2 : 0);
}
