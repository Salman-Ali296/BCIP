import { z } from 'zod';

const disposableEmailDomains = new Set([
    '10minutemail.com',
    'guerrillamail.com',
    'guerrillamail.net',
    'guerrillamail.biz',
    'guerrillamail.de',
    'guerrillamail.info',
    'guerrillamail.org',
    'guerrillamail.us',
    'guerrillamailblock.com',
    'mailinator.com',
    'maildrop.cc',
    'temp-mail.org',
    'temp-mail.net',
    'temporary-mail.net',
    'tempmail.com',
    'tempmail.net',
    'tempmail.plus',
    'tempmailo.com',
    'throwawaymail.com',
    'yopmail.com',
    'yopmail.fr',
    'yopmail.net',
    'getnada.com',
    'dispostable.com',
    'fakeinbox.com',
    'mailnesia.com',
    'mailtemp.link',
    'mintemail.com',
    'sharklasers.com',
    'grr.la',
    'trashmail.com',
    'trashmail.me',
    'mohmal.com',
    'mytemp.email',
    'emailondeck.com',
    'inboxkitten.com',
    'tempail.com',
    'burnermail.io',
    'mailpoof.com',
    'discard.email',
    'spamgourmet.com',
    'tempr.email',
    'fake-mail.net',
    'tmpmail.org',
    'tmpmail.net',
    'emailfake.com',
    'crazymailing.com',
    'mailcatch.com',
    'mailnull.com',
    'wegwerfmail.de',
    'wegwerfmail.net',
    'getairmail.com',
    'mailsac.com',
    'cool.fr.nf',
    'nospam.ze.tc',
    'nomail.xl.cx',
    'mega.zik.dj',
    'speed.1s.fr',
    'secmail.com',
    'secmail.net',
    '1secmail.com',
    '1secmail.net',
    'lifetimeemail.net',
    'inboxbear.com',
    'moakt.com',
]);

const personalEmailDomains = new Set([
    'aol.com',
    'fastmail.com',
    'gmail.com',
    'googlemail.com',
    'gmx.com',
    'gmx.net',
    'hey.com',
    'hotmail.com',
    'hotmail.co.uk',
    'icloud.com',
    'live.com',
    'mac.com',
    'mail.com',
    'me.com',
    'msn.com',
    'outlook.com',
    'pm.me',
    'proton.me',
    'protonmail.com',
    'protonmail.ch',
    'tuta.com',
    'tutanota.com',
    'yahoo.com',
    'yahoo.co.uk',
    'yahoo.ca',
    'yahoo.com.au',
    'yandex.com',
    'yandex.ru',
    'zoho.com',
]);

export function isDisposableEmailAddress(email: string): boolean {
    const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase();
    for (const disposableDomain of disposableEmailDomains) {
        if (domain === disposableDomain || domain.endsWith(`.${disposableDomain}`)) return true;
    }
    return false;
}

export function isPersonalEmailAddress(email: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.slice(normalizedEmail.lastIndexOf('@') + 1);
    return personalEmailDomains.has(domain);
}

export const businessEmailAddressSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .refine(email => !isDisposableEmailAddress(email), {
        message: 'Temporary email addresses are not allowed',
    });

export function isSuspiciousDomain(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf("@");

  // Basic structural checks; use a separate email validator as well.
  if (
    atIndex <= 0 ||
    atIndex !== normalizedEmail.indexOf("@") ||
    atIndex === normalizedEmail.length - 1
  ) {
    return true;
  }

  const domain = normalizedEmail.slice(atIndex + 1);
  const labels = domain.split(".");

  // Reject malformed domain structure.
  if (
    labels.length < 2 ||
    labels.some(
      (label) =>
        label.length === 0 ||
        label.length > 63 ||
        !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
    )
  ) {
    return true;
  }

  const domainName = labels[0];

  if (!domainName) {
    return true;
  }

  // Heuristic 1: unusually long first domain label.
  if (domainName.length > 30) {
    return true;
  }

  // Heuristic 2: unusually low vowel ratio.
  const vowels = domainName.match(/[aeiou]/g) ?? [];
  const vowelRatio = vowels.length / domainName.length;

  if (domainName.length > 10 && vowelRatio < 0.1) {
    return true;
  }

  // Heuristic 3: five or more consecutive consonants.
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(domainName)) {
    return true;
  }

  return false;
}