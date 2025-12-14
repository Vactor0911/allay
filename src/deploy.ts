import { REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import dotenv from "dotenv";
import { Command } from "./types/command.type";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DeployConfig {
  token: string;
  clientId: string;
  guildId?: string | undefined;
}

const config: DeployConfig = {
  token: process.env.DISCORD_TOKEN!,
  clientId: process.env.CLIENT_ID!,
  guildId: process.env.GUILD_ID,
};

// 환경변수 검증
if (!config.token || !config.clientId) {
  throw new Error("DISCORD_TOKEN과 CLIENT_ID가 필요합니다.");
}

const deployCommands = async (): Promise<void> => {
  const commands: any[] = [];
  const commandsPath = join(__dirname, "commands");

  const commandFiles = readdirSync(commandsPath).filter(
    (file) =>
      (file.endsWith(".js") || file.endsWith(".ts")) && !file.endsWith(".d.ts")
  );

  // 모든 커맨드 로드
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const commandModule = await import(`file://${filePath}`);
    const command: Command = commandModule.default;

    if (command?.data && typeof command.execute === "function") {
      commands.push(command.data.toJSON());
      console.log(`✓ ${command.data.name} 커맨드 로드됨`);
    } else {
      console.log(`⚠ ${file}에 data 또는 execute가 없습니다.`);
    }
  }

  const rest = new REST().setToken(config.token);

  try {
    console.log(`\n${commands.length}개의 슬래시 커맨드를 등록합니다...`);

    let data: any;

    if (config.guildId) {
      // 특정 서버에만 등록 (즉시 적용, 테스트용)
      data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
      console.log(`✓ ${data.length}개의 커맨드가 서버에 등록되었습니다.`);
    } else {
      // 전역 등록 (모든 서버, 적용까지 최대 1시간)
      data = await rest.put(Routes.applicationCommands(config.clientId), {
        body: commands,
      });
      console.log(`✓ ${data.length}개의 커맨드가 전역으로 등록되었습니다.`);
    }
  } catch (error) {
    console.error("커맨드 등록 중 오류 발생:", error);
    process.exit(1);
  }
};

deployCommands();
