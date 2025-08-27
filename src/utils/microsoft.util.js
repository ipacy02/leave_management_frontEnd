import { PublicClientApplication } from '@azure/msal-browser';

// Microsoft Authentication configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

// MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Microsoft Graph API scopes for the token request
const scopes = ['user.read', 'email'];

/**
 * Handles the Microsoft authentication flow
 * @param {Function} onSuccess - Callback function to execute on successful authentication
 * @param {Function} onError - Callback function to execute on authentication error
 */
export const loginWithMicrosoft = async (onSuccess, onError) => {
  try {
    // Try silent sign-in first (if user has active session)
    const silentRequest = {
      scopes,
      loginHint: '',
      forceRefresh: false,
      redirectUri: window.location.origin
    };
    
    try {
      const silentResult = await msalInstance.acquireTokenSilent(silentRequest);
      onSuccess(silentResult.accessToken);
      return;
    } catch (silentError) {
      // Silent sign-in failed, continue with popup or redirect
      console.log('Silent auth failed, continuing with interactive auth', silentError);
    }
    
    // Use popup for interactive sign-in
    const loginRequest = {
      scopes,
      prompt: 'select_account'
    };
    
    const result = await msalInstance.loginPopup(loginRequest);
    
    if (result && result.accessToken) {
      onSuccess(result.accessToken);
    } else {
      // Request token separately if not included in login response
      const tokenRequest = {
        scopes,
        account: msalInstance.getAllAccounts()[0]
      };
      
      const tokenResult = await msalInstance.acquireTokenSilent(tokenRequest);
      onSuccess(tokenResult.accessToken);
    }
  } catch (error) {
    console.error('Microsoft authentication error:', error);
    onError(error.message || 'Failed to authenticate with Microsoft');
  }
};

/**
 * Signs the user out of Microsoft
 */
export const logoutFromMicrosoft = async () => {
  const logoutRequest = {
    account: msalInstance.getAllAccounts()[0],
    postLogoutRedirectUri: window.location.origin
  };
  
  try {
    await msalInstance.logoutPopup(logoutRequest);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export default {
  loginWithMicrosoft,
  logoutFromMicrosoft,
  msalInstance
};