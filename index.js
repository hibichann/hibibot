const { Telegraf } = require("telegraf")
const { HttpProxyAgent } = require("http-proxy-agent")

const agent = new HttpProxyAgent({
	host: "localhost",
	port: 7890,
})

const bot = new Telegraf("6256699658:AAEAzlfqjqLKjMEoR33B4ysQr7OH7t3evBo", {
	telegram: { agent },
})
bot.start((ctx) => ctx.reply("Hello"))
bot.help((ctx) => ctx.reply("Help message"))
bot.command("photo", (ctx) =>
	ctx.replyWithPhoto({ url: "https://picsum.photos/200/300/?random" })
)
bot.on("inline_query", async ({ inlineQuery, answerInlineQuery }) => {
	const apiUrl = `http://recipepuppy.com/api/?q=${inlineQuery.query}`
	const response = await fetch(apiUrl)
	const { results } = await response.json()
	const recipes = results
		.filter(({ thumbnail }) => thumbnail)
		.map(({ title, href, thumbnail }) => ({
			type: "article",
			id: thumbnail,
			title: title,
			description: title,
			thumb_url: thumbnail,
			input_message_content: {
				message_text: title,
			},
			reply_markup: Markup.inlineKeyboard([
				Markup.urlButton("Go to recipe", href),
			]),
		}))
	return answerInlineQuery(recipes)
})

bot.on("chosen_inline_result", ({ chosenInlineResult }) => {
	console.log("chosen inline result", chosenInlineResult)
})
bot.launch()
