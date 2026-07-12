import "dotenv/config";
import { createApp } from "./app.js";
import { createRepository } from "./config/database.js";
import { seedDemoData } from "./services/seedService.js";

const repository = await createRepository();
await seedDemoData(repository);
const app = createApp(repository);
const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.info(`NeuroFlow API listening at http://localhost:${port} (${repository.mode} mode)`));
