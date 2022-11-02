import NextAuth, { CallbacksOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import { scopes, spotifyApi } from '../../../config/spotify';
import { ExtendedToken, TokenError } from '../../../types';

const refreshAccessToken = async (
    token: ExtendedToken
): Promise<ExtendedToken> => {
    try {
        spotifyApi.setAccessToken(token.accessToken);
        spotifyApi.setRefreshToken(token.refreshToken);

        // "Hey Spotify, please refresh my access token"
        const { body: refreshedToken } = await spotifyApi.refreshAccessToken();

        console.log('refreshedAccessToken', refreshedToken);

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            refreshToken: refreshedToken.refresh_token || token.refreshToken,
            accessTokenExpiresAt: Date.now() + refreshedToken.expires_in * 1000,
        };
    } catch (error) {
        console.error(error);

        return {
            ...token,
            error: TokenError.refreshAccessTokenError,
        };
    }
};

const jwtCallback: CallbacksOptions['jwt'] = async ({
    token,
    account,
    user,
}) => {
    let extendedToken: ExtendedToken;
    // User logs in for the first time
    if (account && user) {
        extendedToken = {
            ...token,
            user,
            accessToken: account.access_token as string,
            refreshToken: account.refresh_token as string,
            accessTokenExpiresAt: (account.expires_at as number) * 1000,
        };
        console.log('FIRST TIME LOGIN, ExtendedToken: ', extendedToken);
        
        return extendedToken;
    }

    // Subsequent requests to check auth sessions
    if (Date.now() + 5000 < (token as ExtendedToken).accessTokenExpiresAt) {
        console.log(
            'ACCESS TOKEN STILL VALID, RETURNING EXTENDED TOKEN: ',
            token
        );
        return token;
    }

    // Access token has expired, refresh it
    console.log('ACCESS TOKEN EXPIRED, REFRESHING TOKEN...');
    return await refreshAccessToken(token as ExtendedToken);
};

const sessionsCallback: CallbacksOptions['session'] = async ({session, token}) => {
    if ((token as ExtendedToken).error) {
        console.log('SESSION CALLBACK ERROR: ', (token as ExtendedToken).error);
        return {
            ...session,
            // error: (token as ExtendedToken).error,
        };
    }

    console.log('SESSION CALLBACK: ', session);
    return {
        ...session,
        // user: (token as ExtendedToken).user,
    };
}

export default NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID as string,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
            authorization: {
                url: 'https://accounts.spotify.com/authorize',
                params: {
                    scope: scopes,
                },
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        jwt: jwtCallback,
        sessions: sessionsCallback,
    },
});
