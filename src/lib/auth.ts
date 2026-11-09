import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import type { EmailConfig } from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { generateUsername } from "@/lib/username";

const baseAdapter = PrismaAdapter(prisma);

// Providers are registered conditionally on their env vars so the app boots
// cleanly in any environment. Add new OAuth providers (Apple, GitHub, etc.)
// by following the same pattern: import, guard on env vars, push onto
// `providers`. Then add a matching button block in
// `src/app/auth/signin/signin-form.tsx` keyed by the provider id.
//
// All OAuth providers here set `allowDangerousEmailAccountLinking: true`
// so that a user who first signs in with, say, Google and later tries
// Facebook with the same email is linked to their existing account
// instead of creating a duplicate. This is safe only with providers
// that verify email ownership (Google, Apple, Facebook, Microsoft, GitHub, X — all do).
// Do NOT enable this for any provider that doesn't verify emails.
const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
} else {
  console.warn(
    "[auth] Google sign-in disabled: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set"
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
} else {
  console.warn(
    "[auth] Facebook sign-in disabled: FACEBOOK_CLIENT_ID or FACEBOOK_CLIENT_SECRET not set"
  );
}

if (process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
      allowDangerousEmailAccountLinking: true,
    })
  );
} else {
  console.warn(
    "[auth] Microsoft sign-in disabled: AZURE_AD_CLIENT_ID or AZURE_AD_CLIENT_SECRET not set"
  );
}

/**
 * Email magic-link provider that sends through Resend's HTTP API.
 *
 * Defined inline rather than via `next-auth/providers/email` because that
 * module hard-requires nodemailer at import time, and nodemailer is never
 * used here (mail goes out over HTTPS, not SMTP). Keeping nodemailer out of
 * the dependency tree removes a long list of SMTP-related advisories.
 */
function resendEmailProvider(apiKey: string, from: string): EmailConfig {
  return {
    id: "email",
    type: "email",
    name: "Email",
    server: "",
    from,
    maxAge: 24 * 60 * 60,
    options: {},
    async sendVerificationRequest({ identifier: email, url }) {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: email,
        subject: "Your GenericOrNot sign-in link",
        text: `Sign in to GenericOrNot:\n\n${url}\n\nThis link expires in 24 hours. If you didn't request it, you can ignore this email.`,
        html: `
          <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 20px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #0d1b4a; margin: 0 0 8px;">
              Generic<em style="font-style: italic;"> Or </em>Not
            </h1>
            <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 32px;">
              Store brand or name brand? Canadians compare notes.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Click the button below to sign in. This link expires in 24 hours and can only be used once.
            </p>
            <a href="${url}" style="display: inline-block; background: #0d1b4a; color: white; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 600; font-size: 14px;">
              Sign in to GenericOrNot
            </a>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 32px 0 0;">
              If you didn&rsquo;t request this email, you can safely ignore it.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
              genericornot.com &middot; Transparency is our only product.
            </p>
          </div>
        `,
      });
      if (error) {
        // Throwing makes NextAuth redirect to the error page instead of
        // telling the user to check an inbox that will never receive mail.
        throw new Error(`Failed to send sign-in email: ${error.message}`);
      }
    },
  };
}

if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
  providers.push(resendEmailProvider(process.env.RESEND_API_KEY, process.env.EMAIL_FROM));
} else {
  console.warn(
    "[auth] Email magic link disabled: RESEND_API_KEY or EMAIL_FROM not set"
  );
}

async function createUserWithUniqueUsername(data: Omit<AdapterUser, "id">) {
  // Handles are random, so collisions are rare; retry a few times on the
  // unique constraint rather than doing a racy "check then insert".
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.user.create({
        data: {
          email: data.email,
          name: data.name ?? data.email.split("@")[0],
          image: data.image,
          emailVerified: data.emailVerified ?? null,
          username: generateUsername(),
        },
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "P2002" || attempt === 4) throw error;
    }
  }
  throw new Error("Unreachable");
}

export const authOptions: NextAuthOptions = {
  adapter: {
    ...baseAdapter,
    createUser: async (data: Omit<AdapterUser, "id">) => {
      const user = await createUserWithUniqueUsername(data);
      return { ...user, emailVerified: user.emailVerified ?? null } as AdapterUser;
    },
  },
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { role: true, username: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.username = dbUser.username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
};
