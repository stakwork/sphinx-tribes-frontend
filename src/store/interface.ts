import { Phase } from 'people/widgetViews/workspace/interface';
import { Extras } from '../components/form/inputs/widgets/interfaces';

export interface Tribe {
  uuid: string;
  name: string;
  unique_name: string;
  owner: string;
  pubkey: string; // group encryption key
  price: number;
  img: string;
  tags: string[];
  description: string;
  member_count: number;
  last_active: number;
  matchCount?: number; // for tag search
}

export interface Bot {
  id?: number;
  uuid: string;
  name: string;
  owner_pubkey: string;
  unique_name: string;
  price_per_use: number;
  created: string;
  updated: string;
  unlisted: boolean;
  deleted: boolean;
  owner_route_hint: string;
  owner: string;
  pubkey: string; // group encryption key
  price: number;
  img: string;
  tags: string[];
  description: string;
  member_count: number;
  hide?: boolean;
}

export interface Person {
  id: number;
  unique_name: string;
  owner_pubkey: string;
  uuid: string;
  owner_alias: string;
  description: string;
  img: string;
  tags: string[];
  pubkey?: string;
  photo_url: string;
  alias: string;
  route_hint: string;
  owner_route_hint?: string;
  contact_key: string;
  price_to_meet: number;
  last_login?: number;
  url: string;
  verification_signature: string;
  extras: Extras;
  hide?: boolean;
  commitment_fee?: number;
  assigned_hours?: number;
  bounty_expires?: number;
}

export interface WorkspaceUser {
  id: number;
  owner_pubkey: string;
  org_uuid: string;
  created: string;
  updated: string;
}

export interface PersonFlex {
  id?: number;
  unique_name?: string;
  owner_pubkey?: string;
  owner_alias?: string;
  description?: string;
  img?: string;
  tags?: string[];
  pubkey?: string;
  photo_url?: string;
  alias?: string;
  route_hint?: string;
  contact_key?: string;
  last_login?: number;
  price_to_meet?: number;
  url?: string;
  verification_signature?: string;
  extras?: Extras;
  hide?: boolean;
}

export interface PersonPost {
  person: PersonFlex;
  title?: string;
  description?: string;
  created: number;
}

export interface PersonBounty {
  person?: any;
  body?: any;
  org_uuid?: any;
  title?: string;
  description?: string;
  owner_id: string;
  created?: number;
  show?: boolean;
  assignee?: any;
  wanted_type: string;
  type?: string;
  price?: string;
  codingLanguage: string;
  estimated_session_length: string;
  bounty_expires?: string;
  commitment_fee?: number;
  feature_uuid?: string;
  phase_uuid?: string;
  text_snippet_id?: string;
}

export type WorkspaceTransactionType = 'deposit' | 'payment' | 'withdraw' | 'failed' | 'pending';

export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface PaymentHistory {
  id: number;
  bounty_id: number;
  amount: number;
  workspace_uuid: string;
  sender_name: string;
  sender_pubkey: string;
  sender_img: string;
  receiver_name: string;
  receiver_pubkey: string;
  receiver_img: string;
  created: string;
  updated: string;
  payment_type: WorkspaceTransactionType;
  status: boolean;
  payment_status?: PaymentStatus;
  error?: string;
}

export interface BudgetHistory {
  id: number;
  amount: number;
  org_uuid: string;
  payment_type: string;
  created: string;
  updated: string;
  sender_pub_key: string;
  sender_name: string;
  status: boolean;
}

export interface PersonOffer {
  person: PersonFlex;
  title: string;
  description: string;
  created: number;
}

export interface Jwt {
  jwt: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  direction?: string;
  search?: string;
  resetPage?: boolean;
  languages?: string;
  org_uuid?: string;
  provider?: string;
  workspace?: string;
  status?: string;
}

export interface ClaimOnLiquid {
  asset: number;
  to: string;
  amount?: number;
  memo: string;
}

export interface LnAuthData {
  encode: string;
  k1: string;
}

export interface LnInvoice {
  success: boolean;
  response: {
    invoice: string;
  };
}

export interface Workspace {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  github?: string;
  website?: string;
  owner_pubkey: string;
  img: string;
  mission?: string;
  tactics?: string;
  schematic_url?: string;
  schematic_img?: string;
  created: string;
  updated: string;
  show: boolean;
  bounty_count?: number;
  budget?: number;
  deleted?: boolean;
}

export interface CreateWorkspaceInput {
  img: string;
  name: string;
  description?: string;
  github?: string;
  website?: string;
}

export interface BountyRoles {
  name: string;
}

export interface InvoiceDetails {
  success: boolean;
  response: {
    settled: boolean;
    payment_request: string;
    payment_hash: string;
    preimage: string;
    amount: number;
  };
}

