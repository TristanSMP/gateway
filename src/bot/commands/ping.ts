import { MessageFlags } from "discord-api-types/v10";
import type { ChatInputInteraction, Command } from "disploy";

const Ping: Command = {
  name: "ping",
  description: "health check",

  async run(interaction: ChatInputInteraction) {
    interaction.reply({ content: "Pong!", flags: MessageFlags.Ephemeral });
  },
};

export default Ping;
