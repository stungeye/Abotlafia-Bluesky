import * as dotenv from "dotenv";
import { log } from "./logger";
import Abulafia from "./abulafia";
import BSky from "./bsky";

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    // Validate environment variables
    const username = process.env.BLUESKY_USERNAME;
    const password = process.env.BLUESKY_PASSWORD;

    if (!username || !password) {
      throw new Error("Missing required environment variables");
    }

    const bsky = await BSky.create(username, password);

    if (!Abulafia.timeToPost(0.05)) {
      log("Not time to post yet.");
      return;
    }

    let abulafia = new Abulafia("database.sqlite");
    const post = await abulafia.generatePost();

    if (!post || !post.words) {
      log("No post to generate: " + JSON.stringify(post));
      return;
    }

    const symbol = abulafia.matchingSymbol(post.words, 0.1);
    const postSuccess = await bsky.postWords(post.words + symbol);
    if (postSuccess) {
      log(`Post with ID ${post.id} marked as tweeted.`);
      await abulafia.markPosted(post.id);
    }
  } catch (error) {
    // Exit with error code for cron to detect failure
    process.exit(1);
  }
}

// Proper error handling for uncaught errors
process.on("uncaughtException", (error) => {
  log(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  log(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

main();
