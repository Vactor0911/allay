import axios from "axios";

// 캐싱된 서버 상태
interface CachedServerStatus {
  online: boolean;
  motd: string;
  version: string;
  players: {
    name: string;
    uuid: string;
  }[];
  playersMax: number | string;
  hostName: string;
  cachetime: number;
  cacheexpire: number;
}
let cachedServerStatus: CachedServerStatus | null = null;

/**
 * Minecraft Server Status API로 서버 상태를 가져오는 함수
 * @returns 현재 서버 상태 정보
 */
export const fetchServerStatus = async (): Promise<CachedServerStatus> => {
  const unixTime = Math.floor(Date.now() / 1000);

  if (
    cachedServerStatus &&
    cachedServerStatus.cacheexpire &&
    cachedServerStatus.cacheexpire > unixTime
  ) {
    return cachedServerStatus;
  }

  // 서버 상태 확인
  const SERVER_ADDRESS = process.env.SERVER_ADDRESS;
  if (!SERVER_ADDRESS) {
    throw new Error("SERVER_ADDRESS not found");
  }

  const response = await axios.get(
    `https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`
  );
  const serverData = response.data;

  // 캐시 시간 정보
  const cachetime = serverData.debug.cachetime || unixTime;
  const cacheexpire = serverData.debug.cacheexpire || unixTime + 60; // 60초 캐시

  // 서버 오프라인 시
  if (!serverData.online) {
    cachedServerStatus = {
      online: false,
      motd: "",
      version: "",
      players: [],
      playersMax: "",
      hostName: SERVER_ADDRESS,
      cachetime,
      cacheexpire,
    };

    return cachedServerStatus;
  }

  // 서버 정보
  const motd = serverData.motd?.clean[0] || "MWU Minecraft Server";
  const version = serverData.version || "N/A";
  const players = serverData.players?.list || [];
  const playersMax = serverData.players?.max || "N/A";
  const hostName = serverData.hostname || SERVER_ADDRESS;

  // 캐시 저장
  cachedServerStatus = {
    online: true,
    motd,
    version,
    players,
    playersMax,
    hostName,
    cachetime,
    cacheexpire,
  };

  // 정보 반환
  return cachedServerStatus;
};
