import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import type { Command } from "../types/command.type.js";
import { serverIcon } from "../utils/index.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("서버 정보를 표시합니다"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    // 서버 주소
    const SERVER_ADDRESS = process.env.SERVER_ADDRESS || "N/A";
    const GUILD_ID = process.env.GUILD_ID || "";
    const GUIDE_CHANNEL_ID = process.env.GUIDE_CHANNEL_ID || "";

    // 임베드 메시지 생성
    const embed = new EmbedBuilder()
      .setColor(0x4fc8d1)
      .setTitle("MWU Minecraft Server")
      .setDescription(
        `목원대학교 컴공과 마인크래프트 서버
        ㅤ`
      )
      .setThumbnail(serverIcon)
      .addFields(
        { name: "접속 주소", value: SERVER_ADDRESS, inline: true },
        { name: "권장 메모리", value: "6GB 이상", inline: true },
        { name: "", value: "", inline: false },
        { name: "버전", value: "1.20.1", inline: true },
        { name: "모드팩 버전", value: "1.0.4", inline: true },
        { name: "모드 구동기", value: "Forge 47.4.13", inline: true },
        { name: "", value: "", inline: false },
        {
          name: "서버 규칙",
          value: `1. 상식적으로 행동하세요.
2. 재미있게 플레이하세요.`,
          inline: false,
        }
      )
      .setFooter({
        text: "Powered by discord.js",
        iconURL: "https://i.imgur.com/wSTFkRM.png",
      });

    // 서버 접속 가이드 버튼 생성
    const serverGuideButton = new ButtonBuilder()
      .setLabel("서버 접속 가이드")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${GUILD_ID}/${GUIDE_CHANNEL_ID}`)
      .setEmoji("❔");

    await interaction.editReply({
      embeds: [embed],
      components: [{ type: 1, components: [serverGuideButton] }],
    });
  },
};

export default command;
