import {
	ChatInputCommandInteraction,
	TextChannel,
	SlashCommandBuilder,
	ThreadAutoArchiveDuration,
	Events,
	PermissionFlagsBits,
	Message,
	MessageCollector,
} from "discord.js";
import { Builder, By } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";

class CollectorAuthors extends MessageCollector {
	authors: Map<string, number>;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ask")
		.setDescription("Starts a AskOuija Question")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName("question")
				.setDescription("What to ask?")
				.setRequired(false)
				.setMinLength(1)
		)
		.addStringOption((option) =>
			option
				.setName("random")
				.setDescription("A top /r/AskOuija question from the given time range")
				.setRequired(false)
				.addChoices(
					{ name: "Today", value: "day" },
					{ name: "Week", value: "week" },
					{ name: "Month", value: "month" },
					{ name: "Year", value: "year" },
					{ name: "All", value: "all" }
				)
		)
		.addIntegerOption((option) =>
			option
				.setName("characters")
				.setDescription("The amount of characters users are allowed")
				.setRequired(false)
				.setMinValue(1)
		)
		.addBooleanOption((option) =>
			option
				.setName("editable")
				.setDescription("Allow users to edit their message")
				.setRequired(false)
		)
		.addIntegerOption((option) =>
			option
				.setName("archive")
				.setDescription(
					"Duration until auto archive. Defaults to Channel Default"
				)
				.setRequired(false)
				.addChoices(
					{ name: "Hour", value: ThreadAutoArchiveDuration.OneHour },
					{ name: "Day", value: ThreadAutoArchiveDuration.OneDay },
					{ name: "3 Days", value: ThreadAutoArchiveDuration.ThreeDays },
					{ name: "Week", value: ThreadAutoArchiveDuration.OneWeek }
				)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		if (interaction.channel?.isThread()) return;
		await interaction.deferReply();
		const channel = interaction.channel as TextChannel;
		let question: string = interaction.options.getString("question");
		const random: string = interaction.options.getString("random");
		const editable: boolean =
			interaction.options.getBoolean("editable") ?? false;
		const amountChars: number =
			interaction.options.getInteger("characters") ?? 1;
		const archiveDuration: number =
			interaction.options.getInteger("archive") ??
			channel.defaultAutoArchiveDuration;

		if (random?.length) {
			let titles: string[] = [];
			let driver = null;
			let threads = (await channel?.threads.fetch()).threads.map(
				(value, key) => value.name
			);
			threads.concat(
				(await channel?.threads.fetchArchived()).threads.map(
					(value, key) => value.name
				)
			);
			try {
				// await interaction.editReply("Finding /r/AskOuija questions...");
				let options = new Options();
				options.addArguments("--no-sandbox");
				options.addArguments("--window-size=1920,1080");
				options.addArguments("--headless");
				options.addArguments("--disable-gpu");
				driver = await new Builder()
					.forBrowser("chrome")
					.setChromeOptions(options)
					.build();
				await driver.get(`https://www.reddit.com/r/AskOuija/top/?t=${random}`);
				titles = (
					await Promise.all(
						(
							await driver.findElements(By.css("h3"))
						).map((element) => element.getText())
					)
				).filter(
					(title) =>
						title.length > 0 && title.length <= 100 && !threads.includes(title)
				);
			} catch {
				if (driver == null) interaction.editReply("Webdriver failed");
				else interaction.editReply("Failed to get /r/AskOuija questions");
			} finally {
				if (driver != null) await driver.quit();
			}
			if (!titles.length) {
				interaction.editReply("Could not find an /r/AskOuija question");
				return;
			}
			question = titles[Math.floor(Math.random() * titles.length)];
		}

		const thread = await channel?.threads.create({
			name: question,
			reason: "A new AskOuija question",
			autoArchiveDuration: archiveDuration,
		});

		if (thread.joinable) await thread.join();
		let collector = thread.createMessageCollector({
			dispose: true,
		}) as CollectorAuthors;
		collector.authors = new Map();

		thread.client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
			if (
				!editable &&
				!newMessage.member?.permissions.has(PermissionFlagsBits.Administrator)
			) {
				collector.collected.set(newMessage.id, oldMessage as Message<boolean>);
			}
		});

		thread.client.on(Events.MessageDelete, (message) => {
			if (message.author) {
				collector.authors.delete(message.author.id);
			}
		});

		collector.on("collect", (message) => {
			if (
				(collector.authors.get(message.author.id) ?? 0) > amountChars &&
				!message.member?.permissions.has(PermissionFlagsBits.Administrator)
			) {
				collector.collected.delete(message.id);
				message.delete();
			} else if (message.content.toUpperCase() === "GOODBYE") {
				collector.collected.delete(message.id);
				collector.stop();
			} else if (message.content.length != 1) {
				collector.collected.delete(message.id);
				message.delete();
			} else {
				const chars: number = collector.authors.get(message.author.id) ?? 0;
				collector.authors.set(message.author.id, chars + 1);
			}
		});
		collector.on("end", async (collected) => {
			const answer = collected
				.map((value) => value.content)
				.join("")
				.toUpperCase();
			let response = `\`\`\`yaml\nQuestion: ${question} \nAnswer: ${answer} \n\`\`\``;
			if (question.includes("_")) {
				response = `\`\`\`yaml\n${question.replace(/\_+/i, answer)}\n\`\`\``;
			}
			await thread.send(response);
			await thread.setLocked(true);
			await interaction.editReply(response);
		});
	},
};
