"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { HelpdeskLogo } from "@/components/brand/helpdesk-logo";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Inbox,
  BrainCircuit,
  GitMerge,
  Search,
  BarChart3,
  Bell,
  Users,
  Headphones,
  Building2,
  MessageSquare,
  AlertTriangle,
  Copy,
  Route,
  Lightbulb,
} from "lucide-react";

/* ------------------------------------------------------------------
   TYPES
   ------------------------------------------------------------------ */

interface DropdownItem {
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface NavDropdown {
  label: string;
  items: DropdownItem[];
}

/* ------------------------------------------------------------------
   DROPDOWN DATA
   ------------------------------------------------------------------ */

const PLATFORM_ITEMS: DropdownItem[] = [
  {
    label: "Complaint Management",
    desc: "Manage complaints throughout their lifecycle",
    icon: Inbox,
    href: "#product",
  },
  {
    label: "AI Classification & Prioritization",
    desc: "Categorize complaints and assess their urgency",
    icon: BrainCircuit,
    href: "#ai-intelligence",
  },
  {
    label: "Duplicate & Related-Issue Detection",
    desc: "Identify semantically similar complaints",
    icon: GitMerge,
    href: "#product",
  },
  {
    label: "Complaint Tracking",
    desc: "Track complaint status and resolution progress",
    icon: Search,
    href: "#product",
  },
  {
    label: "Analytics & Insights",
    desc: "Explore complaint trends and performance metrics",
    icon: BarChart3,
    href: "#ai-intelligence",
  },
  {
    label: "Root-Cause Insights",
    desc: "Identify recurring complaint patterns and potential causes",
    icon: GitMerge,
    href: "#ai-intelligence",
  },
  {
    label: "Notifications & Escalations",
    desc: "Keep teams informed about updates and priority issues",
    icon: Bell,
    href: "#product",
  },
];

const SOLUTIONS_ITEMS: DropdownItem[] = [
  {
    label: "Customer Experience Teams",
    desc: "Improve customer satisfaction and service quality",
    icon: Users,
    href: "#industries",
  },
  {
    label: "Customer Support Teams",
    desc: "Help teams manage and resolve complaints efficiently",
    icon: Headphones,
    href: "#industries",
  },
  {
    label: "Operations & Business Leaders",
    desc: "Gain visibility into complaint trends and operations",
    icon: BarChart3,
    href: "#industries",
  },
  {
    label: "Enterprise Risk & Quality Teams",
    desc: "Monitor recurring issues and support quality improvement",
    icon: Building2,
    href: "#industries",
  },
];

const AI_ITEMS: DropdownItem[] = [
  {
    label: "AI Complaint Classification",
    desc: "Categorize complaints by type and topic",
    icon: BrainCircuit,
    href: "#ai-intelligence",
  },
  {
    label: "Sentiment Analysis",
    desc: "Analyze customer sentiment and emotional tone",
    icon: MessageSquare,
    href: "#ai-intelligence",
  },
  {
    label: "Urgency & Priority Scoring",
    desc: "Identify urgent complaints and assess priority",
    icon: AlertTriangle,
    href: "#ai-intelligence",
  },
  {
    label: "Duplicate & Related-Issue Detection",
    desc: "Find semantically similar complaints",
    icon: Copy,
    href: "#ai-intelligence",
  },
  {
    label: "Intelligent Routing",
    desc: "Recommend appropriate teams for complaint handling",
    icon: Route,
    href: "#how-it-works",
  },
  {
    label: "AI-Assisted Response Suggestions",
    desc: "Generate response drafts to support complaint resolution",
    icon: Lightbulb,
    href: "#ai-intelligence",
  },
];

const NAV_LINKS = [
  {
    label: "Platform",
    dropdown: {
      label: "Platform",
      items: PLATFORM_ITEMS,
    },
  },
  {
    label: "Solutions",
    dropdown: {
      label: "Solutions",
      items: SOLUTIONS_ITEMS,
    },
  },
  {
    label: "How It Works",
    href: "#how-it-works",
  },
  {
    label: "AI Intelligence",
    dropdown: {
      label: "AI Intelligence",
      items: AI_ITEMS,
    },
  },
  {
    label: "About",
    href: "/about",
  },
];

/* ------------------------------------------------------------------
   DROPDOWN COMPONENT
   ------------------------------------------------------------------ */

function NavDropdownPanel({
  dropdown,
  isOpen,
  onClose,
  onNavClick,
}: {
  dropdown: NavDropdown;
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (href: string) => void;
}) {
  if (!isOpen) return null;
  const isWide = dropdown.items.length > 4;

  return (
    <div
      className="landing-dropdown"
      onMouseLeave={onClose}
      role="menu"
      aria-label={`${dropdown.label} menu`}
    >
      <div className={`landing-dropdown__grid ${isWide ? "landing-dropdown__grid--2col" : ""}`}>
        {dropdown.items.map((item) => {
          const Icon = item.icon;
          const isRoute = item.href.startsWith("/");
          return isRoute ? (
            <Link
              key={item.label}
              href={item.href}
              className="landing-dropdown__item"
              role="menuitem"
              onClick={onClose}
            >
              <span className="landing-dropdown__icon">
                <Icon className="h-4 w-4" />
              </span>
              <span className="landing-dropdown__text">
                <span className="landing-dropdown__label">{item.label}</span>
                <span className="landing-dropdown__desc">{item.desc}</span>
              </span>
            </Link>
          ) : (
            <a
              key={item.label}
              href={item.href}
              className="landing-dropdown__item"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                onNavClick(item.href);
              }}
            >
              <span className="landing-dropdown__icon">
                <Icon className="h-4 w-4" />
              </span>
              <span className="landing-dropdown__text">
                <span className="landing-dropdown__label">{item.label}</span>
                <span className="landing-dropdown__desc">{item.desc}</span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   MAIN NAVBAR
   ------------------------------------------------------------------ */

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string[]>([]);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false);
    setOpenDropdown(null);
    if (href.startsWith("#")) {
      const el = document.getElementById(href.slice(1));
      if (el) {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      }
    }
  }, []);

  const handleDropdownEnter = useCallback((label: string) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpenDropdown(label);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    closeTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  }, []);

