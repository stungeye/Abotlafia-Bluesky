import sqlite3 from "sqlite3";
import { log } from "./logger";

const mysticalSymbols = [
  // Alchemy Symbols (U+1F700–U+1F77F)
  "🜁",
  "🜂",
  "🜃",
  "🜄",
  "🜅",
  "🜆",
  "🜇",
  "🜈",
  "🜉",
  "🜊",
  "🜋",
  "🜌",
  "🜍",
  "🜎",
  "🜏",
  "🜐",
  "🜑",
  "🜒",
  "🜓",
  "🜔",
  "🜕",
  "🜖",
  "🜗",
  "🜘",
  "🜙",
  "🜚",
  "🜛",
  "🜜",
  "🜝",
  "🜞",
  "🜟",
  "🜠",
  "🜡",
  "🜢",
  "🜣",
  "🜤",
  "🜥",
  "🜦",
  "🜧",
  "🜨",
  "🜩",
  "🜪",
  "🜫",
  "🜬",
  "🜭",
  "🜮",
  "🜯",
  "🜰",
  "🜱",
  "🜲",
  "🜳",
  "🜴",
  "🜵",
  "🜶",
  "🜷",
  "🜸",
  "🜹",
  "🜺",
  "🜻",
  "🜼",
  "🜽",
  "🜾",
  "🜿",

  // Astrological Symbols
  "☉",
  "☾",
  "☽",
  "☿",
  "♀",
  "♂",
  "♃",
  "♄",
  "♅",
  "♆",
  "♇",
  "☋",
  "☊",
  "⊛",
  "⚷",
  "⚸",
  "⚹",
  "⚵",
  "⚶",
  "⚳",
  "⚴",

  // Zodiac Symbols (U+2648–U+2653)
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",

  // Geomantic and Esoteric Shapes
  "⚰",
  "⚱",
  "⛤",
  "⛧",
  "⛨",

  // I Ching Hexagrams (U+4DC0–U+4DFF)
  "䷀",
  "䷁",
  "䷂",
  "䷃",
  "䷄",
  "䷅",
  "䷆",
  "䷇",
  "䷈",
  "䷉",
  "䷊",
  "䷋",
  "䷌",
  "䷍",
  "䷎",
  "䷏",
  "䷐",
  "䷑",
  "䷒",
  "䷓",
  "䷔",
  "䷕",
  "䷖",
  "䷗",
  "䷘",
  "䷙",
  "䷚",
  "䷛",
  "䷜",
  "䷝",
  "䷞",
  "䷟",
  "䷠",
  "䷡",
  "䷢",
  "䷣",
  "䷤",
  "䷥",
  "䷦",
  "䷧",
  "䷨",
  "䷩",
  "䷪",
  "䷫",
  "䷬",
  "䷭",
  "䷮",
  "䷯",
  "䷰",
  "䷱",
  "䷲",
  "䷳",
  "䷴",
  "䷵",
  "䷶",
  "䷷",
  "䷸",
  "䷹",
  "䷺",
  "䷻",
  "䷼",
  "䷽",
  "䷾",
  "䷿",

  // Runic Symbols (U+16A0–U+16FF)
  "ᚠ",
  "ᚢ",
  "ᚦ",
  "ᚨ",
  "ᚱ",
  "ᚲ",
  "ᚷ",
  "ᚹ",
  "ᚺ",
  "ᚻ",
  "ᚾ",
  "ᛁ",
  "ᛃ",
  "ᛇ",
  "ᛈ",
  "ᛋ",
  "ᛏ",
  "ᛒ",
  "ᛖ",
  "ᛗ",
  "ᛚ",
  "ᛜ",
  "ᛞ",

  // Religious and Mystical Symbols
  "☥",
  "⚚",
  "⚜",
  "⚛",
  "☯",
  "☮",
  "✞",

  // Mystical Stars
  "✸",
  "✹",
  "✺",
  "✵",

  // Miscellaneous Esoteric
  "⚔",
  "⚖",
  "⚗",
  "⚙",
];

class Abulafia {
  private db: sqlite3.Database;

  constructor(filename: string) {
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

  static timeToPost(postProbability: number): boolean {
    return Math.random() < postProbability;
  }

  matchingSymbol(word: string, symbolProbability: number): string {
    if (symbolProbability < 1 && Math.random() < 1 - symbolProbability)
      return "";
    return (
      " " + mysticalSymbols[Math.floor(Math.random() * mysticalSymbols.length)]
    );
  }

  generatePost(requiredString = ""): Promise<{
    id: number;
    words: string;
    rating: number;
  } | null> {
    const like = requiredString ? `AND words LIKE '%${requiredString}%'` : "";
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, words, rating 
        FROM sentences 
        WHERE moderated = false AND tweeted = false AND length(words) <= 300 
        ${like}
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
