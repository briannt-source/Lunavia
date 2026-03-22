'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

/* ─────────────────── Icon components ─────────────────── */
const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
const ChevronDown = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
const ChevronUp = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
);
const BookOpen = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
);

/* ─────────────────── Category types ─────────────────── */
type Category = 'getting-started' | 'operator' | 'guide' | 'admin' | 'wallet' | 'trust-safety' | 'faq';

interface Article {
    id: string;
    title: string;
    content: string[];
    tags?: string[];
}

interface CategoryInfo {
    key: Category;
    label: string;
    emoji: string;
    description: string;
    color: string;
    articles: Article[];
}

/* ─────────────────── Article data ─────────────────── */
const CATEGORIES: CategoryInfo[] = [
    {
        key: 'getting-started',
        label: 'Getting Started',
        emoji: '🚀',
        description: 'Registration, setup, and first steps on Lunavia',
        color: 'blue',
        articles: [
            {
                id: 'gs-1',
                title: 'What is Lunavia?',
                content: [
                    'Lunavia is a B2B tour operations platform by Sea You Travel that connects Tour Operators with Freelance Tour Guides. Think of it as the professional infrastructure layer for the tourism industry — providing tools for workforce management, escrow-based payments, compliance tracking, and real-time tour operations.',
                    'Unlike consumer-facing booking sites, Lunavia focuses on the professional relationships between operators and guides, ensuring transparency, safety, and fair compensation on every tour.',
                ],
                tags: ['overview', 'platform'],
            },
            {
                id: 'gs-2',
                title: 'How to create your account',
                content: [
                    'Visit the Lunavia registration page and select your role: Tour Operator or Tour Guide. Fill in your basic information including full name, email, and a secure password.',
                    'After registration, you will be directed to your dashboard. To unlock all platform features, you will need to complete identity verification (KYC for individuals, KYB for companies). This process typically takes 24–48 hours for review.',
                    'Important: Use a business email for professional credibility. Your email is used for all platform communications and cannot be changed later without contacting support.',
                ],
                tags: ['registration', 'account'],
            },
            {
                id: 'gs-3',
                title: 'Understanding identity verification (KYC / KYB)',
                content: [
                    'KYC (Know Your Customer) applies to individual guides and sole operators. You will need to upload a government-issued ID (passport, national ID, or driver\'s license) and a selfie for identity matching.',
                    'KYB (Know Your Business) applies to companies and licensed operators. You will need to submit business registration documents, a tax identification number, and proof of tourism license if applicable.',
                    'Verification is reviewed by our admin team. Once approved, a verified badge appears on your profile and you gain access to all platform features including wallet operations and tour creation.',
                ],
                tags: ['verification', 'kyc', 'kyb', 'identity'],
            },
            {
                id: 'gs-4',
                title: 'Setting up your profile',
                content: [
                    'A complete profile is essential for building trust on Lunavia. Navigate to Dashboard → Profile to fill in your professional details.',
                    'For Operators: Add your company name, business description, operating regions, and a professional avatar. A complete profile increases guide interest in your tour listings.',
                    'For Guides: Add your languages, skills, certifications, experience years, and areas of expertise. Guides with complete profiles receive up to 3x more tour invitations.',
                    'Pro tip: Upload any relevant certifications (first aid, tour guide license, language proficiency) to boost your Trust Score.',
                ],
                tags: ['profile', 'setup'],
            },
            {
                id: 'gs-5',
                title: 'Platform roles explained',
                content: [
                    'Tour Operator — Creates and manages tours, hires guides, handles payments. This includes licensed operators, travel agencies, and sole operators.',
                    'Tour Guide — Freelance professionals who apply to or are invited to lead tours. Guides set their availability, build their portfolio, and earn through verified tour completions.',
                    'Admin — Platform administrators who manage users, review verifications, handle disputes, and oversee platform governance. Admin access is granted by the platform owner.',
                ],
                tags: ['roles', 'operator', 'guide', 'admin'],
            },
            {
                id: 'gs-6',
                title: 'Navigating the dashboard',
                content: [
                    'After logging in, you land on your role-specific dashboard. The left sidebar contains navigation for all major features.',
                    'The dashboard home shows key metrics: upcoming tours, pending actions, wallet balance, and recent notifications.',
                    'Use the top-right notification bell to see real-time updates on applications, assignments, payments, and verifications.',
                    'All dashboard pages are responsive and work on mobile devices, though we recommend using a desktop for complex tour management tasks.',
                ],
                tags: ['dashboard', 'navigation'],
            },
        ],
    },
    {
        key: 'operator',
        label: 'Operator Manual',
        emoji: '🏢',
        description: 'Tour creation, guide hiring, team management',
        color: 'indigo',
        articles: [
            {
                id: 'op-1',
                title: 'Creating a new tour',
                content: [
                    'Navigate to Dashboard → Tours → New Tour. Fill in the tour details: title, description, dates, locations, group size, and required guide skills.',
                    'Set the guide compensation amount. This is the total fee the guide will receive for the tour. Lunavia adds a platform commission on top (see your plan for commission rates).',
                    'Once created, the tour can be published to the marketplace where verified guides can apply, or you can directly invite specific guides from your team or the marketplace.',
                    'Tours go through a lifecycle: Draft → Published → Assigned → In Progress → Completed → Settled. Each state has specific rules and actions available.',
                ],
                tags: ['tour', 'create', 'publish'],
            },
            {
                id: 'op-2',
                title: 'Hiring and managing guides',
                content: [
                    'There are three ways to assign a guide to your tour:',
                    '1. Marketplace applications — Publish your tour and review applications from freelance guides. You can see their Trust Score, experience, languages, and past tour ratings.',
                    '2. Direct assignment — Assign a guide from your company team directly. This is instant and does not require the application process.',
                    '3. Tour invitations — Invite specific marketplace guides to apply for your tour. They receive a notification and can accept or decline.',
                    'When reviewing applications, use the AI Matching feature to get algorithmic recommendations based on guide skills, availability, and compatibility with your tour requirements.',
                ],
                tags: ['guide', 'hire', 'application', 'matching'],
            },
            {
                id: 'op-3',
                title: 'Company and team management',
                content: [
                    'If you operate as a company, you can create a Company from Dashboard → Company → Create Company. Add your business details and invite guides to join your team.',
                    'Team guides can be assigned to tours directly without the marketplace application process. They work under your company contracts.',
                    'You can manage your fleet, track guide performance, and handle contracts all from the company management section.',
                    'Each company is a separate entity — guides can be part of one company but can also take freelance marketplace tours independently.',
                ],
                tags: ['company', 'team', 'management'],
            },
            {
                id: 'op-4',
                title: 'Contracts and agreements',
                content: [
                    'Every tour assignment creates a contract between the operator and guide. Contracts specify: tour details, compensation, terms, and cancellation policies.',
                    'Guides must accept the contract before the tour starts. Acceptance is recorded on-platform for legal transparency.',
                    'Contracts protect both parties — the operator is guaranteed the guide will show up (backed by Trust Score consequences), and the guide is guaranteed payment (backed by escrow).',
                    'Standard contracts are auto-generated. For enterprise operators, custom contract templates can be configured.',
                ],
                tags: ['contract', 'agreement', 'terms'],
            },
            {
                id: 'op-5',
                title: 'Making payments for tours',
                content: [
                    'Lunavia uses an escrow-based payment model. When a tour is confirmed, the operator funds the escrow from their wallet balance.',
                    'Funds are held securely in escrow during the tour. Upon successful completion and tour report confirmation, funds are released to the guide\'s wallet.',
                    'If a dispute arises, funds remain in escrow until resolution. The platform never holds funds beyond the dispute resolution period.',
                    'Payment timeline: Tour Confirmed → Escrow Funded → Tour Completed → Report Submitted → Payment Released (typically within 48 hours of completion).',
                ],
                tags: ['payment', 'escrow', 'wallet'],
            },
            {
                id: 'op-6',
                title: 'Tour reports and completion',
                content: [
                    'After a tour ends, the guide submits a Tour Report with details about the execution. As the operator, you review and confirm the report.',
                    'Confirming the report triggers the payment release process. If there are discrepancies, you can raise a dispute before confirming.',
                    'Tour reports include: execution summary, any incidents, guest feedback notes, and financial summary. These records are permanent and contribute to both parties\' Trust Scores.',
                ],
                tags: ['report', 'completion', 'settlement'],
            },
            {
                id: 'op-7',
                title: 'Live tour monitoring',
                content: [
                    'For active tours, use the Live Tour page to monitor your guide in real-time. See the tour status, safety check-ins, and any emergencies as they happen.',
                    'The Command Center (Dashboard → Command Center) gives you a bird\'s-eye view of all your active tours simultaneously.',
                    'Emergency notifications are instant — if a guide triggers SOS, you receive an immediate alert with their last known location and can coordinate response.',
                ],
                tags: ['live', 'monitoring', 'safety'],
            },
            {
                id: 'op-8',
                title: 'Standby requests',
                content: [
                    'Standby requests allow you to pre-arrange backup guides for important tours. Create a standby request specifying the tour and compensation.',
                    'Standby guides are notified and can accept or reject. If the primary guide cannot perform, the standby guide steps in automatically.',
                    'This feature is especially valuable for high-value tours where cancellation risk management is critical.',
                ],
                tags: ['standby', 'backup', 'risk'],
            },
        ],
    },
    {
        key: 'guide',
        label: 'Guide Manual',
        emoji: '🧭',
        description: 'Finding tours, applications, executing tours, getting paid',
        color: 'emerald',
        articles: [
            {
                id: 'gd-1',
                title: 'Finding and applying to tours',
                content: [
                    'Browse available tours from Dashboard → Available Tours. Use filters to narrow by date, location, language, and compensation range.',
                    'To apply, click on a tour and submit your application with a short message explaining your qualifications and interest.',
                    'Operators review applications and may accept, reject, or shortlist you. You will receive a notification for each status change.',
                    'Pro tip: Complete your profile and maintain a high Trust Score to appear at the top of operator search results.',
                ],
                tags: ['apply', 'tours', 'marketplace'],
            },
            {
                id: 'gd-2',
                title: 'Accepting assignments and contracts',
                content: [
                    'When an operator accepts your application or assigns you directly, you receive an assignment notification.',
                    'Review the tour details and contract terms carefully. Accept the assignment to confirm your commitment.',
                    'Once accepted, the tour appears in your calendar. You are now bound by the contract terms — failing to show up affects your Trust Score significantly.',
                    'If you need to cancel after accepting, do so as early as possible. Late cancellations carry heavier Trust Score penalties.',
                ],
                tags: ['assignment', 'contract', 'accept'],
            },
            {
                id: 'gd-3',
                title: 'Executing a tour',
                content: [
                    'On the tour date, navigate to Dashboard → Tours → [Your Tour] → Live. This opens the tour execution interface.',
                    'During the tour, you can perform safety check-ins, log guest attendance, record incidents, and communicate with the operator.',
                    'Safety check-ins are periodic confirmations that everything is running smoothly. They contribute positively to your Trust Score.',
                    'If an emergency occurs, use the SOS button to immediately alert the operator and platform safety team.',
                ],
                tags: ['execute', 'live', 'safety', 'checkin'],
            },
            {
                id: 'gd-4',
                title: 'Submitting tour reports',
                content: [
                    'After the tour ends, submit a Tour Report from the tour detail page. Include a summary of the execution, any notable events, and guest count confirmation.',
                    'Tour reports trigger the payment process. The operator reviews and confirms your report, which releases the escrow funds to your wallet.',
                    'Be honest and detailed in your reports — they become part of your permanent professional record and influence your ongoing Trust Score.',
                ],
                tags: ['report', 'post-tour', 'documentation'],
            },
            {
                id: 'gd-5',
                title: 'Managing your availability',
                content: [
                    'Set your availability from Dashboard → Availability. Mark dates as available, busy, or blocked.',
                    'Operators can see your availability when searching for guides. Keeping your calendar updated increases your chances of being selected.',
                    'The Calendar view (Dashboard → Calendar) shows all your confirmed tours, pending applications, and availability in one place.',
                ],
                tags: ['availability', 'calendar', 'schedule'],
            },
            {
                id: 'gd-6',
                title: 'Building your portfolio',
                content: [
                    'Your Portfolio (Dashboard → Portfolio) is your professional showcase. It displays your completed tours, ratings, specialties, and trust metrics.',
                    'A strong portfolio is visible to operators and can be shared publicly. It acts as your living professional resume within the tourism industry.',
                    'Add your languages, certifications, experience timeline, and a compelling about section to stand out from other guides.',
                ],
                tags: ['portfolio', 'profile', 'reputation'],
            },
            {
                id: 'gd-7',
                title: 'Earning and getting paid',
                content: [
                    'Your earnings are managed through the Wallet (Dashboard → Wallet). All tour payments are deposited here after operator confirmation.',
                    'To withdraw funds, submit a Withdrawal Request with your bank details. Admin reviews and processes withdrawals, typically within 1–3 business days.',
                    'You can view your complete transaction history, total earned, and pending payments in the Wallet section.',
                    'The Earnings page (Dashboard → Earnings) shows detailed analytics: monthly trends, per-tour breakdown, and projected income.',
                ],
                tags: ['earnings', 'wallet', 'payment', 'withdrawal'],
            },
            {
                id: 'gd-8',
                title: 'Responding to invitations',
                content: [
                    'Operators can invite you directly to apply for their tours. Invitations appear in Dashboard → Invites.',
                    'Review the tour details and respond promptly — delayed responses may cause operators to look for other guides.',
                    'Accepting an invitation submits your application automatically. The operator still confirms the final assignment.',
                ],
                tags: ['invitation', 'respond'],
            },
        ],
    },
    {
        key: 'admin',
        label: 'Admin Guide',
        emoji: '🛡️',
        description: 'User management, verifications, disputes, finance',
        color: 'violet',
        articles: [
            {
                id: 'ad-1',
                title: 'Admin dashboard overview',
                content: [
                    'The Admin Dashboard provides a comprehensive view of platform operations. Key metrics include: total users, active tours, pending verifications, open disputes, and financial summary.',
                    'The sidebar navigation gives you access to all administrative functions organized by category: Users, Tours, Finance, Governance, Verification, and Settings.',
                    'Use the quick-action buttons on the dashboard home to jump to the most common tasks: reviewing pending verifications, processing withdrawals, and managing active disputes.',
                ],
                tags: ['dashboard', 'overview'],
            },
            {
                id: 'ad-2',
                title: 'Managing users',
                content: [
                    'Navigate to Admin → Users to see all registered users. Filter by role (Operator, Guide, Admin), verification status, and account status.',
                    'Click on a user to view their full profile, tour history, wallet balance, trust score, and verification documents.',
                    'You can: block users (suspends all activity), reset passwords, edit profiles, manage admin permissions, and delete accounts.',
                    'When blocking a user, all their active tours are flagged for attention. Active escrow funds are protected and handled according to dispute resolution procedures.',
                ],
                tags: ['users', 'management', 'block', 'permissions'],
            },
            {
                id: 'ad-3',
                title: 'Reviewing KYC/KYB verifications',
                content: [
                    'Navigate to Admin → Verifications to see pending submissions. Each submission includes uploaded documents and applicant information.',
                    'Review the submitted documents carefully: check that IDs match the registered name, business licenses are current, and all required fields are filled.',
                    'You can Approve or Reject each verification. When rejecting, provide a clear reason so the user can re-submit with corrections.',
                    'Internal notes allow you to document your review reasoning. These notes are visible only to other admins, not to the user.',
                    'Approved verifications immediately update the user\'s status and unlock all platform features.',
                ],
                tags: ['verification', 'kyc', 'kyb', 'review'],
            },
            {
                id: 'ad-4',
                title: 'Processing wallet operations',
                content: [
                    'Top-up requests: Admin → Finance → Top-ups. Users request to add funds; admins verify payment proof and approve or reject.',
                    'Withdrawal requests: Admin → Finance → Withdrawals. Users request to withdraw funds to their bank; admins verify details and process.',
                    'Balance adjustments: Admin → Finance → Transfers. Manually adjust a user\'s wallet balance for refunds, corrections, or special circumstances.',
                    'All financial operations are logged in the audit trail. Every approval/rejection requires the admin to be logged in and is tracked with timestamps.',
                ],
                tags: ['wallet', 'topup', 'withdrawal', 'finance'],
            },
            {
                id: 'ad-5',
                title: 'Handling disputes',
                content: [
                    'Navigate to Admin → Disputes to see open disputes between operators and guides.',
                    'Dispute workflow: Opened → Evidence Collection → Admin Review → Resolution. Each step is tracked and time-stamped.',
                    'When resolving a dispute, you can: release escrow to the guide, refund to the operator, split the amount, or escalate to senior management.',
                    'Both parties can submit evidence (photos, messages, documents). Review all evidence before making a decision.',
                    'Dispute decisions are final and affect both parties\' Trust Scores. Document your reasoning in internal notes for future reference.',
                ],
                tags: ['disputes', 'resolution', 'evidence', 'escrow'],
            },
            {
                id: 'ad-6',
                title: 'Tour moderation',
                content: [
                    'Navigate to Admin → Tours to see all tours on the platform. Filter by status, date, and operator.',
                    'You can moderate tours: approve, suspend, or delete tours that violate platform guidelines.',
                    'For active tours, the admin panel shows real-time status including safety check-ins and any incidents reported.',
                    'Admin tour view includes all details not visible to the public: operator-guide communications, financial terms, and internal notes.',
                ],
                tags: ['tours', 'moderation', 'review'],
            },
            {
                id: 'ad-7',
                title: 'Managing admin staff',
                content: [
                    'Navigate to Admin → Staff to manage other administrators.',
                    'Create new admin accounts with specific permission levels. Not all admins need access to every feature.',
                    'Permission categories: User Management, Financial Operations, Tour Moderation, Verification Review, System Settings, and Full Access.',
                    'Audit logs track all admin actions. This ensures accountability and helps investigate any issues with admin operations.',
                ],
                tags: ['staff', 'permissions', 'admin', 'audit'],
            },
            {
                id: 'ad-8',
                title: 'Platform settings and bank accounts',
                content: [
                    'Navigate to Admin → Settings to manage platform-wide configuration.',
                    'Payment Settings: Configure the platform\'s bank accounts where users send top-up payments. Add multiple bank accounts for different regions.',
                    'Platform fee configuration: Set commission rates for different plan tiers and transaction types.',
                    'System health: Monitor API performance, database status, and cron job execution from the Maintenance page.',
                ],
                tags: ['settings', 'bank', 'configuration'],
            },
        ],
    },
    {
        key: 'wallet',
        label: 'Wallet & Payments',
        emoji: '💳',
        description: 'Top-ups, withdrawals, escrow, and transactions',
        color: 'amber',
        articles: [
            {
                id: 'wl-1',
                title: 'How the wallet works',
                content: [
                    'Every Lunavia user has a digital wallet that holds their platform balance. The wallet is used for all financial transactions on the platform.',
                    'Operators use the wallet to fund tour escrows. Guides receive tour payments into their wallet. Both roles can top up or withdraw funds.',
                    'The wallet balance is displayed on your dashboard and in the Wallet section. All transactions are logged with timestamps and references.',
                ],
                tags: ['wallet', 'balance', 'overview'],
            },
            {
                id: 'wl-2',
                title: 'Topping up your wallet',
                content: [
                    'Navigate to Dashboard → Wallet → Top Up. Enter the amount and choose your payment method.',
                    'Currently supported: Bank transfer. Transfer the exact amount to the platform bank account shown, using the reference code provided.',
                    'After transferring, submit a top-up request with the transfer proof (screenshot or reference number). Admin reviews and credits your wallet, typically within a few hours.',
                ],
                tags: ['topup', 'deposit', 'bank'],
            },
            {
                id: 'wl-3',
                title: 'Withdrawing funds',
                content: [
                    'Navigate to Dashboard → Wallet → Withdraw. Enter the amount and confirm your registered bank account details.',
                    'Withdrawal requests are reviewed by admin. Once approved, funds are transferred to your bank account within 1–3 business days.',
                    'Minimum withdrawal amount and any applicable fees are displayed on the withdrawal form. Keep your bank details up to date to avoid delays.',
                ],
                tags: ['withdrawal', 'bank', 'cashout'],
            },
            {
                id: 'wl-4',
                title: 'Understanding escrow',
                content: [
                    'Escrow protects both operators and guides. When a tour is confirmed, the operator\'s payment is held in escrow — not transferred immediately to the guide.',
                    'Escrow lifecycle: Created → Funded → Locked (during tour) → Released (to guide) or Refunded (to operator if cancelled).',
                    'Funds in escrow are visible in both parties\' dashboards. Neither party can access escrowed funds until the resolution criteria are met.',
                    'In case of dispute, escrow funds remain locked until an admin resolves the dispute and determines the fair distribution.',
                ],
                tags: ['escrow', 'protection', 'security'],
            },
            {
                id: 'wl-5',
                title: 'Transaction history',
                content: [
                    'View your full transaction history at Dashboard → Wallet → Transactions. Each entry shows: type, amount, date, reference, and status.',
                    'Transaction types include: Top-up, Withdrawal, Tour Payment, Escrow Lock, Escrow Release, Platform Fee, Adjustment.',
                    'Use the date filter and search to find specific transactions. Transaction records are permanent and can be used for your own accounting purposes.',
                ],
                tags: ['transactions', 'history', 'records'],
            },
        ],
    },
    {
        key: 'trust-safety',
        label: 'Trust & Safety',
        emoji: '🛡️',
        description: 'Trust Score, risk levels, safety features, SOS',
        color: 'rose',
        articles: [
            {
                id: 'ts-1',
                title: 'Understanding your Trust Score',
                content: [
                    'Every user on Lunavia has a Trust Score ranging from 0 to 100. This score reflects your operational reliability, professionalism, and compliance record.',
                    'Trust Score is earned through: completing tours successfully, timely check-ins, positive feedback, maintaining good standing, and verification compliance.',
                    'Trust Score decreases from: late cancellations, no-shows, safety violations, dispute losses, and prolonged inactivity (trust decay).',
                    'Your Trust Score is visible on your profile, in search results, and to anyone you interact with on the platform. Higher scores lead to more opportunities.',
                ],
                tags: ['trust', 'score', 'reputation'],
            },
            {
                id: 'ts-2',
                title: 'Risk levels explained',
                content: [
                    'Based on your Trust Score and behavior patterns, the platform assigns you a risk level:',
                    'GREEN — Good standing. Full platform access. This is the default for verified users with no issues.',
                    'YELLOW — Under review. Triggered by declining trust scores or minor compliance flags. Some features may be restricted.',
                    'RED — High risk. Serious violations or sustained negative performance. Limited marketplace access pending review.',
                    'Risk levels are dynamic and improve as you demonstrate consistent positive behavior. They are reviewed automatically by the platform.',
                ],
                tags: ['risk', 'levels', 'compliance'],
            },
            {
                id: 'ts-3',
                title: 'Safety check-ins during tours',
                content: [
                    'During active tours, guides are prompted for periodic safety check-ins. These are quick confirmations that the tour is running smoothly.',
                    'Completing check-ins on time contributes positively to your Trust Score. Missing check-ins triggers alerts to the operator and may escalate to admins.',
                    'Check-ins can include optional notes about weather conditions, group status, or any concerns. This creates a safety trail for the entire tour.',
                ],
                tags: ['safety', 'checkin', 'monitoring'],
            },
            {
                id: 'ts-4',
                title: 'Emergency SOS system',
                content: [
                    'The SOS feature is available during any active tour. Pressing the SOS button immediately alerts the operator, platform safety team, and can trigger external emergency protocols.',
                    'SOS should only be used for genuine emergencies: medical incidents, safety threats, natural disasters, or situations requiring immediate assistance.',
                    'When SOS is triggered, the platform logs your GPS location, notifies all relevant parties, and opens a priority communication channel.',
                    'False SOS triggers may result in Trust Score penalties. The feature is designed for genuine emergencies only.',
                ],
                tags: ['sos', 'emergency', 'safety'],
            },
            {
                id: 'ts-5',
                title: 'Dispute resolution process',
                content: [
                    'Disputes can be raised by either party (operator or guide) during or after a tour. Common reasons include: service quality, contract violations, payment disagreements.',
                    'The dispute process: 1) Open dispute with description → 2) Both parties submit evidence → 3) Admin reviews → 4) Resolution decision.',
                    'Resolutions can include: full payment release, partial refund, full refund, or other custom arrangements.',
                    'Dispute outcomes affect Trust Scores. The losing party typically sees a Trust Score reduction proportional to the severity of the issue.',
                ],
                tags: ['dispute', 'resolution', 'conflict'],
            },
        ],
    },
    {
        key: 'faq',
        label: 'FAQ',
        emoji: '❓',
        description: 'Frequently asked questions',
        color: 'slate',
        articles: [
            {
                id: 'faq-1',
                title: 'How much does Lunavia cost?',
                content: [
                    'Lunavia offers tiered pricing based on your role and needs. Operators can start with a free plan and upgrade for more features, lower commissions, and higher tour limits.',
                    'Guides can use Lunavia for free with a standard commission on completed tours. A Pro plan is available for reduced commission rates and enhanced profile visibility.',
                    'Visit the Pricing page for detailed plan comparisons and current rates.',
                ],
                tags: ['pricing', 'cost', 'plans'],
            },
            {
                id: 'faq-2',
                title: 'Is my payment secure?',
                content: [
                    'Yes. Lunavia uses an escrow-based payment model. Funds are held securely by the platform until both parties confirm tour completion.',
                    'No payment is transferred directly between operator and guide — all transactions go through the platform for transparency and security.',
                    'In case of disputes, funds are protected in escrow until fair resolution is reached.',
                ],
                tags: ['security', 'payment', 'escrow'],
            },
            {
                id: 'faq-3',
                title: 'What happens if a guide cancels?',
                content: [
                    'If a guide cancels before the tour, the operator is notified immediately. The operator can then find a replacement through the marketplace or standby list.',
                    'Late cancellations carry Trust Score penalties for the guide. Escrow funds are returned to the operator if the tour is cancelled.',
                    'Operators are encouraged to set up standby requests for critical tours to minimize cancellation impact.',
                ],
                tags: ['cancellation', 'guide', 'policy'],
            },
            {
                id: 'faq-4',
                title: 'Can I use Lunavia in multiple countries?',
                content: [
                    'Yes. Lunavia supports multi-country operations. Operators can create tours in any location, and guides can set availability across multiple regions.',
                    'The platform supports multiple languages and currency display. All financial transactions are processed in VND (Vietnamese Dong) as the base currency.',
                ],
                tags: ['international', 'countries', 'currency'],
            },
            {
                id: 'faq-5',
                title: 'How is the Trust Score calculated?',
                content: [
                    'Trust Score is a composite metric calculated from: tour completion rate, check-in compliance, dispute history, verification status, activity recency, and peer feedback.',
                    'The exact formula considers both the frequency and recency of actions — recent behavior weighs more than historical actions.',
                    'Trust Score naturally decays over time for inactive users (trust decay) to ensure scores reflect current engagement.',
                    'There is no way to "buy" trust — it is earned entirely through demonstrated professional behavior on the platform.',
                ],
                tags: ['trust', 'calculation', 'formula'],
            },
            {
                id: 'faq-6',
                title: 'How do I contact support?',
                content: [
                    'For platform issues, use the Contact page accessible from the main navigation or footer.',
                    'For urgent matters during an active tour, use the SOS feature in the tour live view.',
                    'For account-related questions, check this Knowledge Base first — most common answers are covered here.',
                ],
                tags: ['support', 'contact', 'help'],
            },
            {
                id: 'faq-7',
                title: 'Can I be both an operator and a guide?',
                content: [
                    'Currently, each account is associated with a single role (Operator or Guide). This is by design to maintain clear separation of responsibilities.',
                    'If you need to operate in both capacities, you would need separate accounts with different email addresses.',
                    'Sole Operators have a special operator category that combines some aspects of both roles for individual professionals.',
                ],
                tags: ['roles', 'dual', 'sole-operator'],
            },
        ],
    },
];

