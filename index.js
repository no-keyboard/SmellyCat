const discord = require('discord.js');
const bot = new discord.Client();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const discordApi = process.env.DISCORD_API;
const channel = process.env.CHANNEL;
const errorLog = process.env.ERROR_CHANNEL;
const tagUser = process.env.TAG_USER;
const url = process.env.URL;

bot.login(discordApi);
bot.on('ready', () => {
	console.info("Logged into Discord!");
	bot.channels.cache.get(channel).send({
		embed: {
			color: '#93DFF5',
			title: 'Checking page!',
			fields: [
				{
					name: "URL",
					value: url
				}
			]
		}
	});
});

puppeteer.launch({
	args: ['--no-sandbox'],
	headless: true,
	// executablePath: 'chromium-browser'
})
.then(async browser => {
	const page = await browser.newPage();
	await page.goto(url);

	try {
		await page.waitForTimeout("span[data-bind='html:stocklabel']");
		result = await page.evaluate(() => {
			return document.querySelector("span[data-bind='html:stocklabel']").innerText;
		});

		if(result != "Returning to stock 3-4 weeks" && result != "") {
			console.info(result)
			bot.channels.cache.get(channel).send(`<@${tagUser}>, it's in stock!`);
		} else {
			console.info("Not in stock.")
			bot.channels.cache.get(channel).send(result);
		}
	} catch(err) {
		bot.channels.cache.get(errorLog).send(err);
	}

	await browser.close();
});
