import { ActivityType, Events } from "discord.js";
import { event } from "../lib.ts";

export default event({
  name: Events.ClientReady,
  once: true,
  run(client) {
    console.log(`Logged in as ${client.user.tag} — ${client.guilds.cache.size} guild(s)`);
    client.user.setActivity("/help", { type: ActivityType.Listening });
  },
});