/* ─────────────────── Color maps ─────────────────── */
const COLOR_MAP: Record<string, { bg: string; border: string; text: string; bgLight: string; dot: string }> = {
    blue:    { bg: 'bg-lunavia-primary',    border: 'border-lunavia-muted/60',    text: 'text-lunavia-primary',    bgLight: 'bg-lunavia-light',    dot: 'bg-lunavia-light0' },
    indigo:  { bg: 'bg-lunavia-primary',  border: 'border-[#5BA4CF]/30',  text: 'text-[#5BA4CF]',  bgLight: 'bg-[#E8F4FD]',  dot: 'bg-[#E8F4FD]0' },
    emerald: { bg: 'bg-emerald-600', border: 'border-emerald-200', text: 'text-emerald-600', bgLight: 'bg-emerald-50', dot: 'bg-emerald-500' },
    violet:  { bg: 'bg-violet-600',  border: 'border-violet-200',  text: 'text-violet-600',  bgLight: 'bg-violet-50',  dot: 'bg-violet-500' },
    amber:   { bg: 'bg-amber-600',   border: 'border-amber-200',   text: 'text-amber-600',   bgLight: 'bg-amber-50',   dot: 'bg-amber-500' },
    rose:    { bg: 'bg-rose-600',    border: 'border-rose-200',    text: 'text-rose-600',    bgLight: 'bg-rose-50',    dot: 'bg-rose-500' },
    slate:   { bg: 'bg-slate-600',   border: 'border-slate-200',   text: 'text-slate-600',   bgLight: 'bg-slate-50',   dot: 'bg-slate-500' },
};

