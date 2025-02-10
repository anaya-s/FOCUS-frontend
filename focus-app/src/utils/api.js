import config from '../config'
import { ACCESS_TOKEN } from './constants';

const baseURL = config.apiUrl

// same function as updateToken()
async function refreshAccessToken() {
  // Make an API call to refresh the access token
  var accessToken = JSON.parse(localStorage.getItem(ACCESS_TOKEN));
  const response = await fetch(`${baseURL}/api/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Ensures DRF processes the request correctly
    },
    body: JSON.stringify({
      refresh: accessToken?.refresh, // Pass the refresh token if stored in localStorage
    }),
    credentials: "include", // Include cookies if necessary
  });

  if (!response.ok) throw new Error("Failed to refresh token");

  const data = await response.json();

  if (response.status === 200) {
    /* update authToken with new access token, ensuring that the refresh token comes before access token in the JSON data structure */
    const newAuthTokens = {
      "refresh": accessToken?.refresh,
      "access": data.access,
    }
    localStorage.setItem("authTokens", JSON.stringify(newAuthTokens)); // store the new authTokens in localStorage
  }

  return data.access; // this is the new access token to be returned to below function
}

/*
This function automatically refreshes the access token if expired 
  For GET method: don't pass in any value for 'body' (leave it undefined) e.g. reauthenticatingFetch(method, url)
  For POST method: pass the correct value for 'body' in JSON format  e.g. reauthenticatingFetch(method, url, body)
*/
export const reauthenticatingFetch = async (method, url, body) => {

  // console.log(url); //Check if correct endpoint is being used
  
  const authTokens = localStorage.getItem(ACCESS_TOKEN);

  const parsedTokens = JSON.parse(authTokens); // Parse if not already parsed
  var accessToken = parsedTokens?.access;

  let options = {
    method: method,
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  };

  let response = await fetch(url, options);

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
