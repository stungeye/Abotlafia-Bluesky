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
    const timeForNotifications = Abulafia.timeToPost(0.25);
    const timeForPost = Abulafia.timeToPost(0.025);

    if (!timeForNotifications && !timeForPost) {
      log("Not time to post or process notifications yet.");
      return;
    }

    let abulafia = new Abulafia("database.sqlite");
    const bsky = await BSky.create(username, password, abulafia);

    if (timeForNotifications) {
      await bsky.processNotifications();
    }

    if (!timeForPost) {
      log("Not time to post yet.");
      return;
    }

    const post = await abulafia.generatePost();

    if (!post || !post.words) {
      log("No post generated: " + JSON.stringify(post));
      return;
    }

    const symbol = abulafia.matchingSymbol(post.words, 0.1);
    const postSuccess = await bsky.postWords(post.words + symbol);
    if (postSuccess) {
      log(`Row with ID ${post.id} marked as tweeted.`);
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
