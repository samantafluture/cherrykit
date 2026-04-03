import { getDb } from "./connection.js";

// Standalone migration entry point — initializes DB and runs migrations
const db = getDb();
console.log("Database initialized and migrations applied.");
