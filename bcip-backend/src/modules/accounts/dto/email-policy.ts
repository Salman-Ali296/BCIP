import { z } from "zod";

/**
 * Common consumer email providers.
 *
 * This list is used to enforce the business-registration email policy.
 * It is not a complete list of all personal email providers.
 */
const PERSONAL_EMAIL_DOMAINS = new Set([
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.uk",
    "yahoo.ca",
    "outlook.com",
    "hotmail.com",
    "hotmail.co.uk",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
    "gmx.com",
    "gmx.net",
    "mail.com",
    "yandex.com",
    "yandex.ru",
]);

const DISPOSABLE_EMAIL_DOMAINS = new Set([
    "mailinator.com",
    "10minutemail.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.biz",
    "guerrillamail.de",
    "guerrillamail.info",
    "guerrillamail.org",
    "guerrillamail.us",
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
    "cool.fr.nf",
    "nospam.ze.tc",
    "nomail.xl.cx",
    "mega.zik.dj",
    "speed.1s.fr",
    "temporary-mail.net",
    "tempmail.plus",
    "tempmailo.com",
    "tmpmail.org",
    "trashmail.com",
    "sharklasers.com",
    "grr.la",
    "maildrop.cc",
    "mailnesia.com",
    "dispostable.com",
    "getnada.com",
    "moakt.com",
    "throwawaymail.com",
    "temp-mail.org",
    "1secmail.com",
    "secmail.com",
    "1secmail.net",
    "secmail.net",
    "emailondeck.com",
    "inboxbear.com",
    "mailtemp.link",
    "lifetimeemail.net",
]);

/**
 * Validates and normalizes an email address.
 *
 * This checks the email's format only. It does not prove that
 * the mailbox exists or that the user owns it.
 */
export const emailAddressSchema = z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email address is too long")
    .email("Enter a valid email address");

/**
 * Returns true when an email uses a known personal email provider.
 *
 * Unknown domains are not automatically classified as personal.
 * Email verification is still required to establish ownership.
 */
function getEmailDomain(email: string): string {
    const normalizedEmail = email.trim().toLowerCase();
    const atIndex = normalizedEmail.lastIndexOf("@");

    if (atIndex <= 0 || atIndex === normalizedEmail.length - 1) {
        return "";
    }

    return normalizedEmail
        .slice(atIndex + 1)
        .replace(/\.$/, "");
}

export function isDisposableEmailAddress(email: string): boolean {
    const domain = getEmailDomain(email);
    if (!domain) {
        return false;
    }

    return Array.from(DISPOSABLE_EMAIL_DOMAINS).some(disposableDomain =>
        domain === disposableDomain || domain.endsWith(`.${disposableDomain}`),
    );
}

export function isPersonalEmailAddress(email: string): boolean {
    const domain = getEmailDomain(email);
    if (!domain) {
        return false;
    }

    return PERSONAL_EMAIL_DOMAINS.has(domain);
}