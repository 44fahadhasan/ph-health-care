import app from "./app";
import { seedSuperAdmin } from "./app/seed/supper-admin.seed";
import { envVars } from "./config/env";

(async () => {
  try {
    await seedSuperAdmin();

    app.listen(envVars.PORT, () => {
      console.log(
        `⚡️[server]: Server is running at http://localhost:${envVars.PORT}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();
