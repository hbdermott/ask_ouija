const { SlashCommandBuilder, PermissionFlagsBits} = require('discord.js'); 

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Starts a AskOuija Question')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option => option
        .setName('question')
        .setDescription('A question')
        .setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        await interaction.deferReply();

        const thread = await interaction.channel.threads.create({
            name: question,
            reason: 'A new AskOuija question'
        });
        if (thread.joinable) await thread.join();

        let collector = thread.createMessageCollector({dispose: true});
        collector.authors = {};
        collector.on('collect', message => {
            if(message.author.id in collector.authors){
                collector.collected.delete(message.id);
                message.delete();
            } else if(message.content.toUpperCase() === 'GOODBYE'){
                collector.collected.delete(message.id);
                collector.stop();
            } else if (message.content.length != 1){
                collector.collected.delete(message.id);
                message.delete();
            } else {
                collector.authors[message.author.id] = true;
            }
        })
        collector.on('end', async collected => {
            const answer = collected.map(value => value.content).join('').toUpperCase();
            let response = `\`\`\`yaml\nQuestion: ${question} \nAnswer: ${answer} \n\`\`\``;
            if(question.includes('_')){
                response = `\`\`\`yaml\n${question.replace('_', answer)}\n\`\`\``;
            }
            await thread.send(response);
            await thread.setLocked(true);
            await thread.setArchived(true);
            await interaction.editReply(response)
        })
    }
}
