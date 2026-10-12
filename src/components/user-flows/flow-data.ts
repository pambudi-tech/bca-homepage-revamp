export type FlowKind = 'normal' | 'negative' | 'alternative' | 'recovery' | 'edge';
export type FlowStatus = 'available' | 'demo' | 'gap' | 'external';
export type FlowBrand = 'prioritas' | 'solitaire';
export type FlowScenario = { id: string; kind: FlowKind; status: FlowStatus; brand: FlowBrand | 'both' };
export type FlowJourney = { id: string; area: 'public' | 'member' | 'both' | 'preview'; href: string; sources: string[]; scenarios: FlowScenario[] };
export const flowKinds: FlowKind[] = ['normal', 'negative', 'alternative', 'recovery', 'edge'];
export const flowStatuses: FlowStatus[] = ['available', 'demo', 'gap', 'external'];
export const flowJourneys: FlowJourney[] = [
  {
    "id": "navigation",
    "area": "public",
    "href": "/{brand}",
    "sources": [
      "src/components/home/Navbar.tsx",
      "src/components/home/MobileMenu.tsx",
      "src/components/ui/LocaleSwitcher.tsx",
      "src/components/prioritas/PrioritasIndexTabs.tsx",
      "src/components/prioritas/PublicPrivilegePage.tsx"
    ],
    "scenarios": [
      {
        "id": "menu",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "tabs",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "legacy",
        "kind": "recovery",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "language",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "closeMenu",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "search",
    "area": "public",
    "href": "/{brand}",
    "sources": [
      "src/components/home/SearchOverlay.tsx",
      "src/components/home/priosoli-search-data.ts",
      "src/components/home/search-data.ts"
    ],
    "scenarios": [
      {
        "id": "results",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "empty",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "blank",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "history",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "cancel",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "storage",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "directory",
    "area": "both",
    "href": "/{brand}/privilege",
    "sources": [
      "src/components/prioritas/PublicPrivilegeView.tsx",
      "src/components/prioritas/SignaturePrivilegeExperience.tsx",
      "src/components/prioritas/EventPrivilegeExperience.tsx",
      "src/components/prioritas/PrioritasDirectory.tsx"
    ],
    "scenarios": [
      {
        "id": "browse",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "combined",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "none",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "pagination",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "birthday",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "tabChange",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "detail",
    "area": "both",
    "href": "/{brand}/privilege",
    "sources": [
      "src/components/prioritas/PartnerPrivilegeDetailPage.tsx",
      "src/components/prioritas/PrioritasDetailExperience.tsx",
      "src/lib/privilege-paths.ts"
    ],
    "scenarios": [
      {
        "id": "read",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "signIn",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "restricted",
        "kind": "negative",
        "status": "available",
        "brand": "prioritas"
      },
      {
        "id": "solitaire",
        "kind": "normal",
        "status": "demo",
        "brand": "solitaire"
      },
      {
        "id": "missing",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "login",
    "area": "member",
    "href": "/member/login?from={brand}",
    "sources": [
      "src/components/member/MemberLoginExperience.tsx",
      "src/app/[locale]/member/login/actions.ts",
      "src/app/[locale]/member/login/page.tsx"
    ],
    "scenarios": [
      {
        "id": "valid",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "email",
        "kind": "alternative",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "invalidFormat",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "blankPassword",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "wrong",
        "kind": "negative",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "otherBrand",
        "kind": "alternative",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "unsafe",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "cancel",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "help",
        "kind": "alternative",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "requestFailed",
        "kind": "negative",
        "status": "gap",
        "brand": "both"
      }
    ]
  },
  {
    "id": "access",
    "area": "member",
    "href": "/{brand}/member/overview",
    "sources": [
      "src/proxy.ts",
      "src/lib/member-auth.ts",
      "src/app/[locale]/prioritas/member/[...slug]/page.tsx"
    ],
    "scenarios": [
      {
        "id": "active",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "missing",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "mismatch",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "unknown",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "openExpiry",
        "kind": "edge",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "cookieBlocked",
        "kind": "edge",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "otherTab",
        "kind": "edge",
        "status": "demo",
        "brand": "both"
      }
    ]
  },
  {
    "id": "portfolio",
    "area": "member",
    "href": "/{brand}/member/financial-report?report=portfolio",
    "sources": [
      "src/components/prioritas/FinancialReportExperience.tsx",
      "src/components/prioritas/FinancialReportOtpModal.tsx",
      "src/app/[locale]/prioritas/member/financial-report/actions.ts",
      "src/lib/member-auth.ts"
    ],
    "scenarios": [
      {
        "id": "verified",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "noSelection",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "partial",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "rejected",
        "kind": "negative",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "resend",
        "kind": "recovery",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "expiredCode",
        "kind": "edge",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "noPhone",
        "kind": "negative",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "cancel",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "hideAgain",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "expiry",
        "kind": "recovery",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "failure",
        "kind": "negative",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "reload",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "reportUnknown",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "vouchers",
    "area": "member",
    "href": "/{brand}/member/privilege/executive-airport-lounge",
    "sources": [
      "src/components/prioritas/MemberSignatureVoucherModule.tsx",
      "src/components/prioritas/MemberAirportTransferModule.tsx",
      "src/lib/member-signature-voucher.ts"
    ],
    "scenarios": [
      {
        "id": "available",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "unlimited",
        "kind": "alternative",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "penalty",
        "kind": "negative",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "exhausted",
        "kind": "negative",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "copy",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "used",
        "kind": "negative",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "copyDenied",
        "kind": "negative",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "expand",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "medical",
    "area": "member",
    "href": "/{brand}/member/privilege/medical-check-up-internasional",
    "sources": [
      "src/components/prioritas/MemberMedicalCheckUpModule.tsx",
      "src/components/prioritas/PartnerPrivilegeDetailPage.tsx"
    ],
    "scenarios": [
      {
        "id": "book",
        "kind": "normal",
        "status": "external",
        "brand": "solitaire"
      },
      {
        "id": "copy",
        "kind": "alternative",
        "status": "demo",
        "brand": "solitaire"
      },
      {
        "id": "partnerUnavailable",
        "kind": "negative",
        "status": "external",
        "brand": "solitaire"
      },
      {
        "id": "cancel",
        "kind": "alternative",
        "status": "external",
        "brand": "solitaire"
      }
    ]
  },
  {
    "id": "banking",
    "area": "both",
    "href": "/{brand}/banking-solution",
    "sources": [
      "src/components/prioritas/PublicBankingSolutionPage.tsx",
      "src/components/prioritas/BankingPrivilegeDetailPage.tsx",
      "src/components/prioritas/BankingSolutionIndexExperience.tsx",
      "src/components/prioritas/KursDetailExperience.tsx",
      "src/lib/kurs.ts",
      "src/lib/kurs-detail.ts",
      "src/components/prioritas/KursRefreshButton.tsx"
    ],
    "scenarios": [
      {
        "id": "benefit",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "wealth",
        "kind": "normal",
        "status": "external",
        "brand": "both"
      },
      {
        "id": "rates",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "rateFallback",
        "kind": "recovery",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "converter",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "invalidAmount",
        "kind": "negative",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "refresh",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "magazine",
    "area": "both",
    "href": "/{brand}/e-magazine",
    "sources": [
      "src/components/prioritas/MagazineIndexExperience.tsx",
      "src/components/prioritas/MagazineSection.tsx",
      "src/components/member/MemberLoginExperience.tsx"
    ],
    "scenarios": [
      {
        "id": "list",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "read",
        "kind": "normal",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "memberRead",
        "kind": "edge",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "invalidIssue",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "branches",
    "area": "public",
    "href": "/{brand}/temukan-kami",
    "sources": [
      "archive/lokasi-bca/LocationMapUnavailable.tsx",
      "archive/lokasi-bca/LocationFinder.tsx",
      "archive/lokasi-bca/LocationSection.tsx",
      "archive/lokasi-bca/locations.ts",
      "archive/lokasi-bca/LocationMap.tsx"
    ],
    "scenarios": [
      {
        "id": "default",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "gps",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "denied",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "unavailable",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "place",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "noPlace",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "nearbyFailure",
        "kind": "negative",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "directions",
        "kind": "normal",
        "status": "external",
        "brand": "both"
      },
      {
        "id": "mapFailed",
        "kind": "recovery",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "fastTyping",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "contact",
    "area": "public",
    "href": "/{brand}/hubungi-kami",
    "sources": [
      "src/components/prioritas/BrandInformationPage.tsx",
      "src/components/prioritas/BrandContactPage.tsx",
      "src/components/prioritas/BrandContactPage.tsx",
      "src/components/prioritas/InformationContactChannels.tsx",
      "src/components/prioritas/ExistingInformationContent.tsx"
    ],
    "scenarios": [
      {
        "id": "documents",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "channel",
        "kind": "normal",
        "status": "external",
        "brand": "both"
      },
      {
        "id": "branch",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "messageForm",
        "kind": "edge",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "cancelDisclosure",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      }
    ]
  },
  {
    "id": "logout",
    "area": "member",
    "href": "/{brand}/member/overview",
    "sources": [
      "src/components/home/Navbar.tsx",
      "src/components/home/MobileMenu.tsx",
      "src/components/home/LogoutConfirmDialog.tsx",
      "src/app/[locale]/member/login/actions.ts"
    ],
    "scenarios": [
      {
        "id": "confirm",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "cancel",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "segment",
        "kind": "alternative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "back",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "failure",
        "kind": "negative",
        "status": "gap",
        "brand": "both"
      }
    ]
  },
  {
    "id": "resilience",
    "area": "both",
    "href": "/{brand}/member/financial-report",
    "sources": [
      "src/components/prioritas/FinancialReportExperience.tsx",
      "src/lib/promos.ts",
      "src/lib/news.ts",
      "src/lib/kurs.ts"
    ],
    "scenarios": [
      {
        "id": "period",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "download",
        "kind": "normal",
        "status": "demo",
        "brand": "both"
      },
      {
        "id": "fallback",
        "kind": "recovery",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "offline",
        "kind": "negative",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "pending",
        "kind": "edge",
        "status": "gap",
        "brand": "both"
      },
      {
        "id": "externalFailure",
        "kind": "negative",
        "status": "external",
        "brand": "both"
      }
    ]
  },
  {
    "id": "preview",
    "area": "preview",
    "href": "/login",
    "sources": [
      "src/app/[locale]/login/LoginPageView.tsx",
      "src/proxy.ts",
      "src/app/[locale]/login/actions.ts",
      "src/app/[locale]/login/LoginForm.tsx",
      "src/components/PreviewIdleLogout.tsx"
    ],
    "scenarios": [
      {
        "id": "disabled",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "correct",
        "kind": "normal",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "wrong",
        "kind": "negative",
        "status": "available",
        "brand": "both"
      },
      {
        "id": "idle",
        "kind": "edge",
        "status": "available",
        "brand": "both"
      }
    ]
  }
];

export function scenarioHash(journey: FlowJourney, scenario: FlowScenario, brand: FlowBrand | 'all', stage = 2): string {
  return `${brand}/${journey.id}/${scenario.id}/${stage}`;
}

export function parseScenarioHash(hash: string): { brand: FlowBrand | 'all'; journey: FlowJourney; scenario: FlowScenario; stage: 0 | 1 | 2 | 3 } | null {
  const [brand, journeyId, scenarioId, stageId] = hash.replace(/^#/, '').split('/');
  if (brand !== 'all' && brand !== 'prioritas' && brand !== 'solitaire') return null;
  const journey = flowJourneys.find(item => item.id === journeyId);
  const scenario = journey?.scenarios.find(item => item.id === scenarioId && (brand === 'all' || item.brand === 'both' || item.brand === brand));
  const stage = stageId === undefined ? 2 : Number(stageId);
  if (![0, 1, 2, 3].includes(stage)) return null;
  return journey && scenario ? { brand, journey, scenario, stage: (stage === 3 ? 2 : stage) as 0 | 1 | 2 | 3 } : null;
}
