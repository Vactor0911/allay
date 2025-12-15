import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types/command.type.js";
import { fetchServerStatus } from "../utils/serverStatus.js";
import { serverIcon } from "../utils/index.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("현재 서버 상태를 표시합니다"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // 먼저 응답 지연 처리 (Discord 인터랙션 3초 제한 회피)
    await interaction.deferReply();

    try {
      // 서버 상태 가져오기
      const serverData = await fetchServerStatus();

      // 서버 오프라인 시
      if (!serverData.online) {
        await interaction.editReply("서버가 현재 오프라인 상태입니다.");
        return;
      }

      // 임베드 메시지 생성
      const embed = new EmbedBuilder()
        .setColor(0x4fc8d1)
        .setTitle(serverData.motd)
        .setDescription(
          `목원대학교 컴공과 마인크래프트 서버
        ㅤ`
        )
        .setThumbnail(serverIcon)
        .addFields(
          { name: "버전", value: serverData.version, inline: true },
          {
            name: "플레이어 수",
            value: `${serverData.players.length} / ${serverData.playersMax}`,
            inline: true,
          },
          {
            name: "",
            value: "",
            inline: false,
          },
          {
            name: "접속자 목록",
            value: `${serverData.players
              .map(
                (player: { name: string; uuid: string }) => `- ${player.name}`
              )
              .join("\n")}`,
            inline: false,
          }
        )
        .setTimestamp(serverData.cachetime * 1000)
        .setFooter({
          text: "미자믹 업데이트 시간",
          iconURL: "https://i.imgur.com/wSTFkRM.png",
        });

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (error) {
      console.error("Error fetching server status:", error);

      // interaction이 deferred 상태인지 확인 후 응답
      if (interaction.deferred) {
        await interaction.editReply("현재 서버 상태를 가져올 수 없습니다.");
      }
      // deferred가 아니면 상위 에러 핸들러가 처리하도록 throw
      else {
        throw error;
      }
    }
  },
};

export default command;
