import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types/command.type.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("command")
    .setDescription("임베드 메시지를 표시합니다"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // 임베드 메시지 생성
    const embed = new EmbedBuilder()
      .setColor(0x4FC8D1)
      .setTitle("임베드 제목")
      .setDescription(`임베드 설명이 들어갈 부분
        ~~마크다운 테스트~~`)
      .setThumbnail("https://i.imgur.com/AfFp7pu.png")
      .setImage("https://i.imgur.com/wSTFkRM.png")
      .addFields(
        { name: "필드 1", value: "값 1", inline: true },
        { name: "필드 2", value: "값 2", inline: true },
        { name: "필드 3", value: "값 3", inline: false }
      )
      .setTimestamp()
      .setFooter({
        text: "푸터 텍스트",
        iconURL: "https://i.imgur.com/AfFp7pu.png",
      });

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