export interface InvoiceError {
  success: boolean;
  error: string;
}

export interface BudgetWithdrawSuccess {
  success: boolean;
  response: {
    success: boolean;
    response: {
      payment_request: string;
    };
  };
}

export interface FilterStatusCount {
  assigned: number;
  paid: number;
  open: number;
}

export interface BountyMetrics {
  bounties_posted: number;
  bounties_paid: number;
  bounties_assigned?: number;
  bounties_paid_average: number;
  sats_posted: number;
  sats_paid: number;
  sats_paid_percentage: number;
  average_paid: number;
  average_completed: number;
  unique_hunters_paid: number;
  new_hunters_paid: number;
  new_hunters: number;
  new_hunters_by_period: number;
}

export interface BountyStatus {
  Open: boolean;
  Assigned: boolean;
  Completed: boolean;
  Paid: boolean;
  Pending: boolean;
  Failed: boolean;
}

export interface WorkspaceBudget {
  org_uuid: string;
  current_budget: number;
  open_budget: number;
  open_count: number;
  assigned_budget: number;
  assigned_count: number;
  completed_budget: number;
  completed_count: number;
}

export interface Feature {
  id: number;
  uuid: string;
  workspace_uuid: string;
  name: string;
  brief: string;
  requirements: string;
  architecture: string;
  url: string;
  priority: number;
  bounties_count_assigned: number;
  bounties_count_completed: number;
  bounties_count_open: number;
  created: string;
  updated: string;
  created_by: string;
  updated_by: string;
  feat_status?: string;
}

export interface FeatureStory {
  id?: number;
  uuid: string;
  feature_uuid: string;
  description: string;
  priority: number;
  created: string;
  updated: string;
  created_by: string;
  updated_by: string;
}
export interface CreateFeatureStoryInput {
  feature_uuid: string;
  description: string;
  priority?: number;
}

export interface UpdateFeatureStoryInput {
  uuid: string;
  priority: number;
}

export interface CreateFeatureInput {
  uuid?: string;
  workspace_uuid: string;
  name?: string;
  brief?: string;
  requirements?: string;
  architecture?: string;
  priority?: number;
}

// Default data
export const defaultWorkspaceBudget: WorkspaceBudget = {
  org_uuid: '',
  current_budget: 0,
  open_budget: 0,
  open_count: 0,
  assigned_budget: 0,
  assigned_count: 0,
  completed_budget: 0,
  completed_count: 0
};

export const defaultWorkspaceBountyStatus: BountyStatus = {
  Open: false,
  Assigned: false,
  Paid: false,
  Completed: false,
  Pending: false,
  Failed: false
};

export const defaultSuperAdminBountyStatus: BountyStatus = {
  Open: false,
  Assigned: false,
  Completed: false,
  Paid: false,
  Pending: false,
  Failed: false
};

export const defaultBountyStatus: BountyStatus = {
  Open: true,
  Assigned: false,
  Completed: false,
  Paid: false,
  Pending: false,
  Failed: false
};

export const queryLimitTribes = 100;
export const queryLimit = 25;
export const orgQuerLimit = 500;
export const paginationQueryLimit = 25;
export const peopleQueryLimit = 500;
export const featureLimit = 500;
export const phaseBountyLimit = 3;

export type TicketStatus =
  | 'DRAFT'
  | 'READY'
  | 'IN_PROGRESS'
  | 'TEST'
  | 'DEPLOY'
  | 'PAY'
  | 'COMPLETE';

export type Author = 'HUMAN' | 'AGENT';

export type TicketCategory = 'Web development' | 'Backend development' | 'Design' | 'Other';

export const TICKET_CATEGORIES = {
  WEB_DEV: 'Web development',
  BACKEND_DEV: 'Backend development',
  DESIGN: 'Design',
  OTHER: 'Other'
} as const;

