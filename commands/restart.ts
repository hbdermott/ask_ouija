import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits} from 'discord.js';
import {exec} from 'child_process';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot and updates')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(true),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        exec("sudo systemctl restart ask_ouija.service", async (error, stdout, stderr) => {
            if (error || stderr) {
                await interaction.editReply("Failed to restart bot")
                return;
            }
            await interaction.editReply("Restarting bot...")
        });
    }
}
