import axios from "axios";

/**
 * Minecraft Server Status API로 서버 상태를 가져오는 함수
 * @returns 현재 서버 상태 정보
 */
export const fetchServerStatus = async () => {
  // 서버 상태 확인
  const SERVER_ADDRESS = process.env.SERVER_ADDRESS;
  if (!SERVER_ADDRESS) {
    throw new Error("SERVER_ADDRESS not found");
  }

  const response = await axios.get(
    `https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`
  );
  const serverData = response.data;

  // 서버 오프라인 시
  if (!serverData.online) {
    return {
      online: false,
    };
  }

  // 서버 정보
  const motd = serverData.motd?.clean[0] || "MWU Minecraft Server";
  const version = serverData.version || "N/A";
  const players = serverData.players?.list || [];
  const playersMax = serverData.players?.max || "N/A";

  // 정보 반환
  return { online: true, motd, version, players, playersMax };
};
