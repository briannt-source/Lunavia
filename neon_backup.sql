--
-- PostgreSQL database dump
--

\restrict aXjoKD5aCtZDSijOFPyB31n7FskeHAi8jpLhnwebHL74XV9uSKVOT7HINK1hs9U

-- Dumped from database version 17.7 (bdc8956)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminRole" AS ENUM (
    'SUPER_ADMIN',
    'MODERATOR',
    'SUPPORT_STAFF'
);


--
-- Name: AppStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AppStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);


--
-- Name: AvailabilityStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AvailabilityStatus" AS ENUM (
    'AVAILABLE',
    'BUSY',
    'ON_TOUR'
);


--
-- Name: CheckInStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CheckInStatus" AS ENUM (
    'SAFE',
    'NEEDS_ATTENTION',
    'MISSED',
    'EMERGENCY'
);


--
-- Name: ContractStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractStatus" AS ENUM (
    'NOT_VIEWED',
    'VIEWED',
    'ACCEPTED',
    'REJECTED'
);


--
-- Name: ContractTemplateCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ContractTemplateCategory" AS ENUM (
    'TOUR_GUIDE_STANDARD',
    'TOUR_GUIDE_PREMIUM',
    'STANDBY_SERVICE',
    'IN_HOUSE_EMPLOYMENT',
    'CUSTOM'
);


--
-- Name: DisputeResolution; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DisputeResolution" AS ENUM (
    'FULL_REFUND',
    'PARTIAL_REFUND',
    'FULL_PAYMENT',
    'PARTIAL_PAYMENT',
    'NO_ACTION'
);


--
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'PENDING',
    'IN_REVIEW',
    'RESOLVED',
    'REJECTED',
    'ESCALATED',
    'APPEALED'
);


--
-- Name: DisputeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DisputeType" AS ENUM (
    'PAYMENT',
    'ASSIGNMENT',
    'NO_SHOW',
    'QUALITY'
);


--
-- Name: EmergencySeverity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmergencySeverity" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


--
-- Name: EmergencyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmergencyStatus" AS ENUM (
    'PENDING',
    'ACKNOWLEDGED',
    'IN_PROGRESS',
    'RESOLVED',
    'CANCELLED'
);


--
-- Name: EmergencyType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmergencyType" AS ENUM (
    'SOS',
    'EMERGENCY',
    'INCIDENT',
    'SAFETY_CHECK'
);


--
-- Name: EmploymentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmploymentType" AS ENUM (
    'FREELANCE',
    'IN_HOUSE'
);


--
-- Name: EscrowStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EscrowStatus" AS ENUM (
    'PENDING',
    'LOCKED',
    'RELEASED',
    'REFUNDED',
    'CANCELLED'
);


--
-- Name: GuideRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GuideRole" AS ENUM (
    'MAIN',
    'SUB'
);


--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'PAID',
    'CANCELLED',
    'OVERDUE'
);


--
-- Name: InvoiceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceType" AS ENUM (
    'TOUR_SERVICE',
    'STANDBY_SERVICE',
    'PLATFORM_FEE',
    'COMBINED'
);


--
-- Name: LegalRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LegalRole" AS ENUM (
    'TOUR_OPERATOR',
    'TOUR_AGENCY',
    'TOUR_GUIDE'
);


--
-- Name: MilestoneStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MilestoneStatus" AS ENUM (
    'PENDING',
    'REQUESTED',
    'APPROVED',
    'REJECTED',
    'PAID',
    'AUTO_RELEASED'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED'
);


--
-- Name: Permission; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Permission" AS ENUM (
    'DISPUTES',
    'TRANSFERS',
    'PASSWORD_RESET',
    'PROFILE_MGMT'
);


--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);


--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'FLAGGED'
);


--
-- Name: StandbyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StandbyStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'COMPLETED'
);


--
-- Name: TaxType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaxType" AS ENUM (
    'VAT',
    'WITHHOLDING_TAX'
);


--
-- Name: TourBlockReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TourBlockReason" AS ENUM (
    'MISINFORMATION',
    'INAPPROPRIATE_CONTENT',
    'POLICY_VIOLATION',
    'MISSING_INFO',
    'SPAM',
    'FALSE_CLAIMS',
    'COPYRIGHT_VIOLATION',
    'UNAUTHORIZED_CONTACT',
    'LEGAL_VIOLATION',
    'UNETHICAL_BEHAVIOR',
    'OTHER'
);


--
-- Name: TourRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TourRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: TourRequestType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TourRequestType" AS ENUM (
    'EDIT',
    'DELETE'
);


--
-- Name: TourStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TourStatus" AS ENUM (
    'DRAFT',
    'OPEN',
    'CLOSED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: UserBlockReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserBlockReason" AS ENUM (
    'FRAUD',
    'POLICY_VIOLATION',
    'INAPPROPRIATE_BEHAVIOR',
    'SPAM',
    'FALSE_INFORMATION',
    'UNAUTHORIZED_ACTIVITY',
    'LEGAL_VIOLATION',
    'UNETHICAL_BEHAVIOR',
    'SAFETY_CONCERN',
    'OTHER'
);


--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'NOT_SUBMITTED',
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: Visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Visibility" AS ENUM (
    'PUBLIC',
    'PRIVATE'
);


