# Setting Up Google Provider in Keycloak

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in app name, support email, developer contact
   - Add scopes: `openid`, `email`, `profile`
   - Save and continue through the steps
6. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: Jump App (or any name)
   - **Authorized redirect URIs**: Add this exact URI:
     ```
     http://localhost:8080/realms/jump/broker/google/endpoint
     ```
   - Click **Create**
7. Copy the **Client ID** and **Client Secret** (you'll need these for Keycloak)

## Step 2: Configure Google Provider in Keycloak

1. Log into Keycloak Admin Console: `http://localhost:8080`
2. Select your realm: **jump**
3. Go to **Identity providers** (left sidebar)
4. Click **Add provider** → Select **Google**
5. Fill in the form:
   - **Redirect URI**: Already filled with `http://localhost:8080/realms/jump/broker/google/endpoint`
     - Copy this URI and use it in Google Cloud Console (Step 1.6)
   - **Client ID**: Paste your Google Client ID
   - **Client Secret**: Paste your Google Client Secret
   - **Display order**: Leave empty or set to `1` (for ordering on login page)
   - **Hosted Domain**: Leave empty (unless you want to restrict to specific Google Workspace domain)
6. Toggle options (optional):
   - **Use userlp param**: Off (default)
   - **Request refresh token**: On (recommended for better token management)
7. Click **Add**

## Step 3: Verify Configuration

1. Go to **Identity providers** → Click on your **google** provider
2. Check the **Settings** tab:
   - Client ID and Secret should be saved
   - Redirect URI should match what's in Google Cloud Console
3. Test the connection:
   - Go to your frontend login page
   - Click "Continue with Google"
   - You should be redirected to Google's login page
   - After logging in, you'll be redirected back to your app

## Step 4: Update Frontend (if needed)

Make sure `LoginOptions.tsx` includes Google in enabled providers:

```tsx
enabledProviders={["google", "facebook", "github"]}
```

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the redirect URI in Google Cloud Console exactly matches:
  `http://localhost:8080/realms/jump/broker/google/endpoint`
- Check for trailing slashes or typos

### "Invalid client" error
- Verify Client ID and Secret are correct in Keycloak
- Make sure you copied them from the correct Google Cloud project

### Provider not showing on login page
- Check that the provider alias is `google` (lowercase)
- Verify `enabledProviders` includes `"google"` in `LoginOptions.tsx`

### OAuth consent screen issues
- Make sure you've completed the OAuth consent screen setup
- Add your email as a test user if the app is in testing mode

## Production Setup

For production, you'll need to:
1. Update redirect URI in Google Cloud Console to your production Keycloak URL
2. Update redirect URI in Keycloak to match
3. Consider using HTTPS for both Keycloak and your frontend
4. Update environment variables for production Keycloak URL

