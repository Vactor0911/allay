import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  AttachmentBuilder,
} from "discord.js";
import type { Command } from "../types/command.type.js";
import { fetchServerStatus } from "../utils/serverStatus.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("현재 서버 상태를 표시합니다"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // 먼저 응답 지연 처리 (Discord 인터랙션 3초 제한 회피)
    await interaction.deferReply();

    try {
      // 서버 상태 가져오기
      const { online, motd, version, players, playersMax } =
        await fetchServerStatus();

      // 서버 오프라인 시
      if (!online) {
        await interaction.editReply("서버가 현재 오프라인 상태입니다.");
        return;
      }

      // 서버 아이콘 첨부 파일 생성
      const serverIconPath = path.join(
        __dirname,
        "..",
        "assets",
        "server-icon.png"
      );
      const serverIcon = new AttachmentBuilder(serverIconPath, {
        name: "server-icon.png",
      });

      // 임베드 메시지 생성
      const embed = new EmbedBuilder()
        .setColor(0x4fc8d1)
        .setTitle(motd)
        .setDescription(
          `목원대학교 컴공과 마인크래프트 서버
        ㅤ`
        )
        .setThumbnail("attachment://server-icon.png")
        .addFields(
          { name: "버전", value: version, inline: true },
          {
            name: "플레이어 수",
            value: `${players.length} / ${playersMax}`,
            inline: true,
          },
          {
            name: "",
            value: "",
            inline: false,
          },
          {
            name: "접속자 목록",
            value: `${players
              .map(
                (player: { name: string; uuid: string }) => `- ${player.name}`
              )
              .join("\n")}`,
            inline: false,
          }
        )
        .setTimestamp()
        .setFooter({
          text: "Powered by discord.js",
          iconURL: "https://i.imgur.com/wSTFkRM.png",
        });

      await interaction.editReply({ embeds: [embed], files: [serverIcon] });
    } catch (error) {
      console.error("Error fetching server status:", error);
      await interaction.editReply("현재 서버 상태를 가져올 수 없습니다.");
    }
  },
};

export default command;
