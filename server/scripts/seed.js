import "dotenv/config";
import { createRepository } from "../src/config/database.js";
import { seedDemoData } from "../src/services/seedService.js";
const repository = await createRepository();
await seedDemoData(repository);
console.info(`Demo data is ready (${repository.mode} mode).`);
