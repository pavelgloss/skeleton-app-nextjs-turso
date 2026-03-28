#!/usr/bin/env node

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function write(message) {
  process.stdout.write(`${message}\n`);
}

function writeError(message) {
  process.stderr.write(`${message}\n`);
}

async function check(name, url, expectedStatus = 200) {
  try {
    const response = await fetch(url);

    if (response.status === expectedStatus) {
      write(`[ok] ${name} (${response.status})`);
      return true;
    }

    writeError(
      `[fail] ${name} - expected ${expectedStatus}, got ${response.status}`,
    );
    return false;
  } catch (error) {
    writeError(
      `[fail] ${name} - ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
    return false;
  }
}

async function main() {
  write(`\nSmoke testing ${BASE_URL}\n`);

  const results = await Promise.all([
    check("Homepage", `${BASE_URL}/`),
    check("Health", `${BASE_URL}/api/health`),
    check("Sign-in page", `${BASE_URL}/sign-in`),
  ]);

  const allPassed = results.every(Boolean);
  write(allPassed ? "\n[ok] All checks passed" : "\n[fail] Some checks failed");
  process.exit(allPassed ? 0 : 1);
}

main();
