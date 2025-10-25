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
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxguWuAppx52YD_sAOZww9Ad-yzcrW0r4tmb1imPtFLjPsREXJ0-GeyW8BVfMHhBXr5/exec"; // 🔹 URL Web App của bạn

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
    let text = await response.text();

    // 🧹 Làm sạch text khỏi phần tiêu đề & input trùng lặp
    text = text
      .replace(/^📦.*Calculate.*\n?/gim, "")  // xoá dòng chứa tiêu đề Etsy Shipping Calculate
      .replace(/^Input:.*\n?/gim, "")         // xoá dòng Input
      .replace(/────────────────────/g, "")   // bỏ dấu gạch
      .replace(/\*\*/g, "")                  // bỏ ** markdown
      .trim();

    // 🧩 Giữ lại phần kết quả chính
    const cleaned = text
      .split("\n")
      .filter((line) => line && !/^Eneocare/i.test(line)) // bỏ footer trùng
      .join("\n")
      .trim();

    const embed = new EmbedBuilder()
      .setColor(0xf97316)
      .setTitle("📦 Etsy Shipping Calculate")
      .setDescription("Kết quả tính phí USPS Ground Advantage (Offline Rate)")
      .addFields(
        { name: "Input", value: `⚖️ ${weight} ${unit}`, inline: false },
        { name: "Result", value: cleaned || "Không có dữ liệu phù hợp." }
      )
      .setFooter({ text: "Eneocare Shipping Tool • 2025" })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error("❌ Error fetching data:", error);
    await interaction.editReply("❌ Có lỗi khi tính phí Etsy Shipping. Vui lòng thử lại!");
  }
});

// === REGISTER SLASH COMMAND ===
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