  const toggleMobileSection = useCallback((label: string) => {
    setMobileExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <div className="landing-nav__inner">
          {/* Brand */}
          <Link href="/" className="landing-nav__brand" aria-label="BCIP Helpdesk home">
            <HelpdeskLogo
              size="lg"
              theme="light"
              className="landing-nav__brand-logo"
            />
          </Link>

          {/* Desktop Links */}
          <div className="landing-nav__links">
            {NAV_LINKS.map((link) =>
              link.dropdown ? (
                <div
                  key={link.label}
                  className="landing-nav__dropdown-trigger"
                  onMouseEnter={() => handleDropdownEnter(link.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={`landing-nav__link landing-nav__link--dropdown ${openDropdown === link.label ? "landing-nav__link--active" : ""}`}
                    aria-expanded={openDropdown === link.label}
                    aria-haspopup="true"
                    onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                  >
                    {link.label}
                    <ChevronDown className={`landing-nav__chevron ${openDropdown === link.label ? "landing-nav__chevron--open" : ""}`} />
                  </button>
                  <NavDropdownPanel
                    dropdown={link.dropdown}
                    isOpen={openDropdown === link.label}
                    onClose={() => setOpenDropdown(null)}
                    onNavClick={handleNavClick}
                  />
                </div>
              ) : (
                link.href?.startsWith("/") ? (
                  <Link key={link.label} href={link.href} className="landing-nav__link">
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="landing-nav__link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href!);
                    }}
                  >
                    {link.label}
                  </a>
                )
              )
            )}
          </div>

          {/* Right Actions */}
          <div className="landing-nav__actions">
            <Link href="/login" className="landing-nav__sign-in">
              Sign In
            </Link>
            <Link href="/register" className="landing-nav__cta-btn">
              Get Started
              <ArrowRight className="landing-nav__cta-arrow" />
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="landing-nav__hamburger"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="landing-mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="landing-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="landing-mobile-menu__header">
              <span className="landing-mobile-menu__title">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="landing-mobile-menu__close"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="landing-mobile-menu__links">
              {NAV_LINKS.map((link) =>
                link.dropdown ? (
                  <div key={link.label} className="landing-mobile-accordion">
                    <button
                      className="landing-mobile-accordion__trigger"
                      onClick={() => toggleMobileSection(link.label)}
                      aria-expanded={mobileExpanded.includes(link.label)}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`landing-mobile-accordion__chevron ${mobileExpanded.includes(link.label) ? "landing-mobile-accordion__chevron--open" : ""}`}
                      />
                    </button>
                    {mobileExpanded.includes(link.label) && (
                      <div className="landing-mobile-accordion__panel">
                        {link.dropdown.items.map((item) => {
                          const Icon = item.icon;
                          return item.href.startsWith("/") ? (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="landing-mobile-accordion__item"
                              onClick={() => setMobileOpen(false)}
                            >
                              <Icon className="h-4 w-4 landing-mobile-accordion__icon" />
                              <span>{item.label}</span>
                            </Link>
                          ) : (
                            <a
                              key={item.label}
                              href={item.href}
                              className="landing-mobile-accordion__item"
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.href);
                              }}
                            >
                              <Icon className="h-4 w-4 landing-mobile-accordion__icon" />
                              <span>{item.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  link.href?.startsWith("/") ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="landing-mobile-accordion__trigger"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className="landing-mobile-accordion__trigger"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.href!);
                      }}
                    >
                      {link.label}
                    </a>
                  )
                )
              )}
            </div>

            <div className="landing-mobile-menu__actions">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="landing-mobile-menu__signin"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="landing-mobile-menu__cta"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
