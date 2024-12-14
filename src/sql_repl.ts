import sqlite3 from "sqlite3";
import readline from "readline";

// Open a database connection to 'database.sqlite'
const db = new sqlite3.Database("database.sqlite", (err) => {
  if (err) {
    console.error("Could not open database", err);
  } else {
    console.log("Connected to database.sqlite");
  }
});

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "sqlite> ",
});

// Function to execute SQL statements
const executeSQL = (sql: string) => {
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error executing SQL:", err.message);
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }
    rl.prompt();
  });
};

// Start the readline interface
rl.prompt();

rl.on("line", (line) => {
  const trimmedLine = line.trim();
  if (trimmedLine.toLowerCase() === "exit") {
    rl.close();
  } else {
    executeSQL(trimmedLine);
  }
}).on("close", () => {
  console.log("Exiting...");
  db.close((err) => {
    if (err) {
      console.error("Error closing database", err.message);
    } else {
      console.log("Database connection closed");
    }
    process.exit(0);
  });
});
