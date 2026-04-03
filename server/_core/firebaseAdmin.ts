import { ENV } from "./env";
import admin from "firebase-admin";
import type { DecodedIdToken } from "firebase-admin/auth";

let adminApp: admin.app.App | null = null;

function getFirebaseAdmin(): admin.app.App {
  if (adminApp) return adminApp;

  if (!ENV.firebaseProjectId || !ENV.firebaseClientEmail || !ENV.firebasePrivateKey) {
    throw new Error(
      "[Firebase Admin] Missing credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: ENV.firebaseProjectId,
      clientEmail: ENV.firebaseClientEmail,
      privateKey: ENV.firebasePrivateKey.replace(/\\n/g, "\n"),
    }),
  });

  return adminApp;
}

export async function verifyFirebaseToken(token: string): Promise<DecodedIdToken> {
  const app = getFirebaseAdmin();

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("[Firebase Admin] Token verification timed out after 10s")), 10_000)
  );

  const result = await Promise.race([
    admin.auth(app).verifyIdToken(token),
    timeout,
  ]);

  return result;
}
