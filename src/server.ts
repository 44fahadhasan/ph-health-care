import app from "./app";

const port = process.env.PORT || 5000;

(() => {
  try {
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Faild to start server:", error);
  }
})();
