import { AtpAgent, BskyAgent } from "@atproto/api";
import { AppBskyFeedPost } from "@atproto/api";
import { AppBskyNotificationListNotifications } from "@atproto/api";
import { log } from "./logger";
import Abulafia from "./abulafia";
import { symlink } from "fs";

function getRootCdiAndUri(
  notif: AppBskyNotificationListNotifications.Notification
) {
  return {
    rootCid:
      (
        notif?.record as {
          reply?: { root?: { cid?: string; uri?: string } };
        }
      )?.reply?.root?.cid || notif.cid,
    rootUri:
      (
        notif?.record as {
          reply?: { root?: { cid?: string; uri?: string } };
        }
      )?.reply?.root?.uri || notif.uri,
  };
}

class BSky {
  private agent: AtpAgent;
  private abu: Abulafia;

  private constructor(agent: AtpAgent, abu: Abulafia) {
    this.agent = agent;
    this.abu = abu;
  }

  static async create(
    username: string,
    password: string,
    abu: Abulafia
  ): Promise<BSky> {
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

    return new BSky(agent, abu);
  }

  async postWords(post: string): Promise<boolean> {
    try {
      const response = await this.agent.post({
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

  async postReply(
    post: string,
    rootUri: string,
    rootCid: string,
    parentUri: string,
    parentCid: string
  ): Promise<boolean> {
    try {
      const response = await this.agent.post({
        text: post,
        reply: {
          root: {
            uri: rootUri,
            cid: rootCid,
          },
          parent: {
            uri: parentUri,
            cid: parentCid,
          },
        },
      });

      log("Reply successful!");
      return true;
    } catch (error) {
      log(
        `Error replying to Bluesky: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return false;
    }
  }

  async processNotifications(): Promise<void> {
    try {
      const notificationCount = await this.agent.countUnreadNotifications();
      const count = notificationCount.data.count;
      log(`You have ${count} unread notifications.`);
      if (count > 0) {
        const response = await this.agent.listNotifications({});
        //console.dir(response.data);
        const notifications = response.data.notifications;
        // Filter for mention. Notification.reason is "mention"
        const mentions = notifications.filter(
          (notification) =>
            (notification.reason === "reply" ||
              notification.reason === "mention") &&
            !notification.isRead
        );
        log(`You have ${mentions.length} mentions.`);

        for (const mention of mentions) {
          const parentUri = mention.uri; // URI of the original post
          const parentCid = mention.cid; // CID of the original post
          const { rootCid, rootUri } = getRootCdiAndUri(mention);

          // Pay mention.record into it's own variable and ensure it's of type Record
          const record = mention.record as AppBskyFeedPost.Record;
          // Construct the reply tex
          const reply = await this.abu.generatePost("you");

          log(`Replying to mention: ${record.text}`);

          if (!reply || !reply.words) {
            log("No post to generate: " + JSON.stringify(reply));
            return;
          }
          console.log(`Reply txt: ${reply.words}`);

          const symbol = this.abu.matchingSymbol(reply.words, 0.1);
          const postSuccess = await this.postReply(
            reply.words + symbol,
            rootUri,
            rootCid,
            parentUri,
            parentCid
          );
          if (postSuccess) {
            log(`Post with ID ${reply.id} marked as tweeted.`);
            await this.abu.markPosted(reply.id);
          }

          log(`Successfully replied to mention: ${parentUri}`);
        }
      }
      this.agent.updateSeenNotifications();
      log("Updated seen notifications.");
    } catch (error) {
      log(
        `Error processing notifications: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

export default BSky;