export interface Ticket {
  uuid: string;
  UUID?: string;
  ticketUUID?: string;
  feature_uuid: string;
  phase_uuid: string;
  name: string;
  sequence: number;
  dependency?: string[];
  description: string;
  status: TicketStatus;
  version: number;
  ticket_group?: string;
  amount?: number;
  category?: string;
  author?: Author;
  author_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTicketInput {
  feature_uuid: string;
  phase_uuid: string;
  name: string;
  description: string;
  sequence?: number;
  dependency?: string[];
  status?: TicketStatus;
}

export interface UpdateTicketInput {
  uuid: string;
  name?: string;
  description?: string;
  sequence?: number;
  dependency?: string[];
  status?: TicketStatus;
  version?: number;
  amount?: number;
  category?: TicketCategory;
}

export interface TicketMessage {
  broadcastType: 'pool' | 'direct';
  sourceSessionID: string;
  message: string;
  action: 'process' | 'message' | 'run-link' | 'swrun';
  ticketDetails: Ticket;
}

export interface TicketPayload {
  metadata: {
    source: string;
    id: string;
  };
  ticket: Ticket;
}

export type ChatRole = 'user' | 'assistant';
export type ChatStatus = 'sending' | 'sent' | 'error';
export type ContextTagType = 'productBrief' | 'featureBrief' | 'schematic';
export type ChatSource = 'user' | 'agent';
export type BountyCardStatus =
  | 'DRAFT'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'PAID';

export interface ContextTag {
  type: ContextTagType;
  id: string;
}

export interface ChatMessage {
  id: string;
  chat_id?: string;
  chatId?: string;
  message: string;
  role: ChatRole;
  timestamp: string | Date;
  context_tags?: ContextTag[];
  contextTags?: ContextTag[];
  status: ChatStatus;
  source: ChatSource;
  sourceWebsocketID?: string;
  workspaceUUID?: string;
}

export interface Chat {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeGraph {
  id?: number;
  uuid: string;
  workspace_uuid: string;
  name: string;
  url: string;
  secret_alias: string;
  created?: string;
  updated?: string;
}

export interface BountyCard {
  id: string;
  title: string;
  features: Feature;
  phase: Phase;
  workspace: Workspace;
  assignee_img?: string;
  status?: BountyCardStatus;
  paid?: boolean;
  completed?: boolean;
  payment_pending?: boolean;
  assignee?: any;
  assignee_name?: string;
  pow?: number;
  ticket_uuid?: string;
  ticket_group?: string;
  bounty_price?: number;
}

export type BountyReviewStatus = 'New' | 'Accepted' | 'Rejected' | 'Change Requested';

export interface ProofOfWork {
  id: string;
  bountyId: string;
  description: string;
  status: BountyReviewStatus;
  submittedAt: string;
}

export interface BountyTiming {
  total_work_time_seconds: number;
  total_duration_seconds: number;
  total_attempts: number;
  first_assigned_at: string;
  last_pow_at: string | null;
  is_paused: boolean;
  is_paused_at: string | null;
  closed_at: string | null;
  accumulated_pause_seconds: number;
}

export interface CreateBountyResponse {
  bounty_id: number;
  success: boolean;
  message?: string;
}

export interface Endpoint {
  uuid: string;
  path: string;
}

export interface FeatureFlag {
  uuid: string;
  name: string;
  description: string;
  enabled: boolean;
  endpoints: Endpoint[];
}

export interface FeaturedBounty {
  bountyId: string;
  url: string;
  addedAt: number;
  title?: string | undefined;
}

export interface ConnectionCodesList {
  id?: number;
  connection_string: string;
  pubkey: string;
  sats_amount: number;
  date_created: string;
  is_used: boolean;
  route_hint?: string;
}

export interface ConnectionCodesListResponse {
  success: boolean;
  data: {
    codes: ConnectionCodesList[];
    total: number;
  };
}

export type AuthorType = 'human' | 'hive';

export type ContentType =
  | 'feature_creation'
  | 'story_update'
  | 'requirement_change'
  | 'general_update';

export interface IActivity {
  ID: string;
  thread_id: string | null;
  sequence: number;
  content_type: ContentType;
  content: string;
  title?: string;
  workspace: string;
  feature_uuid: string;
  phase_uuid: string;
  feedback?: string;
  actions: string[];
  questions: string[];
  time_created: string;
  time_updated: string;
  status: string;
  author: AuthorType;
  author_ref: string;
}

export interface INewActivity {
  content: string;
  content_type: ContentType;
  workspace: string;
  feature_uuid?: string;
  phase_uuid?: string;
  author: AuthorType;
  author_ref: string;
  thread_id?: string;
  question?: string;
  title?: string;
}

export interface IActivityResponse {
  data: IActivity[];
  success: boolean;
}

export interface QuickBountyItem {
  bountyID: number;
  bountyTitle: string;
  status: string;
  assignedAlias?: string;
  phaseID?: string;
}

export interface QuickBountiesResponse {
  featureID: string;
  phases: { [key: string]: QuickBountyItem[] };
  unphased: QuickBountyItem[];
}

export interface QuickTicketItem {
  ticketUUID: string;
  ticketTitle: string;
  status: string;
  assignedAlias?: string;
  phaseID?: string;
}

export interface QuickTicketsResponse {
  featureID: string;
  phases: { [key: string]: QuickTicketItem[] };
  unphased: QuickTicketItem[];
}

export interface TicketToBountyItem {
  ticketUUID: string;
}

export interface BulkTicketToBountyRequest {
  tickets_to_bounties: TicketToBountyItem[];
}

export interface BulkConversionResult {
  bounty_id?: number;
  success: boolean;
  message: string;
}

export interface BulkConversionResponse {
  results: BulkConversionResult[];
  success: boolean;
  message: string;
}
