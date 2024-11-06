/* eslint-disable no-param-reassign */
import { CONTENT_TYPE_JSON } from '@src/shared/globalDefine';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';

type UserAuthModel = {
  id: string;
  refreshToken: string;
  token: string;
  username: string;
};

const nextAuthOptions = (
  request: NextApiRequest,
  response: NextApiResponse,
) => {
  return {
    providers: [
      CredentialsProvider({
        id: 'email-password-credential',
        name: 'Credentials',
        type: 'credentials',
        credentials: {
          userName: {
            label: 'userName',
            type: 'text',
          },
          password: {
            label: 'password',
            type: 'password',
          },
        },
        async authorize(credentials) {
          const email = credentials?.userName;
          const password = credentials?.password;
          const applicationId = process.env.NEXT_PUBLIC_ENV_FUSIONAUTH_APP_ID;

          const res = await axios.post(
            '/accounts/login',
            { email, password, application_id: applicationId },
            {
              headers: CONTENT_TYPE_JSON,
              withCredentials: true,
            },
          );

          if (res.data.token === undefined || res.data.token === null) {
            throw new Error(res.data);
          }

          if (res.data.token) {
            const user: UserAuthModel = res.data;

            const cookies = new Cookies(request, response);

            const cookieOption = {
              path: '/',
              maxAge: 1000 * 60 * 60 * 24, // 밀리세컨드단위,
              domain: process.env.NEXT_PUBLIC_ENV_COOKIE_DOMAIN,
              httpOnly: false,
            };
            cookies.set('access_token', res.data.token, cookieOption);
            cookies.set('refresh_token', res.data.refreshToken, cookieOption);

            return user;
          }

          return null;
        },
      }),
    ],
    session: {
      maxAge: 3600 * 24,
    },
    callbacks: {
      async session({ session, token }: any) {
        (session.user as UserAuthModel) = token.user as UserAuthModel;
        return session;
      },
      async jwt({ token, user }: any) {
        if (user) {
          token.user = user;
        }
        return token;
      },
    },
    pages: {
      signIn: '/member',
    },
    secret: process.env.NEXT_PUBLIC_ENV_AUTH_SECRET,
  };
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, nextAuthOptions(req, res));
};
