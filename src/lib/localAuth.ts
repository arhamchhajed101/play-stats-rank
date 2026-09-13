const LOCAL_ACCOUNT_KEY = "gamers_tag_local_account";
const LOCAL_SESSION_KEY = "gamers_tag_demo_user";

export interface LocalAccount {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readAccount(): LocalAccount | null {
  try {
    const stored = localStorage.getItem(LOCAL_ACCOUNT_KEY);
    return stored ? (JSON.parse(stored) as LocalAccount) : null;
  } catch {
    return null;
  }
}

function saveSession(account: LocalAccount) {
  localStorage.setItem(
    LOCAL_SESSION_KEY,
    JSON.stringify({ id: account.id, email: account.email, username: account.username, created_at: account.createdAt }),
  );
}

export async function createLocalAccount(email: string, password: string, username: string): Promise<LocalAccount> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = readAccount();
  if (existing?.email === normalizedEmail) {
    throw new Error("An account with this email already exists. Try signing in instead.");
  }

  const account: LocalAccount = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    username: username.trim(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(LOCAL_ACCOUNT_KEY, JSON.stringify(account));
  saveSession(account);
  return account;
}

export async function signInLocalAccount(email: string, password: string): Promise<LocalAccount> {
  const account = readAccount();
  if (!account || account.email !== email.trim().toLowerCase() || account.passwordHash !== await hashPassword(password)) {
    throw new Error("Incorrect email or password. Please try again.");
  }

  saveSession(account);
  return account;
}

export function clearLocalSession() {
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

export function hasLocalAccount() {
  return Boolean(readAccount());
}