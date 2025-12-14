import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ChatInputCommandInteraction,
} from "discord.js";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import dotenv from "dotenv";
import type { Command } from "./types/command.type.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Client 확장
declare module "discord.js" {
  export interface Client {
    commands: Collection<string, Command>;
  }
}

class DiscordBot {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.commands = new Collection<string, Command>();

    this.loadCommands();
    this.setupEventHandlers();
  }

  private async loadCommands(): Promise<void> {
    const commandsPath = join(__dirname, "commands");
    const commandFiles = readdirSync(commandsPath).filter(
      (file) =>
        (file.endsWith(".js") || file.endsWith(".ts")) &&
        !file.endsWith(".d.ts")
    );

    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const commandModule = await import(`file://${filePath}`);
      const command: Command = commandModule.default;

      if (command.data && typeof command.execute === "function") {
        this.client.commands.set(command.data.name, command);
        console.log(`✓ ${command.data.name} 커맨드 로드됨`);
      } else {
        console.log(`⚠ ${file}에 data 또는 execute가 없습니다.`);
      }
    }
  }

  private setupEventHandlers(): void {
    // 봇 준비 완료
    this.client.once(Events.ClientReady, (readyClient) => {
      console.log(`\n✓ ${readyClient.user.tag} 봇이 준비되었습니다!`);
      console.log(
        `✓ ${this.client.commands.size}개의 커맨드가 로드되었습니다.\n`
      );
    });

    // 인터랙션 처리
    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      await this.handleCommand(interaction);
    });

    // 에러 처리
    this.client.on(Events.Error, (error) => {
      console.error("Discord client error:", error);
    });

    // 프로세스 종료 처리
    process.on("SIGINT", () => this.shutdown());
    process.on("SIGTERM", () => this.shutdown());
  }

  private async handleCommand(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const command = this.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`${interaction.commandName} 커맨드를 찾을 수 없습니다.`);
      return;
    }

    try {
      await command.execute(interaction);
      console.log(
        `✓ ${interaction.user.tag}이(가) /${interaction.commandName} 실행`
      );
    } catch (error) {
      console.error(`커맨드 실행 오류 [${interaction.commandName}]:`, error);

      const errorMessage = {
        content: "커맨드 실행 중 오류가 발생했습니다.",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }

  public async start(): Promise<void> {
    const token = process.env.DISCORD_TOKEN;

    if (!token) {
      throw new Error("DISCORD_TOKEN이 설정되지 않았습니다.");
    }

    try {
      await this.client.login(token);
    } catch (error) {
      console.error("봇 로그인 실패:", error);
      process.exit(1);
    }
  }

  private shutdown(): Promise<void> {
    console.log("\n봇을 종료합니다...");
    this.client.destroy();
    process.exit();
  }
}

// 봇 시작
const bot = new DiscordBot();
bot.start();
