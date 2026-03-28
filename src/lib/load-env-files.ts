const envFiles = [".env.local", ".env"];

export function loadEnvFiles() {
  for (const file of envFiles) {
    try {
      process.loadEnvFile(file);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("ENOENT")) {
        throw error;
      }
    }
  }
}
