const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Copy mobile/.env.example to mobile/.env and set it ' +
      "to your computer's LAN IP, e.g. http://192.168.1.20:8000",
  );
}

export const env = {
  apiUrl: API_URL,
};
