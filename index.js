import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

// === Keep Render alive ===
const app = express();
app.get("/", (req, res) => res.send("✅ EtsyShip Bot is alive!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

// === CONFIG ===
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxguWuAppx52YD_sAOZww9Ad-yzcrW0r4tmb1imPtFLjPsREXJ0-GeyW8BVfMHhBXr5/exec"; // 🔹 Thay bằng URL Web App vừa deploy

// === INIT CLIENT ===
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// === COMMAND /etsyship ===
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || interaction.commandName !== "etsyship") return;

  const unit = interaction.options.getString("unit");
  const weight = interaction.options.getNumber("weight");

  await interaction.deferReply();

  try {
    const url = `${SCRIPT_URL}?unit=${unit}&weight=${weight}`;
    const response = await fetch(url);
    const text = await response.text();

    const color = 0xf97316; // Etsy orange 🧡

    const embed = new EmbedBuilder()
      .setColor(color)
      //.setTitle("📦 Etsy Shipping Calculate")
      //.setDescription("Kết quả tính phí USPS Ground Advantage (Offline Rate)")
      .addFields(
        //{ name: "Input", value: `⚖️ ${weight} ${unit}`, inline: true },
        { name: "Result", value: `\`\`\`\n${text}\n\`\`\`` }
      )
      .setFooter({ text: "Etsy 2025 • Eneocare" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    await interaction.editReply("❌ Có lỗi khi tính phí Etsy Shipping. Vui lòng thử lại!");
  }
});

// === Register slash command ===
client.on("ready", async () => {
  const commands = [
    {
      name: "etsyship",
      description: "Tính phí USPS Ground Advantage cho Etsy",
      options: [
        {
          name: "unit",
          type: 3,
          description: "Chọn đơn vị đo",
          required: true,
          choices: [
            { name: "oz (ounce)", value: "oz" },
            { name: "lbs (pound)", value: "lbs" },
            { name: "gram (gram)", value: "gram" },
          ],
        },
        {
          name: "weight",
          type: 10,
          description: "Cân nặng của gói hàng",
          required: true,
        },
      ],
    },
  ];

  await client.application.commands.set(commands);
  console.log("✅ Slash command /etsyship registered!");
});

client.login(DISCORD_TOKEN);



