import { AtpAgent } from "@atproto/api";
import { log } from "./logger";

class BSky {
  private agent: AtpAgent;

  private constructor(agent: AtpAgent) {
    this.agent = agent;
  }

  static async create(username: string, password: string): Promise<BSky> {
    const agent = new AtpAgent({
      service: "https://bsky.social",
    });

    try {
      await agent.login({
        identifier: username,
        password: password,
      });
      log("Successfully logged in to Bluesky!");
    } catch (error) {
      log(
        `Error logging in to Bluesky: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }

    return new BSky(agent);
  }

  async postWords(post: string): Promise<boolean> {
    try {
      await this.agent.post({
        text: post,
      });

      log("Post successful!");
      return true;
    } catch (error) {
      log(
        `Error posting to Bluesky: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return false;
    }
  }
}

export default BSky;
