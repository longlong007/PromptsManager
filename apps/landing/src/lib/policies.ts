export type PolicySection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type Policy = {
  slug: string
  title: string
  lastUpdated: string
  intro: string
  sections: PolicySection[]
}

export const POLICIES: Policy[] = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    lastUpdated: 'June 17, 2026',
    intro:
      'PromptRepo ("we", "us", or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you use our website, desktop application, and related services.',
    sections: [
      {
        heading: 'Information We Collect',
        paragraphs: ['We collect information in the following categories:'],
        bullets: [
          'Account information such as email address and display name when you create an account.',
          'Usage data such as feature interactions, crash reports, and anonymized analytics to improve the product.',
          'Payment information processed by our payment provider; we do not store full card details on our servers.',
          'Prompt content stored locally on your device by default; cloud sync features only upload data when you explicitly enable them.',
        ],
      },
      {
        heading: 'How We Use Information',
        paragraphs: ['We use collected information to:'],
        bullets: [
          'Provide, maintain, and improve PromptRepo services.',
          'Process purchases, subscriptions, and license activations.',
          'Send service-related communications such as receipts and security notices.',
          'Detect abuse, fraud, and security incidents.',
        ],
      },
      {
        heading: 'Local-First Data',
        paragraphs: [
          'PromptRepo is designed to be local-first. Unless you enable cloud sync or AI features that require remote processing, your prompt content remains on your device. When cloud features are enabled, data is encrypted in transit and stored according to the settings you choose.',
        ],
      },
      {
        heading: 'Sharing of Information',
        paragraphs: [
          'We do not sell your personal information. We may share data with trusted service providers (hosting, analytics, payment processing) under contractual obligations, or when required by law.',
        ],
      },
      {
        heading: 'Your Rights',
        paragraphs: [
          'Depending on your location, you may have rights to access, correct, delete, or export your personal data. Contact us at privacy@promptrepo.com to submit a request.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['For privacy-related questions, email privacy@promptrepo.com.'],
      },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    lastUpdated: 'June 17, 2026',
    intro:
      'This Cookie Policy explains how PromptRepo uses cookies and similar technologies on our website and web-based services.',
    sections: [
      {
        heading: 'What Are Cookies',
        paragraphs: [
          'Cookies are small text files stored on your device when you visit a website. They help websites remember preferences, keep you signed in, and understand how the site is used.',
        ],
      },
      {
        heading: 'Cookies We Use',
        paragraphs: ['We use the following types of cookies:'],
        bullets: [
          'Essential cookies required for authentication, security, and basic site functionality.',
          'Preference cookies that remember settings such as language or theme.',
          'Analytics cookies that help us understand traffic patterns and improve the product.',
          'Marketing cookies, only if you opt in, to measure campaign effectiveness.',
        ],
      },
      {
        heading: 'Managing Cookies',
        paragraphs: [
          'You can control cookies through your browser settings. Disabling essential cookies may limit your ability to use certain features. Where required by law, we display a consent banner before setting non-essential cookies.',
        ],
      },
      {
        heading: 'Third-Party Cookies',
        paragraphs: [
          'Some embedded services (such as payment checkout or analytics providers) may set their own cookies. Their use is governed by the respective third-party policies.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: ['Questions about cookies? Email privacy@promptrepo.com.'],
      },
    ],
  },
  {
    slug: 'software-policy',
    title: 'Software Policy',
    lastUpdated: 'June 17, 2026',
    intro:
      'This Software Policy describes the terms under which PromptRepo software is licensed, updated, and supported.',
    sections: [
      {
        heading: 'License Grant',
        paragraphs: [
          'Subject to payment of applicable fees and compliance with these policies, we grant you a limited, non-exclusive, non-transferable license to install and use PromptRepo for your personal or internal business purposes.',
        ],
      },
      {
        heading: 'Permitted Use',
        paragraphs: ['You may:'],
        bullets: [
          'Install PromptRepo on devices you own or control.',
          'Use the software to organize, edit, and manage your prompts.',
          'Export your data in supported formats at any time.',
        ],
      },
      {
        heading: 'Restrictions',
        paragraphs: ['You may not:'],
        bullets: [
          'Reverse engineer, decompile, or attempt to extract source code except where permitted by law.',
          'Redistribute, sublicense, or resell the software without written permission.',
          'Use the software to develop a competing product or to circumvent license limits.',
          'Remove or alter proprietary notices or security features.',
        ],
      },
      {
        heading: 'Updates and Support',
        paragraphs: [
          'We may release updates, patches, and new versions at our discretion. Personal Pro licenses include updates for the major version purchased. AI Pro subscriptions include updates for the duration of an active subscription. Support is provided via documentation and email on a best-effort basis.',
        ],
      },
      {
        heading: 'Open Source Components',
        paragraphs: [
          'PromptRepo may include third-party open source software. Applicable license notices are available in the product or upon request.',
        ],
      },
    ],
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    lastUpdated: 'June 17, 2026',
    intro:
      'These Terms of Service ("Terms") govern your access to and use of PromptRepo websites, applications, and services. By using PromptRepo, you agree to these Terms.',
    sections: [
      {
        heading: 'Eligibility',
        paragraphs: [
          'You must be at least 16 years old (or the age of digital consent in your jurisdiction) to use PromptRepo. If you use the service on behalf of an organization, you represent that you have authority to bind that organization.',
        ],
      },
      {
        heading: 'Accounts',
        paragraphs: [
          'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorized use.',
        ],
      },
      {
        heading: 'Acceptable Use',
        paragraphs: ['You agree not to:'],
        bullets: [
          'Use the service for unlawful, harmful, or abusive purposes.',
          'Upload or distribute malware or content that infringes third-party rights.',
          'Attempt to gain unauthorized access to our systems or other users\' data.',
          'Interfere with the integrity or performance of the service.',
        ],
      },
      {
        heading: 'Intellectual Property',
        paragraphs: [
          'PromptRepo and its branding, software, and documentation are owned by us or our licensors. You retain ownership of the prompt content you create. You grant us a limited license to process your content only as needed to provide the services you enable.',
        ],
      },
      {
        heading: 'Disclaimer',
        paragraphs: [
          'The service is provided "as is" without warranties of any kind, to the maximum extent permitted by law. We do not guarantee uninterrupted or error-free operation.',
        ],
      },
      {
        heading: 'Limitation of Liability',
        paragraphs: [
          'To the extent permitted by law, our total liability for any claim arising from the service is limited to the amount you paid us in the twelve months before the claim, or USD $100, whichever is greater.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: [
          'We may update these Terms from time to time. Material changes will be posted on this page with an updated date. Continued use after changes constitutes acceptance.',
        ],
      },
    ],
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    lastUpdated: 'June 17, 2026',
    intro:
      'We want you to be satisfied with PromptRepo. This Refund Policy explains when refunds are available for purchases made through our official channels.',
    sections: [
      {
        heading: 'Personal Pro (One-Time Purchase)',
        paragraphs: [
          'If you purchased Personal Pro and are not satisfied, you may request a full refund within 14 days of purchase, provided you have not extensively used paid-only features beyond reasonable evaluation. Refund requests after 14 days are reviewed on a case-by-case basis for technical issues we cannot resolve.',
        ],
      },
      {
        heading: 'AI Pro (Subscription)',
        paragraphs: [
          'Monthly subscriptions may be canceled at any time; cancellation stops future billing. We do not provide partial refunds for unused time in the current billing period unless required by law. Annual plans may be eligible for a prorated refund within 14 days of initial purchase.',
        ],
      },
      {
        heading: 'How to Request a Refund',
        paragraphs: [
          'Email support@promptrepo.com with your order email, purchase date, and reason for the request. Approved refunds are processed to the original payment method within 5–10 business days.',
        ],
      },
      {
        heading: 'Non-Refundable Cases',
        paragraphs: ['Refunds are generally not available for:'],
        bullets: [
          'Purchases made through unauthorized resellers.',
          'Accounts terminated for violation of our Terms of Service.',
          'Promotional or heavily discounted bundles where stated as non-refundable.',
        ],
      },
    ],
  },
  {
    slug: 'billing-policy',
    title: 'Billing Policy',
    lastUpdated: 'June 17, 2026',
    intro:
      'This Billing Policy describes how PromptRepo charges for paid plans, processes payments, and handles renewals.',
    sections: [
      {
        heading: 'Pricing',
        paragraphs: [
          'Current pricing is displayed on our website at the time of purchase. Prices may change for new purchases; existing Personal Pro licenses are not affected by price changes. Subscription prices may change with advance notice before renewal.',
        ],
      },
      {
        heading: 'Payment Methods',
        paragraphs: [
          'We accept major credit and debit cards and other payment methods shown at checkout. Payments are processed by our payment provider; by completing a purchase, you authorize us to charge the selected payment method.',
        ],
      },
      {
        heading: 'Subscriptions and Renewals',
        paragraphs: [
          'AI Pro and other subscription plans renew automatically at the end of each billing cycle unless canceled before the renewal date. You can manage or cancel subscriptions from your account settings or by contacting support.',
        ],
      },
      {
        heading: 'Taxes',
        paragraphs: [
          'Prices may exclude applicable taxes. Where required, sales tax, VAT, or GST will be calculated and displayed at checkout based on your billing address.',
        ],
      },
      {
        heading: 'Failed Payments',
        paragraphs: [
          'If a renewal payment fails, we may retry the charge and notify you by email. Continued failure may result in downgrade or suspension of paid features until payment is resolved.',
        ],
      },
      {
        heading: 'Invoices and Receipts',
        paragraphs: [
          'Receipts are emailed after successful payment. Business customers may request invoices by contacting billing@promptrepo.com.',
        ],
      },
    ],
  },
  {
    slug: 'affiliate-policy-program',
    title: 'Affiliate Policy Program',
    lastUpdated: 'June 17, 2026',
    intro:
      'The PromptRepo Affiliate Program allows approved partners to earn commissions by referring new customers. This policy outlines eligibility, commission rules, and program terms.',
    sections: [
      {
        heading: 'Eligibility',
        paragraphs: [
          'To join, you must apply through our affiliate portal and be approved. We may reject applications from sites promoting illegal content, misleading claims, coupon abuse, or brands that conflict with PromptRepo values.',
        ],
      },
      {
        heading: 'Commission Structure',
        paragraphs: [
          'Approved affiliates earn a percentage of qualifying net revenue from referred customers who complete a first purchase using the affiliate tracking link or code. Current commission rates and cookie duration are shown in the affiliate dashboard and may change with notice.',
        ],
      },
      {
        heading: 'Qualified Referrals',
        paragraphs: ['A referral qualifies when:'],
        bullets: [
          'The customer clicks your unique affiliate link and purchases within the attribution window.',
          'The purchase is not refunded or charged back within the validation period.',
          'The customer is not an existing paid user or self-referral.',
        ],
      },
      {
        heading: 'Payouts',
        paragraphs: [
          'Commissions are validated after the refund period (typically 30 days) and paid monthly once your balance reaches the minimum payout threshold. Payout methods include PayPal and bank transfer where supported.',
        ],
      },
      {
        heading: 'Promotion Guidelines',
        paragraphs: ['Affiliates must:'],
        bullets: [
          'Disclose affiliate relationships in accordance with applicable advertising laws.',
          'Use accurate descriptions of PromptRepo features and pricing.',
          'Not bid on our trademarks in paid search without written approval.',
          'Not use spam, fake reviews, or misleading discount codes.',
        ],
      },
      {
        heading: 'Termination',
        paragraphs: [
          'Either party may terminate participation at any time. We may withhold or reverse commissions for fraudulent traffic, policy violations, or chargebacks. Upon termination, unpaid validated commissions will be paid according to the standard schedule.',
        ],
      },
      {
        heading: 'Apply',
        paragraphs: [
          'Interested in joining? Email affiliates@promptrepo.com with your website, audience, and promotion plan.',
        ],
      },
    ],
  },
]

export const POLICY_BY_SLUG = Object.fromEntries(POLICIES.map((policy) => [policy.slug, policy])) as Record<
  string,
  Policy
>
