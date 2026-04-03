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
  return await admin.auth(app).verifyIdToken(token);
}
