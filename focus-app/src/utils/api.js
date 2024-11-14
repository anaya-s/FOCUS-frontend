import config from '../config'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const baseURL = config.apiUrl

// same function as updateToken()
async function refreshAccessToken() {
  // Make an API call to refresh the access token
  const response = await fetch("/auth/refresh", {
    method: "POST",
    credentials: "include", // Include cookies if tokens are stored in cookies
  });

  if (!response.ok) throw new Error("Failed to refresh token");

  const data = await response.json();
  localStorage.setItem(ACCESS_TOKEN, data.accessToken);

  return data.accessToken;
}

export const reauthenticatingFetch = async (url) => {
  let accessToken = localStorage.getItem(ACCESS_TOKEN);

  let options = {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer $accessToken`,
      },
  };

  let response = await fetch(`${baseURL}${url}`, options);

  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      options.headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    } catch (error) {
      console.error("Re-authentication failed:", error);
      throw error;
    }
  }

  return response.json();
}
