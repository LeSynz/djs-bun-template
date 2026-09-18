import { Events } from "discord.js";
import { event } from "../lib.ts";

export default event({
  name: Events.GuildCreate,
  run(guild) {
    console.log(`Joined "${guild.name}" (${guild.id})`);
  },
});
