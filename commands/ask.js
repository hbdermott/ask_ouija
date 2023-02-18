const { SlashCommandBuilder, PermissionFlagsBits, Events, ThreadAutoArchiveDuration} = require('discord.js'); 

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Starts a AskOuija Question')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption(option => option
        .setName('question')
        .setDescription('What to ask?')
        .setRequired(true)),
    async execute(interaction) {
        if(interaction.channel.isThread())
            return
        const question = interaction.options.getString('question');
        await interaction.deferReply();

        const thread = await interaction.channel.threads.create({
            name: question,
            reason: 'A new AskOuija question',
            autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek
        });

        if (thread.joinable) await thread.join();

        thread.client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
            if(!newMessage.member.permissions.has(PermissionFlagsBits.Administrator))
                collector.collected.set(newMessage.id, oldMessage);
        })

        thread.client.on(Events.MessageDelete, (message) => {
            collector.authors.delete(message.author.id)
        })

        let collector = thread.createMessageCollector({dispose: true});
        collector.authors = new Map();
        collector.on('collect', message => {
            if(message.author.id in collector.authors && !message.member.permissions.has(PermissionFlagsBits.Administrator)){
                collector.collected.delete(message.id);
                message.delete();
            } else if(message.content.toUpperCase() === 'GOODBYE'){
                collector.collected.delete(message.id);
                collector.stop();
            } else if (message.content.length != 1){
                collector.collected.delete(message.id);
                message.delete();
            } else {
                collector.authors.set(message.author.id, true);
            }
        })
        collector.on('end', async collected => {
            const answer = collected.map(value => value.content).join('').toUpperCase();
            let response = `\`\`\`yaml\nQuestion: ${question} \nAnswer: ${answer} \n\`\`\``;
            if(question.includes('_')){
                response = `\`\`\`yaml\n${question.replace(/_*/i, answer)}\n\`\`\``;
                await thread.setName(response)
            }
            await thread.send(response);
            await thread.setLocked(true);
            await interaction.editReply(response)
        })
    }
}
