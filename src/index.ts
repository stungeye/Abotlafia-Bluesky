import { BskyAgent } from "@atproto/api";
import * as dotenv from "dotenv";
import { log } from "./logger";
import Abulafia from "./abulafia";

// Load environment variables from .env file
dotenv.config();

const agent = new BskyAgent({
  service: "https://bsky.social",
});
async function main() {
  try {
    let abulafia = new Abulafia("database.sqlite", 1.0);

    if (!abulafia.timeToPost()) {
      log("Not time to post yet.");
      return;
    }

    const post = await abulafia.generatePost();

    if (!post || !post.words) {
      log("No post to generate: " + JSON.stringify(post));
      return;
    }

    // Validate environment variables
    const username = process.env.BLUESKY_USERNAME;
    const password = process.env.BLUESKY_PASSWORD;

    if (!username || !password) {
      throw new Error("Missing required environment variables");
    }

    await agent.login({
      identifier: username,
      password: password,
    });

    log("Successfully logged in to Bluesky!");

    log("Posting: " + post.words);
    const response = await agent.post({
      text: post.words,
    });

    await abulafia.markPosted(post.id);
    log(`Post with ID ${post.id} marked as tweeted.`);

    // Your bot logic will go here
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : String(error)}`);
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