/* ─────────────────── Main Component ─────────────────── */
export default function KnowledgeBasePage() {
    const [activeCategory, setActiveCategory] = useState<Category>('getting-started');
    const [expandedArticle, setExpandedArticle] = useState<string | null>('gs-1');
    const [searchQuery, setSearchQuery] = useState('');

    const activeData = CATEGORIES.find(c => c.key === activeCategory)!;
    const colors = COLOR_MAP[activeData.color];

    // Search across all categories
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return null;
        const q = searchQuery.toLowerCase();
        const results: (Article & { categoryLabel: string; categoryKey: Category })[] = [];
        CATEGORIES.forEach(cat => {
            cat.articles.forEach(article => {
                if (
                    article.title.toLowerCase().includes(q) ||
                    article.content.some(p => p.toLowerCase().includes(q)) ||
                    article.tags?.some(t => t.includes(q))
                ) {
                    results.push({ ...article, categoryLabel: cat.label, categoryKey: cat.key });
                }
            });
        });
        return results;
    }, [searchQuery]);

    const toggleArticle = (id: string) => {
        setExpandedArticle(expandedArticle === id ? null : id);
    };

    const totalArticles = CATEGORIES.reduce((sum, c) => sum + c.articles.length, 0);

    return (
        <div className="overflow-hidden">
            {/* Hero */}
            <section className="relative pt-28 pb-16 px-6">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50/40 to-slate-50" />
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-200/30 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F4FD] border border-[#5BA4CF]/30 text-xs font-semibold text-[#2E8BC0] mb-6">
                        <BookOpen />
                        Knowledge Base
                    </span>

                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                        Everything you need to know
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
                        {totalArticles} articles covering every aspect of Lunavia — from getting started to advanced operations. Find answers fast.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl mx-auto relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search articles, topics, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-700 text-base"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Search Results */}
            {searchResults && (
                <section className="px-6 pb-12">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                        </h2>
                        {searchResults.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400 text-lg">No articles found. Try different keywords.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {searchResults.map(article => (
                                    <button
                                        key={article.id}
                                        onClick={() => {
                                            setActiveCategory(article.categoryKey);
                                            setExpandedArticle(article.id);
                                            setSearchQuery('');
                                        }}
                                        className="w-full text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group"
                                    >
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-semibold text-[#5BA4CF] bg-[#E8F4FD] px-2 py-0.5 rounded-full">{article.categoryLabel}</span>
                                        </div>
                                        <h3 className="font-semibold text-slate-900 group-hover:text-[#5BA4CF] transition">{article.title}</h3>
                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{article.content[0]}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Category Cards */}
            {!searchResults && (
                <>
                    <section className="px-6 pb-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {CATEGORIES.map(cat => {
                                    const c = COLOR_MAP[cat.color];
                                    const isActive = activeCategory === cat.key;
                                    return (
                                        <button
                                            key={cat.key}
                                            onClick={() => {
                                                setActiveCategory(cat.key);
                                                setExpandedArticle(null);
                                            }}
                                            className={`p-4 rounded-2xl border text-center transition-all ${
                                                isActive
                                                    ? `${c.bgLight} ${c.border} shadow-md ring-2 ring-offset-1 ring-${cat.color}-300`
                                                    : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="text-2xl mb-2">{cat.emoji}</div>
                                            <div className={`text-xs font-bold ${isActive ? c.text : 'text-slate-700'}`}>
                                                {cat.label}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">{cat.articles.length} articles</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Main Content */}
                    <section className="py-12 px-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
                        {/* Sidebar */}
                        <div className="w-full md:w-72 flex-shrink-0">
                            <div className="sticky top-24 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        {activeData.label}
                                    </h4>
                                    <p className="text-sm text-slate-500 mb-6">{activeData.description}</p>
                                    <ul className="space-y-1">
                                        {activeData.articles.map(article => (
                                            <li key={article.id}>
                                                <button
                                                    onClick={() => {
                                                        setExpandedArticle(article.id);
                                                        document.getElementById(article.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    }}
                                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                                                        expandedArticle === article.id
                                                            ? `${colors.bgLight} ${colors.text} font-semibold`
                                                            : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {article.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={`${colors.bgLight} p-5 rounded-2xl border ${colors.border}`}>
                                    <h5 className={`text-xs font-bold ${colors.text} mb-2`}>Need more help?</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                        Can&apos;t find what you&apos;re looking for? Our support team is ready to help.
                                    </p>
                                    <Link href="/contact" className={`text-xs font-semibold ${colors.text} hover:underline`}>
                                        Contact Support →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Article List */}
                        <div className="flex-grow">
                            <div className="flex items-baseline justify-between mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <span className={colors.text}>#</span> {activeData.label}
                                </h2>
                                <span className="text-xs text-slate-400">{activeData.articles.length} articles</span>
                            </div>

                            <div className="space-y-3">
                                {activeData.articles.map(article => (
                                    <div
                                        key={article.id}
                                        id={article.id}
                                        className={`bg-white rounded-2xl border transition-all ${
                                            expandedArticle === article.id
                                                ? `${colors.border} shadow-md`
                                                : 'border-slate-100 shadow-sm hover:shadow-md'
                                        }`}
                                    >
                                        <button
                                            onClick={() => toggleArticle(article.id)}
                                            className="w-full text-left p-6 flex justify-between items-center"
                                        >
                                            <h3 className={`font-semibold ${expandedArticle === article.id ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {article.title}
                                            </h3>
                                            <span className={`flex-shrink-0 ml-4 p-1 rounded ${expandedArticle === article.id ? `${colors.bgLight} ${colors.text}` : 'text-slate-400'}`}>
                                                {expandedArticle === article.id ? <ChevronUp /> : <ChevronDown />}
                                            </span>
                                        </button>

                                        {expandedArticle === article.id && (
                                            <div className="px-6 pb-6 border-t border-slate-100 pt-4">
                                                <div className="prose prose-sm text-slate-500 leading-relaxed space-y-3 max-w-none">
                                                    {article.content.map((paragraph, i) => (
                                                        <p key={i}>{paragraph}</p>
                                                    ))}
                                                </div>
                                                {article.tags && (
                                                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-50">
                                                        {article.tags.map(tag => (
                                                            <span
                                                                key={tag}
                                                                className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* Quick Links / CTA */}
            <section className="bg-gradient-to-b from-slate-50 to-indigo-50 py-20 px-6 border-t border-slate-200">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Explore more</h2>
                    <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
                        Dive deeper into Lunavia&apos;s platform documentation and resources.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/documentation" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition group">
                            <div className="w-10 h-10 rounded-xl bg-[#E8F4FD] border border-[#5BA4CF]/30 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <svg className="w-5 h-5 text-[#5BA4CF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Platform Documentation</h3>
                            <p className="text-sm text-slate-500">Deep-dive into how Lunavia works — trust scores, escrow, compliance.</p>
                        </Link>

                        <Link href="/features" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition group">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Feature Comparison</h3>
                            <p className="text-sm text-slate-500">Compare plans and see the full feature breakdown for each tier.</p>
                        </Link>

                        <Link href="/pricing" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition group">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Pricing</h3>
                            <p className="text-sm text-slate-500">Transparent pricing for operators and guides at every scale.</p>
                        </Link>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-slate-500 mb-4">Still have questions?</p>
                        <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-lunavia-primary text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
