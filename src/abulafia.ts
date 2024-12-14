import sqlite3 from "sqlite3";
import { log } from "./logger";

class Abulafia {
  private db: sqlite3.Database;
  private postProbability: number;

  constructor(filename: string, postProbability = 0.02) {
    this.postProbability = postProbability;
    this.db = new sqlite3.Database(filename, (err) => {
      if (err) {
        if (err instanceof Error) {
          log(`ERROR: Could not open database. Details: ${err.message}`);
        } else {
          log("ERROR: Could not open database. An unknown error occurred.");
        }
      } else {
        log(`Connected to ${filename}`);
      }
    });
  }

  timeToPost(): boolean {
    return Math.random() < this.postProbability;
  }

  generatePost(): Promise<{
    id: number;
    words: string;
    rating: number;
  } | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, words, rating 
        FROM sentences 
        WHERE moderated = false AND tweeted = false AND length(words) <= 300 
        ORDER BY RANDOM() 
        LIMIT 1
      `;
      this.db.get(
        query,
        (err, row: { id: number; words: string; rating: number }) => {
          if (err) {
            reject(err);
          } else {
            if (
              row &&
              typeof row.id === "number" &&
              typeof row.words === "string" &&
              typeof row.rating === "number"
            ) {
              resolve(row);
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  markPosted(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `UPDATE sentences SET tweeted = true WHERE id = ?`;
      this.db.run(query, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default Abulafia;
