import crypto from "crypto";

const SESSION_COOKIE_NAME = "mailsender_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "mailsender_very_long_secret_key_of_32_characters_minimum";

// Pre-derive key once at load time to prevent event-loop blocking on scryptSync per HTTP request
const DERIVED_KEY = crypto.scryptSync(SESSION_SECRET, "salt", 32);

// Encrypt payload using AES-256-GCM
export function encrypt(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", DERIVED_KEY, iv);
  let encrypted = cipher.update(JSON.stringify(payload), "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

// Decrypt payload
export function decrypt(token) {
  try {
    const [ivHex, encryptedHex, authTagHex] = token.split(":");
    if (!ivHex || !encryptedHex || !authTagHex) return null;
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", DERIVED_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

// Session middleware for Express
export function sessionMiddleware(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) {
    req.session = null;
    return next();
  }
  
  const payload = decrypt(token);
  req.session = payload;
  next();
}

// Helper to set cookie on response
export function setSessionCookie(res, data) {
  const token = encrypt(data);
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

// Helper to clear cookie on response
export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    path: "/",
  });
}
