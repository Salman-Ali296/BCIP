import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BCIP_CONTACT_EMAIL, BCIP_SOCIAL_LINKS } from "@/lib/brand";

/* ------------------------------------------------------------------
   FOOTER DATA
   ------------------------------------------------------------------ */

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "What it does", href: "/#capabilities" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Free trial", href: "/register" },
    ],
  },
  {
    title: "For customers",
    links: [
      { label: "File a complaint", href: "/support" },
      { label: "Track a complaint", href: "/support/track" },
      { label: "Help", href: "/support" },
    ],
  },
  {
    title: "For businesses",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create a workspace", href: "/register" },
      { label: "Who it's for", href: "/#industries" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

/* ------------------------------------------------------------------
   COMPONENT
   ------------------------------------------------------------------ */

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#070d1a] text-white border-t border-white/8">
      <div className="relative mx-auto max-w-[1280px] px-6 py-14 lg:px-8">
        {/* Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandLogo variant="light" height={32} />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Complaint management for businesses. Customers file and track complaints, and your team works them from one sorted queue.
            </p>

            <div className="mt-5 space-y-1.5 text-xs text-slate-500">
              <a
                href={`mailto:${BCIP_CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                {BCIP_CONTACT_EMAIL}
              </a>
            </div>

            {/* Social */}
            <div className="mt-4 flex items-center gap-2">
              {BCIP_SOCIAL_LINKS.linkedin && (
                <a
                  href={BCIP_SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition text-[11px] font-bold"
                >
                  in
                </a>
              )}
              {BCIP_SOCIAL_LINKS.github && (
                <a
                  href={BCIP_SOCIAL_LINKS.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition text-[10px] font-bold"
                >
                  GH
                </a>
              )}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} BCIP, Business Complaint Intelligence Platform</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link href="/support" className="hover:text-slate-400 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
