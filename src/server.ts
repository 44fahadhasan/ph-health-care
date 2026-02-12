import app from "./app";
import { envVars } from "./config/env";

(() => {
  try {
    app.listen(envVars.PORT, () => {
      console.log(
        `⚡️[server]: Server is running at http://localhost:${envVars.PORT}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();
