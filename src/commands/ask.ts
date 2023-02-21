import { ChatInputCommandInteraction, TextChannel, SlashCommandBuilder, ThreadAutoArchiveDuration, Events, PermissionFlagsBits, Message, MessageCollector, SlashCommandStringOption} from "discord.js";

class CollectorAuthors extends MessageCollector{
    authors: Map<string, number>;
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Starts a AskOuija Question')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addStringOption(option => option
        .setName('question')
        .setDescription('What to ask?')
        .setRequired(true))
    .addBooleanOption(option => option
        .setName('editable')
        .setDescription('Allow users to edit their message')
        .setRequired(false))
    .addIntegerOption(option => option
        .setName('amount')
        .setDescription('The amount of characters users are allowed')
        .setRequired(false)
        .setMinValue(1))
    .addIntegerOption(option => option
        .setName('archive')
        .setDescription('Duration until auto archive. Defaults to Channel Default')
        .setRequired(false)
        .addChoices(
            {name: "Hour", value: ThreadAutoArchiveDuration.OneHour},
            {name: "Day", value: ThreadAutoArchiveDuration.OneDay},
            {name: "3 Days", value: ThreadAutoArchiveDuration.ThreeDays},
            {name: "Week", value: ThreadAutoArchiveDuration.OneWeek},
        )),
    async execute(interaction: ChatInputCommandInteraction) {
        if(interaction.channel?.isThread())
            return
        const channel = interaction.channel as TextChannel
        const question: string = interaction.options.getString('question');
        const editable: boolean = interaction.options.getBoolean('editable') ?? false;
        const amountChars: number = interaction.options.getInteger('amount') ?? 1;
        const archiveDuration: number = interaction.options.getInteger('archive') ?? channel.defaultAutoArchiveDuration;

        const thread = await channel?.threads.create({
            name: question!,
            reason: 'A new AskOuija question',
            autoArchiveDuration: archiveDuration
        });


        if (thread.joinable) await thread.join();
        let collector = (thread.createMessageCollector({dispose: true}) as CollectorAuthors)
        collector.authors = new Map();
        
        thread.client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
            if(!editable && !newMessage.member?.permissions.has(PermissionFlagsBits.Administrator)){
                collector.collected.set(newMessage.id, oldMessage as Message<boolean>);
            }
        })
        
        thread.client.on(Events.MessageDelete, (message) => {
            if(message.author){
                collector.authors.delete(message.author.id)
            }
        })
        
        collector.on('collect', message => {
            if((collector.authors.get(message.author.id) ?? 0) > amountChars && !message.member?.permissions.has(PermissionFlagsBits.Administrator)){
                collector.collected.delete(message.id);
                message.delete();
            } else if(message.content.toUpperCase() === 'GOODBYE'){
                collector.collected.delete(message.id);
                collector.stop();
            } else if (message.content.length != 1){
                collector.collected.delete(message.id);
                message.delete();
            } else {
                const chars: number = collector.authors.get(message.author.id) ?? 0;
                collector.authors.set(message.author.id, chars + 1);
            }
        })
        collector.on('end', async collected => {
            const answer = collected.map(value => value.content).join('').toUpperCase();
            let response = `\`\`\`yaml\nQuestion: ${question} \nAnswer: ${answer} \n\`\`\``;
            if(question.includes('_')){
                response = `\`\`\`yaml\n${question.replace(/\_+/i, answer)}\n\`\`\``;
            }
            await thread.send(response);
            await thread.setLocked(true);
            await interaction.editReply(response)
        })
    }
}