--
-- Name: WithdrawalMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WithdrawalMethod" AS ENUM (
    'BANK',
    'MOMO',
    'ZALO',
    'OTHER'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."AdminRole" DEFAULT 'SUPPORT_STAFF'::public."AdminRole" NOT NULL,
    permissions public."Permission"[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: application_cancellations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_cancellations (
    id text NOT NULL,
    "applicationId" text NOT NULL,
    "cancelledBy" text NOT NULL,
    reason text,
    "penaltyAmount" double precision,
    "penaltyApplied" boolean DEFAULT false NOT NULL,
    "cancelledAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "guideId" text NOT NULL,
    role public."GuideRole" NOT NULL,
    status public."AppStatus" DEFAULT 'PENDING'::public."AppStatus" NOT NULL,
    "coverLetter" text,
    "appliedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "guideId" text NOT NULL,
    role public."GuideRole" NOT NULL,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "rejectReason" text,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id text NOT NULL,
    name text NOT NULL,
    region text NOT NULL,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    logo text,
    email text,
    website text,
    address text,
    "businessLicenseNumber" text,
    "travelLicenseNumber" text,
    "operatorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: company_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_invitations (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "guideId" text,
    email text,
    "inviteToken" text NOT NULL,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "invitedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: company_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_members (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "guideId" text NOT NULL,
    "companyEmail" text,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "employmentContractUrl" text,
    "contractVerified" boolean DEFAULT false NOT NULL,
    "contractVerifiedBy" text,
    "contractVerifiedAt" timestamp(3) without time zone,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: contract_acceptances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_acceptances (
    id text NOT NULL,
    "contractId" text NOT NULL,
    "guideId" text NOT NULL,
    status public."ContractStatus" DEFAULT 'NOT_VIEWED'::public."ContractStatus" NOT NULL,
    "signatureUrl" text,
    "signedAt" timestamp(3) without time zone,
    "signedIp" text,
    "viewedAt" timestamp(3) without time zone,
    "acceptedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: contract_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_history (
    id text NOT NULL,
    "contractId" text NOT NULL,
    version integer NOT NULL,
    content text NOT NULL,
    "changedBy" text,
    "changeNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: contract_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_templates (
    id text NOT NULL,
    name text NOT NULL,
    category public."ContractTemplateCategory" NOT NULL,
    description text,
    content text NOT NULL,
    variables jsonb NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "templateId" text,
    title text NOT NULL,
    content text NOT NULL,
    "templateContent" text,
    "operatorSignatureUrl" text,
    "operatorSignedAt" timestamp(3) without time zone,
    "operatorSignedIp" text,
    version integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "renewalReminderSent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "operatorId" text NOT NULL,
    "guideId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: dispute_timelines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispute_timelines (
    id text NOT NULL,
    disputeid text NOT NULL,
    action text NOT NULL,
    actorid text,
    details text,
    metadata jsonb,
    createdat timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: disputes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disputes (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tourId" text,
    "applicationId" text,
    "paymentId" text,
    "escrowAccountId" text,
    type public."DisputeType" NOT NULL,
    description text NOT NULL,
    evidence text[],
    status public."DisputeStatus" DEFAULT 'PENDING'::public."DisputeStatus" NOT NULL,
    resolution public."DisputeResolution",
    "resolutionAmount" double precision,
    "resolutionNotes" text,
    "assignedTo" text,
    "escalatedAt" timestamp(3) without time zone,
    "escalatedBy" text,
    "resolvedAt" timestamp(3) without time zone,
    "resolvedBy" text,
    "appealId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: emergency_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emergency_contacts (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    relationship text,
    priority integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: emergency_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emergency_reports (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "guideId" text NOT NULL,
    type public."EmergencyType" NOT NULL,
    description text NOT NULL,
    severity public."EmergencySeverity" NOT NULL,
    status public."EmergencyStatus" DEFAULT 'PENDING'::public."EmergencyStatus" NOT NULL,
    location text,
    latitude double precision,
    longitude double precision,
    "locationAccuracy" double precision,
    "operatorResponse" text,
    "respondedBy" text,
    "respondedAt" timestamp(3) without time zone,
    "resolvedAt" timestamp(3) without time zone,
    "resolvedBy" text,
    "resolutionNotes" text,
    escalated boolean DEFAULT false NOT NULL,
    "escalatedAt" timestamp(3) without time zone,
    "escalatedBy" text,
    "escalationLevel" integer DEFAULT 1 NOT NULL,
    "contactsNotified" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: escrow_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escrow_accounts (
    id text NOT NULL,
    "operatorId" text NOT NULL,
    "guideId" text NOT NULL,
    "tourId" text,
    "standbyRequestId" text,
    amount double precision NOT NULL,
    "platformFee" double precision DEFAULT 0 NOT NULL,
    "netAmount" double precision NOT NULL,
    status public."EscrowStatus" DEFAULT 'PENDING'::public."EscrowStatus" NOT NULL,
    "lockedAt" timestamp(3) without time zone,
    "releasedAt" timestamp(3) without time zone,
    "refundedAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "releaseReason" text,
    "refundReason" text,
    "cancelledReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paymentMilestoneId" text
);


--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchange_rates (
    id text NOT NULL,
    "fromCurrency" text DEFAULT 'USD'::text NOT NULL,
    "toCurrency" text DEFAULT 'VND'::text NOT NULL,
    rate double precision NOT NULL,
    "effectiveFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "effectiveTo" timestamp(3) without time zone,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: guide_availabilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guide_availabilities (
    id text NOT NULL,
    "guideId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    slots jsonb[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "invoiceType" public."InvoiceType" NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "issuerId" text NOT NULL,
    "recipientId" text NOT NULL,
    "tourId" text,
    "paymentId" text,
    "standbyRequestId" text,
    subtotal double precision NOT NULL,
    "vatAmount" double precision DEFAULT 0 NOT NULL,
    "withholdingTax" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision NOT NULL,
    "invoiceDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "paidAt" timestamp(3) without time zone,
    "lineItems" jsonb NOT NULL,
    notes text,
    terms text,
    "taxCode" text,
    "taxExempt" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: join_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.join_requests (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "guideId" text NOT NULL,
    message text,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: lunavia_bank_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lunavia_bank_accounts (
    id text NOT NULL,
    "bankName" text NOT NULL,
    "accountName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "branchName" text,
    "qrCodeUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id text NOT NULL,
    "conversationId" text NOT NULL,
    "senderId" text NOT NULL,
    content text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    "accountName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "bankName" text,
    "branchName" text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verifiedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payment_milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_milestones (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "guideId" text NOT NULL,
    "applicationId" text,
    "assignmentId" text,
    "totalAmount" double precision NOT NULL,
    "milestone1Amount" double precision NOT NULL,
    "milestone2Amount" double precision NOT NULL,
    "milestone3Amount" double precision NOT NULL,
    "milestone1Status" public."MilestoneStatus" DEFAULT 'PENDING'::public."MilestoneStatus" NOT NULL,
    "milestone1RequestedAt" timestamp(3) without time zone,
    "milestone1PaidAt" timestamp(3) without time zone,
    "milestone1PaymentId" text,
    "milestone2Status" public."MilestoneStatus" DEFAULT 'PENDING'::public."MilestoneStatus" NOT NULL,
    "milestone2RequestedAt" timestamp(3) without time zone,
    "milestone2PaidAt" timestamp(3) without time zone,
    "milestone2PaymentId" text,
    "milestone3Status" public."MilestoneStatus" DEFAULT 'PENDING'::public."MilestoneStatus" NOT NULL,
    "milestone3RequestedAt" timestamp(3) without time zone,
    "milestone3PaidAt" timestamp(3) without time zone,
    "milestone3PaymentId" text,
    "autoReleaseEnabled" boolean DEFAULT false NOT NULL,
    "autoReleaseHours" integer DEFAULT 24 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "fromWalletId" text NOT NULL,
    "toWalletId" text NOT NULL,
    amount double precision NOT NULL,
    "platformFee" double precision DEFAULT 0 NOT NULL,
    "netAmount" double precision NOT NULL,
    "isFreelance" boolean DEFAULT true NOT NULL,
    "employmentContractUrl" text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "tourId" text,
    "standbyRequestId" text,
    "escrowAccountId" text,
    "refId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text,
    "photoUrl" text,
    bio text,
    languages text[],
    "experienceYears" integer,
    specialties text[],
    rating double precision DEFAULT 0,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "companyName" text,
    "companyLogo" text,
    address text,
    phone text,
    "companyEmail" text,
    "availabilityStatus" public."AvailabilityStatus" DEFAULT 'AVAILABLE'::public."AvailabilityStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "reviewerId" text NOT NULL,
    "subjectId" text NOT NULL,
    "tourId" text,
    "professionalismRating" integer NOT NULL,
    "communicationRating" integer NOT NULL,
    "punctualityRating" integer NOT NULL,
    "knowledgeRating" integer NOT NULL,
    "overallRating" integer NOT NULL,
    comment text,
    photos text[],
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "canEdit" boolean DEFAULT true NOT NULL,
    "editDeadline" timestamp(3) without time zone,
    "isFlagged" boolean DEFAULT false NOT NULL,
    "flaggedBy" text,
    "flaggedAt" timestamp(3) without time zone,
    "flagReason" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "reviewNote" text,
    response text,
    "responseBy" text,
    "respondedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "editedAt" timestamp(3) without time zone
);


--
-- Name: safety_check_ins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.safety_check_ins (
    id text NOT NULL,
    "emergencyReportId" text,
    "tourId" text NOT NULL,
    "guideId" text NOT NULL,
    status public."CheckInStatus" DEFAULT 'SAFE'::public."CheckInStatus" NOT NULL,
    location text,
    latitude double precision,
    longitude double precision,
    notes text,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "checkedInAt" timestamp(3) without time zone,
    missed boolean DEFAULT false NOT NULL,
    "missedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: standby_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.standby_requests (
    id text NOT NULL,
    "operatorId" text NOT NULL,
    title text NOT NULL,
    city text NOT NULL,
    "requiredDate" timestamp(3) without time zone NOT NULL,
    budget double precision NOT NULL,
    "standbyFee" double precision,
    status public."StandbyStatus" DEFAULT 'PENDING'::public."StandbyStatus" NOT NULL,
    "mainGuideId" text,
    "subGuideId" text,
    description text,
    "acceptedAt" timestamp(3) without time zone,
    "rejectedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tax_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_records (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "taxType" public."TaxType" NOT NULL,
    "taxRate" double precision NOT NULL,
    "taxableAmount" double precision NOT NULL,
    "taxAmount" double precision NOT NULL,
    "taxPeriod" text NOT NULL,
    "taxYear" integer NOT NULL,
    reported boolean DEFAULT false NOT NULL,
    "reportedAt" timestamp(3) without time zone,
    "reportId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: topup_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topup_requests (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount double precision NOT NULL,
    method text NOT NULL,
    "paymentMethodId" text,
    "customAccountInfo" text,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "adminNotes" text,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tour_delete_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_delete_requests (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "operatorId" text NOT NULL,
    reason text,
    status public."TourRequestStatus" DEFAULT 'PENDING'::public."TourRequestStatus" NOT NULL,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "reviewNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tour_edit_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_edit_requests (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "operatorId" text NOT NULL,
    reason text,
    changes jsonb NOT NULL,
    status public."TourRequestStatus" DEFAULT 'PENDING'::public."TourRequestStatus" NOT NULL,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    "reviewNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tour_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_reports (
    id text NOT NULL,
    "tourId" text NOT NULL,
    "guideId" text NOT NULL,
    "overallRating" integer,
    "clientSatisfaction" integer,
    highlights text,
    challenges text,
    recommendations text,
    "paymentRequestAmount" double precision,
    "paymentRequestStatus" public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "paymentLockedAmount" double precision,
    "paymentLockedAt" timestamp(3) without time zone,
    "paymentDueAt" timestamp(3) without time zone,
    "operatorNotes" text,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tours (
    id text NOT NULL,
    code text,
    "operatorId" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    city text NOT NULL,
    visibility public."Visibility" DEFAULT 'PUBLIC'::public."Visibility" NOT NULL,
    status public."TourStatus" DEFAULT 'DRAFT'::public."TourStatus" NOT NULL,
    "priceMain" double precision,
    "priceSub" double precision,
    currency text DEFAULT 'VND'::text NOT NULL,
    pax integer NOT NULL,
    languages text[],
    specialties text[],
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "durationHours" integer,
    files text[],
    itinerary jsonb[],
    "mainGuideSlots" integer DEFAULT 1 NOT NULL,
    "subGuideSlots" integer DEFAULT 0 NOT NULL,
    inclusions text[] DEFAULT ARRAY[]::text[],
    exclusions text[] DEFAULT ARRAY[]::text[],
    "additionalRequirements" text,
    "guideNotes" text,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "blockedBy" text,
    "blockedAt" timestamp(3) without time zone,
    "blockReason" public."TourBlockReason",
    "blockNotes" text,
    "unblockedBy" text,
    "unblockedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    "walletId" text NOT NULL,
    type text NOT NULL,
    amount double precision NOT NULL,
    description text NOT NULL,
    "refId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_settings (
    id text NOT NULL,
    "userId" text NOT NULL,
    "emailNewApplication" boolean DEFAULT true NOT NULL,
    "emailApplicationStatus" boolean DEFAULT true NOT NULL,
    "emailPayment" boolean DEFAULT true NOT NULL,
    "emailTourStarted" boolean DEFAULT true NOT NULL,
    "emailTourCancelled" boolean DEFAULT true NOT NULL,
    "emailMessage" boolean DEFAULT true NOT NULL,
    "emailReportSubmitted" boolean DEFAULT true NOT NULL,
    "emailPaymentRequest" boolean DEFAULT true NOT NULL,
    "emailEmergency" boolean DEFAULT true NOT NULL,
    "inAppNotifications" boolean DEFAULT true NOT NULL,
    language text DEFAULT 'vi'::text NOT NULL,
    "dateFormat" text DEFAULT 'DD/MM/YYYY'::text NOT NULL,
    "currencyDisplay" text DEFAULT 'VND'::text NOT NULL,
    timezone text DEFAULT 'Asia/Ho_Chi_Minh'::text NOT NULL,
    "profileVisibility" text DEFAULT 'PUBLIC'::text NOT NULL,
    "showWalletBalance" boolean DEFAULT false NOT NULL,
    "defaultTourVisibility" text,
    "defaultCurrency" text DEFAULT 'VND'::text,
    "defaultMainGuideSlots" integer DEFAULT 1,
    "defaultSubGuideSlots" integer DEFAULT 0,
    "autoCloseToursDays" integer,
    "autoApplyEnabled" boolean DEFAULT false NOT NULL,
    "minTourPrice" double precision,
    "preferredTourTypes" text[],
    "autoApprovePayments" boolean DEFAULT false NOT NULL,
    "autoApproveThreshold" double precision,
    "paymentReminderDays" integer DEFAULT 7,
    "defaultPaymentMethod" text,
    "paymentCurrency" text DEFAULT 'VND'::text,
    "paymentSchedule" text DEFAULT 'IMMEDIATE'::text,
    "preferredPaymentMethod" text,
    "autoWithdrawEnabled" boolean DEFAULT false NOT NULL,
    "autoWithdrawThreshold" double precision,
    "paymentReminderEnabled" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    code text,
    email text NOT NULL,
    password text,
    role public."LegalRole" NOT NULL,
    "employmentType" public."EmploymentType",
    "companyId" text,
    "licenseNumber" text,
    "verifiedStatus" public."VerificationStatus" DEFAULT 'NOT_SUBMITTED'::public."VerificationStatus" NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "blockedBy" text,
    "blockedAt" timestamp(3) without time zone,
    "blockReason" public."UserBlockReason",
    "blockNotes" text,
    "unblockedBy" text,
    "unblockedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_tokens (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."VerificationStatus" DEFAULT 'NOT_SUBMITTED'::public."VerificationStatus" NOT NULL,
    "photoUrl" text,
    "idDocumentUrl" text,
    "licenseUrl" text,
    "travelLicenseUrl" text,
    "proofOfAddressUrl" text,
    documents text[],
    "adminNotes" text,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    "lockedDeposit" double precision DEFAULT 0 NOT NULL,
    reserved double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: withdrawal_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawal_requests (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount double precision NOT NULL,
    method public."WithdrawalMethod" NOT NULL,
    "paymentMethodId" text,
    "customAccountInfo" text,
    "accountOwnerName" text,
    status public."RequestStatus" DEFAULT 'PENDING'::public."RequestStatus" NOT NULL,
    "adminNotes" text,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
277bd5f0-367b-4264-9988-d1b642eb1099	d53f0cbdebc9d8687cb507a4f73cf45113aad791f62d35715609e726c5bb31b1	\N	20250115000000_add_user_settings	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250115000000_add_user_settings\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "users" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"users\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(637), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250115000000_add_user_settings"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250115000000_add_user_settings"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226	\N	2026-01-04 05:32:36.461686+00	0
e72984ac-5678-494c-b548-bb70b0b5c720	40babc86cfa1f6d4cc21fcf68aa08eeb9f72895994e4586039e9d206157a50cf	2026-01-04 05:34:07.213709+00	20251228155101_init		\N	2026-01-04 05:34:07.213709+00	0
e7d4139e-9461-4c3e-aab9-2865caaf47c9	ceeaa79a0a358710b7834d716241f9a72eb034283e1b07cb5c6b241bbad28db7	2026-01-04 05:34:22.732668+00	20250115000012_add_guide_notes		\N	2026-01-04 05:34:22.732668+00	0
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, email, password, role, permissions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: application_cancellations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.application_cancellations (id, "applicationId", "cancelledBy", reason, "penaltyAmount", "penaltyApplied", "cancelledAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.applications (id, "tourId", "guideId", role, status, "coverLetter", "appliedAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assignments (id, "tourId", "guideId", role, status, "rejectReason", "assignedAt", "acceptedAt", "rejectedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cities (id, name, region, code, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, "companyId", name, logo, email, website, address, "businessLicenseNumber", "travelLicenseNumber", "operatorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_invitations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_invitations (id, "companyId", "guideId", email, "inviteToken", status, "invitedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: company_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_members (id, "companyId", "guideId", "companyEmail", status, "employmentContractUrl", "contractVerified", "contractVerifiedBy", "contractVerifiedAt", "approvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contract_acceptances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_acceptances (id, "contractId", "guideId", status, "signatureUrl", "signedAt", "signedIp", "viewedAt", "acceptedAt", "rejectedAt", "rejectionReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contract_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_history (id, "contractId", version, content, "changedBy", "changeNote", "createdAt") FROM stdin;
\.


--
-- Data for Name: contract_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_templates (id, name, category, description, content, variables, "isActive", version, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contracts (id, "tourId", "templateId", title, content, "templateContent", "operatorSignatureUrl", "operatorSignedAt", "operatorSignedIp", version, "isActive", "expiresAt", "renewalReminderSent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, "tourId", "operatorId", "guideId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dispute_timelines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dispute_timelines (id, disputeid, action, actorid, details, metadata, createdat) FROM stdin;
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.disputes (id, "userId", "tourId", "applicationId", "paymentId", "escrowAccountId", type, description, evidence, status, resolution, "resolutionAmount", "resolutionNotes", "assignedTo", "escalatedAt", "escalatedBy", "resolvedAt", "resolvedBy", "appealId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: emergency_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.emergency_contacts (id, "userId", name, phone, email, relationship, priority, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: emergency_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.emergency_reports (id, "tourId", "guideId", type, description, severity, status, location, latitude, longitude, "locationAccuracy", "operatorResponse", "respondedBy", "respondedAt", "resolvedAt", "resolvedBy", "resolutionNotes", escalated, "escalatedAt", "escalatedBy", "escalationLevel", "contactsNotified", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: escrow_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.escrow_accounts (id, "operatorId", "guideId", "tourId", "standbyRequestId", amount, "platformFee", "netAmount", status, "lockedAt", "releasedAt", "refundedAt", "cancelledAt", "releaseReason", "refundReason", "cancelledReason", "createdAt", "updatedAt", "paymentMilestoneId") FROM stdin;
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exchange_rates (id, "fromCurrency", "toCurrency", rate, "effectiveFrom", "effectiveTo", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: guide_availabilities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.guide_availabilities (id, "guideId", date, slots, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, "invoiceNumber", "invoiceType", status, "issuerId", "recipientId", "tourId", "paymentId", "standbyRequestId", subtotal, "vatAmount", "withholdingTax", "totalAmount", "invoiceDate", "dueDate", "paidAt", "lineItems", notes, terms, "taxCode", "taxExempt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: join_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.join_requests (id, "companyId", "guideId", message, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lunavia_bank_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lunavia_bank_accounts (id, "bankName", "accountName", "accountNumber", "branchName", "qrCodeUrl", "isActive", notes, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, "conversationId", "senderId", content, read, "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", type, title, message, link, read, "readAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_methods (id, "userId", type, "accountName", "accountNumber", "bankName", "branchName", "isDefault", "isVerified", "verifiedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payment_milestones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_milestones (id, "tourId", "guideId", "applicationId", "assignmentId", "totalAmount", "milestone1Amount", "milestone2Amount", "milestone3Amount", "milestone1Status", "milestone1RequestedAt", "milestone1PaidAt", "milestone1PaymentId", "milestone2Status", "milestone2RequestedAt", "milestone2PaidAt", "milestone2PaymentId", "milestone3Status", "milestone3RequestedAt", "milestone3PaidAt", "milestone3PaymentId", "autoReleaseEnabled", "autoReleaseHours", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, "fromWalletId", "toWalletId", amount, "platformFee", "netAmount", "isFreelance", "employmentContractUrl", status, "tourId", "standbyRequestId", "escrowAccountId", "refId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, "userId", name, "photoUrl", bio, languages, "experienceYears", specialties, rating, "reviewCount", "companyName", "companyLogo", address, phone, "companyEmail", "availabilityStatus", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, "reviewerId", "subjectId", "tourId", "professionalismRating", "communicationRating", "punctualityRating", "knowledgeRating", "overallRating", comment, photos, status, "isVerified", "canEdit", "editDeadline", "isFlagged", "flaggedBy", "flaggedAt", "flagReason", "reviewedBy", "reviewedAt", "reviewNote", response, "responseBy", "respondedAt", "createdAt", "updatedAt", "editedAt") FROM stdin;
\.


--
-- Data for Name: safety_check_ins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.safety_check_ins (id, "emergencyReportId", "tourId", "guideId", status, location, latitude, longitude, notes, "scheduledAt", "checkedInAt", missed, "missedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: standby_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.standby_requests (id, "operatorId", title, city, "requiredDate", budget, "standbyFee", status, "mainGuideId", "subGuideId", description, "acceptedAt", "rejectedAt", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tax_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_records (id, "invoiceId", "taxType", "taxRate", "taxableAmount", "taxAmount", "taxPeriod", "taxYear", reported, "reportedAt", "reportId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: topup_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.topup_requests (id, "userId", amount, method, "paymentMethodId", "customAccountInfo", status, "adminNotes", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tour_delete_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_delete_requests (id, "tourId", "operatorId", reason, status, "reviewedBy", "reviewedAt", "reviewNote", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tour_edit_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_edit_requests (id, "tourId", "operatorId", reason, changes, status, "reviewedBy", "reviewedAt", "reviewNote", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tour_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_reports (id, "tourId", "guideId", "overallRating", "clientSatisfaction", highlights, challenges, recommendations, "paymentRequestAmount", "paymentRequestStatus", "paymentLockedAmount", "paymentLockedAt", "paymentDueAt", "operatorNotes", "submittedAt", "approvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tours (id, code, "operatorId", title, description, city, visibility, status, "priceMain", "priceSub", currency, pax, languages, specialties, "startDate", "endDate", "durationHours", files, itinerary, "mainGuideSlots", "subGuideSlots", inclusions, exclusions, "additionalRequirements", "guideNotes", "isBlocked", "blockedBy", "blockedAt", "blockReason", "blockNotes", "unblockedBy", "unblockedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, "walletId", type, amount, description, "refId", "createdAt") FROM stdin;
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_settings (id, "userId", "emailNewApplication", "emailApplicationStatus", "emailPayment", "emailTourStarted", "emailTourCancelled", "emailMessage", "emailReportSubmitted", "emailPaymentRequest", "emailEmergency", "inAppNotifications", language, "dateFormat", "currencyDisplay", timezone, "profileVisibility", "showWalletBalance", "defaultTourVisibility", "defaultCurrency", "defaultMainGuideSlots", "defaultSubGuideSlots", "autoCloseToursDays", "autoApplyEnabled", "minTourPrice", "preferredTourTypes", "autoApprovePayments", "autoApproveThreshold", "paymentReminderDays", "defaultPaymentMethod", "paymentCurrency", "paymentSchedule", "preferredPaymentMethod", "autoWithdrawEnabled", "autoWithdrawThreshold", "paymentReminderEnabled", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, code, email, password, role, "employmentType", "companyId", "licenseNumber", "verifiedStatus", "emailVerified", "isBlocked", "blockedBy", "blockedAt", "blockReason", "blockNotes", "unblockedBy", "unblockedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification_tokens (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verifications (id, "userId", status, "photoUrl", "idDocumentUrl", "licenseUrl", "travelLicenseUrl", "proofOfAddressUrl", documents, "adminNotes", "rejectionReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (id, "userId", balance, "lockedDeposit", reserved, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdrawal_requests (id, "userId", amount, method, "paymentMethodId", "customAccountInfo", "accountOwnerName", status, "adminNotes", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: application_cancellations application_cancellations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_cancellations
    ADD CONSTRAINT application_cancellations_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_invitations company_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_invitations
    ADD CONSTRAINT company_invitations_pkey PRIMARY KEY (id);


--
-- Name: company_members company_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_members
    ADD CONSTRAINT company_members_pkey PRIMARY KEY (id);


--
-- Name: contract_acceptances contract_acceptances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_acceptances
    ADD CONSTRAINT contract_acceptances_pkey PRIMARY KEY (id);


--
-- Name: contract_history contract_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_history
    ADD CONSTRAINT contract_history_pkey PRIMARY KEY (id);


--
-- Name: contract_templates contract_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_templates
    ADD CONSTRAINT contract_templates_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: dispute_timelines dispute_timelines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_timelines
    ADD CONSTRAINT dispute_timelines_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: emergency_contacts emergency_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);


--
-- Name: emergency_reports emergency_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_reports
    ADD CONSTRAINT emergency_reports_pkey PRIMARY KEY (id);


--
-- Name: escrow_accounts escrow_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_accounts
    ADD CONSTRAINT escrow_accounts_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: guide_availabilities guide_availabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guide_availabilities
    ADD CONSTRAINT guide_availabilities_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: join_requests join_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.join_requests
    ADD CONSTRAINT join_requests_pkey PRIMARY KEY (id);


--
-- Name: lunavia_bank_accounts lunavia_bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lunavia_bank_accounts
    ADD CONSTRAINT lunavia_bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payment_milestones payment_milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_milestones
    ADD CONSTRAINT payment_milestones_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: safety_check_ins safety_check_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_check_ins
    ADD CONSTRAINT safety_check_ins_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: standby_requests standby_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standby_requests
    ADD CONSTRAINT standby_requests_pkey PRIMARY KEY (id);


--
-- Name: tax_records tax_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_records
    ADD CONSTRAINT tax_records_pkey PRIMARY KEY (id);


--
-- Name: topup_requests topup_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topup_requests
    ADD CONSTRAINT topup_requests_pkey PRIMARY KEY (id);


--
-- Name: tour_delete_requests tour_delete_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_delete_requests
    ADD CONSTRAINT tour_delete_requests_pkey PRIMARY KEY (id);


--
-- Name: tour_edit_requests tour_edit_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_edit_requests
    ADD CONSTRAINT tour_edit_requests_pkey PRIMARY KEY (id);


--
-- Name: tour_reports tour_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_reports
    ADD CONSTRAINT tour_reports_pkey PRIMARY KEY (id);


--
-- Name: tours tours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verifications verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT verifications_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_requests withdrawal_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id);


--
-- Name: accounts_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON public.accounts USING btree (provider, "providerAccountId");


--
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- Name: application_cancellations_applicationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "application_cancellations_applicationId_key" ON public.application_cancellations USING btree ("applicationId");


--
-- Name: applications_tourId_guideId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "applications_tourId_guideId_key" ON public.applications USING btree ("tourId", "guideId");


--
-- Name: assignments_tourId_guideId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "assignments_tourId_guideId_key" ON public.assignments USING btree ("tourId", "guideId");


--
-- Name: cities_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cities_code_key ON public.cities USING btree (code);


--
-- Name: cities_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cities_name_key ON public.cities USING btree (name);


--
-- Name: companies_businessLicenseNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "companies_businessLicenseNumber_key" ON public.companies USING btree ("businessLicenseNumber");


--
-- Name: companies_companyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "companies_companyId_key" ON public.companies USING btree ("companyId");


--
-- Name: companies_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX companies_email_key ON public.companies USING btree (email);


--
-- Name: companies_operatorId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "companies_operatorId_key" ON public.companies USING btree ("operatorId");


--
-- Name: companies_travelLicenseNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "companies_travelLicenseNumber_key" ON public.companies USING btree ("travelLicenseNumber");


--
-- Name: company_invitations_inviteToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "company_invitations_inviteToken_key" ON public.company_invitations USING btree ("inviteToken");


--
-- Name: company_members_guideId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "company_members_guideId_key" ON public.company_members USING btree ("guideId");


--
-- Name: contract_acceptances_contractId_guideId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "contract_acceptances_contractId_guideId_key" ON public.contract_acceptances USING btree ("contractId", "guideId");


--
-- Name: contract_history_contractId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contract_history_contractId_idx" ON public.contract_history USING btree ("contractId");


--
-- Name: contracts_tourId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "contracts_tourId_key" ON public.contracts USING btree ("tourId");


--
-- Name: conversations_tourId_operatorId_guideId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "conversations_tourId_operatorId_guideId_key" ON public.conversations USING btree ("tourId", "operatorId", "guideId");


--
-- Name: dispute_timelines_createdat_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dispute_timelines_createdat_idx ON public.dispute_timelines USING btree (createdat);


--
-- Name: dispute_timelines_disputeid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dispute_timelines_disputeid_idx ON public.dispute_timelines USING btree (disputeid);


--
-- Name: disputes_appealId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "disputes_appealId_key" ON public.disputes USING btree ("appealId");


--
-- Name: disputes_applicationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "disputes_applicationId_idx" ON public.disputes USING btree ("applicationId");


--
-- Name: disputes_escrowAccountId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "disputes_escrowAccountId_idx" ON public.disputes USING btree ("escrowAccountId");


--
-- Name: disputes_paymentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "disputes_paymentId_idx" ON public.disputes USING btree ("paymentId");


--
-- Name: disputes_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disputes_status_idx ON public.disputes USING btree (status);


--
-- Name: disputes_tourId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "disputes_tourId_idx" ON public.disputes USING btree ("tourId");


--
-- Name: emergency_contacts_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "emergency_contacts_userId_idx" ON public.emergency_contacts USING btree ("userId");


--
-- Name: emergency_reports_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "emergency_reports_createdAt_idx" ON public.emergency_reports USING btree ("createdAt");


--
-- Name: emergency_reports_guideId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "emergency_reports_guideId_idx" ON public.emergency_reports USING btree ("guideId");


--
-- Name: emergency_reports_severity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emergency_reports_severity_idx ON public.emergency_reports USING btree (severity);


--
-- Name: emergency_reports_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX emergency_reports_status_idx ON public.emergency_reports USING btree (status);


--
-- Name: emergency_reports_tourId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "emergency_reports_tourId_idx" ON public.emergency_reports USING btree ("tourId");


--
-- Name: escrow_accounts_guideId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "escrow_accounts_guideId_idx" ON public.escrow_accounts USING btree ("guideId");


--
-- Name: escrow_accounts_operatorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "escrow_accounts_operatorId_idx" ON public.escrow_accounts USING btree ("operatorId");


--
-- Name: escrow_accounts_tourId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "escrow_accounts_tourId_idx" ON public.escrow_accounts USING btree ("tourId");


--
-- Name: guide_availabilities_guideId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "guide_availabilities_guideId_date_key" ON public.guide_availabilities USING btree ("guideId", date);


--
-- Name: invoices_invoiceNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_invoiceNumber_idx" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: invoices_issuerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_issuerId_idx" ON public.invoices USING btree ("issuerId");


--
-- Name: invoices_paymentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_paymentId_key" ON public.invoices USING btree ("paymentId");


--
-- Name: invoices_recipientId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_recipientId_idx" ON public.invoices USING btree ("recipientId");


--
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- Name: join_requests_companyId_guideId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "join_requests_companyId_guideId_key" ON public.join_requests USING btree ("companyId", "guideId");


--
-- Name: payment_milestones_guideId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_milestones_guideId_idx" ON public.payment_milestones USING btree ("guideId");


--
-- Name: payment_milestones_tourId_guideId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payment_milestones_tourId_guideId_key" ON public.payment_milestones USING btree ("tourId", "guideId");


--
-- Name: payment_milestones_tourId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payment_milestones_tourId_idx" ON public.payment_milestones USING btree ("tourId");


--
-- Name: profiles_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "profiles_userId_key" ON public.profiles USING btree ("userId");


--
-- Name: reviews_isVerified_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_isVerified_idx" ON public.reviews USING btree ("isVerified");


--
-- Name: reviews_reviewerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_reviewerId_idx" ON public.reviews USING btree ("reviewerId");


--
-- Name: reviews_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_status_idx ON public.reviews USING btree (status);


--
-- Name: reviews_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_subjectId_idx" ON public.reviews USING btree ("subjectId");


--
-- Name: reviews_tourId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_tourId_idx" ON public.reviews USING btree ("tourId");


--
-- Name: safety_check_ins_guideId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "safety_check_ins_guideId_idx" ON public.safety_check_ins USING btree ("guideId");


--
-- Name: safety_check_ins_missed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX safety_check_ins_missed_idx ON public.safety_check_ins USING btree (missed);


--
-- Name: safety_check_ins_scheduledAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "safety_check_ins_scheduledAt_idx" ON public.safety_check_ins USING btree ("scheduledAt");


--
-- Name: safety_check_ins_tourId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "safety_check_ins_tourId_idx" ON public.safety_check_ins USING btree ("tourId");


--
-- Name: sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON public.sessions USING btree ("sessionToken");


--
-- Name: tax_records_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tax_records_invoiceId_idx" ON public.tax_records USING btree ("invoiceId");


--
-- Name: tax_records_taxPeriod_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tax_records_taxPeriod_idx" ON public.tax_records USING btree ("taxPeriod");


--
-- Name: tax_records_taxYear_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tax_records_taxYear_idx" ON public.tax_records USING btree ("taxYear");


--
-- Name: tour_reports_tourId_guideId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tour_reports_tourId_guideId_key" ON public.tour_reports USING btree ("tourId", "guideId");


--
-- Name: tours_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tours_code_key ON public.tours USING btree (code);


--
-- Name: user_settings_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_settings_userId_key" ON public.user_settings USING btree ("userId");


--
-- Name: users_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_code_key ON public.users USING btree (code);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: verification_tokens_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_tokens_identifier_token_key ON public.verification_tokens USING btree (identifier, token);


--
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- Name: wallets_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "wallets_userId_key" ON public.wallets USING btree ("userId");


--
-- Name: accounts accounts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_cancellations application_cancellations_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_cancellations
    ADD CONSTRAINT "application_cancellations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "applications_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignments assignments_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "assignments_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assignments assignments_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "assignments_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: companies companies_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT "companies_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_invitations company_invitations_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_invitations
    ADD CONSTRAINT "company_invitations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_invitations company_invitations_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_invitations
    ADD CONSTRAINT "company_invitations_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_members company_members_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_members
    ADD CONSTRAINT "company_members_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: company_members company_members_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_members
    ADD CONSTRAINT "company_members_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contract_acceptances contract_acceptances_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_acceptances
    ADD CONSTRAINT "contract_acceptances_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contract_acceptances contract_acceptances_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_acceptances
    ADD CONSTRAINT "contract_acceptances_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contract_history contract_history_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_history
    ADD CONSTRAINT "contract_history_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contracts contracts_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT "contracts_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.contract_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contracts contracts_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT "contracts_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: conversations conversations_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: conversations conversations_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT "conversations_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dispute_timelines dispute_timelines_actorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_timelines
    ADD CONSTRAINT dispute_timelines_actorid_fkey FOREIGN KEY (actorid) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dispute_timelines dispute_timelines_disputeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispute_timelines
    ADD CONSTRAINT dispute_timelines_disputeid_fkey FOREIGN KEY (disputeid) REFERENCES public.disputes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: disputes disputes_appealId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES public.disputes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_assignedTo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES public.admin_users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_escrowAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_escrowAccountId_fkey" FOREIGN KEY ("escrowAccountId") REFERENCES public.escrow_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT "disputes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: emergency_contacts emergency_contacts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT "emergency_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: emergency_reports emergency_reports_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_reports
    ADD CONSTRAINT "emergency_reports_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: emergency_reports emergency_reports_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emergency_reports
    ADD CONSTRAINT "emergency_reports_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: escrow_accounts escrow_accounts_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_accounts
    ADD CONSTRAINT "escrow_accounts_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: escrow_accounts escrow_accounts_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_accounts
    ADD CONSTRAINT "escrow_accounts_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: escrow_accounts escrow_accounts_paymentMilestoneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_accounts
    ADD CONSTRAINT "escrow_accounts_paymentMilestoneId_fkey" FOREIGN KEY ("paymentMilestoneId") REFERENCES public.payment_milestones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: escrow_accounts escrow_accounts_standbyRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_accounts
    ADD CONSTRAINT "escrow_accounts_standbyRequestId_fkey" FOREIGN KEY ("standbyRequestId") REFERENCES public.standby_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: escrow_accounts escrow_accounts_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escrow_accounts
    ADD CONSTRAINT "escrow_accounts_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: guide_availabilities guide_availabilities_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guide_availabilities
    ADD CONSTRAINT "guide_availabilities_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_issuerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_recipientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_standbyRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_standbyRequestId_fkey" FOREIGN KEY ("standbyRequestId") REFERENCES public.standby_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: join_requests join_requests_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.join_requests
    ADD CONSTRAINT "join_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: join_requests join_requests_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.join_requests
    ADD CONSTRAINT "join_requests_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_methods payment_methods_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_milestones payment_milestones_applicationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_milestones
    ADD CONSTRAINT "payment_milestones_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payment_milestones payment_milestones_assignmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_milestones
    ADD CONSTRAINT "payment_milestones_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES public.assignments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payment_milestones payment_milestones_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_milestones
    ADD CONSTRAINT "payment_milestones_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_milestones payment_milestones_milestone1PaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_milestones
    ADD CONSTRAINT "payment_milestones_milestone1PaymentId_fkey" FOREIGN KEY ("milestone1PaymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payment_milestones payment_milestones_milestone2PaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_milestones
    ADD CONSTRAINT "payment_milestones_milestone2PaymentId_fkey" FOREIGN KEY ("milestone2PaymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payment_milestones payment_milestones_milestone3PaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_milestones
    ADD CONSTRAINT "payment_milestones_milestone3PaymentId_fkey" FOREIGN KEY ("milestone3PaymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payment_milestones payment_milestones_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_milestones
    ADD CONSTRAINT "payment_milestones_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_escrowAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_escrowAccountId_fkey" FOREIGN KEY ("escrowAccountId") REFERENCES public.escrow_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_fromWalletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_standbyRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_standbyRequestId_fkey" FOREIGN KEY ("standbyRequestId") REFERENCES public.standby_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_toWalletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: profiles profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: safety_check_ins safety_check_ins_emergencyReportId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_check_ins
    ADD CONSTRAINT "safety_check_ins_emergencyReportId_fkey" FOREIGN KEY ("emergencyReportId") REFERENCES public.emergency_reports(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: safety_check_ins safety_check_ins_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_check_ins
    ADD CONSTRAINT "safety_check_ins_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: safety_check_ins safety_check_ins_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_check_ins
    ADD CONSTRAINT "safety_check_ins_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: standby_requests standby_requests_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.standby_requests
    ADD CONSTRAINT "standby_requests_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tax_records tax_records_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_records
    ADD CONSTRAINT "tax_records_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: topup_requests topup_requests_paymentMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topup_requests
    ADD CONSTRAINT "topup_requests_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: topup_requests topup_requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topup_requests
    ADD CONSTRAINT "topup_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_delete_requests tour_delete_requests_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_delete_requests
    ADD CONSTRAINT "tour_delete_requests_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_delete_requests tour_delete_requests_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_delete_requests
    ADD CONSTRAINT "tour_delete_requests_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_edit_requests tour_edit_requests_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_edit_requests
    ADD CONSTRAINT "tour_edit_requests_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_edit_requests tour_edit_requests_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_edit_requests
    ADD CONSTRAINT "tour_edit_requests_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_reports tour_reports_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_reports
    ADD CONSTRAINT "tour_reports_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_reports tour_reports_tourId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_reports
    ADD CONSTRAINT "tour_reports_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tours tours_operatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT "tours_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_settings user_settings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: verifications verifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verifications
    ADD CONSTRAINT "verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallets wallets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: withdrawal_requests withdrawal_requests_paymentMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT "withdrawal_requests_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: withdrawal_requests withdrawal_requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT "withdrawal_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict aXjoKD5aCtZDSijOFPyB31n7FskeHAi8jpLhnwebHL74XV9uSKVOT7HINK1hs9U

