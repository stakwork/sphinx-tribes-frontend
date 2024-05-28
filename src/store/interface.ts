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
}

export type WorkspaceTransactionType = 'deposit' | 'payment' | 'withdraw';

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
}

export interface BountyStatus {
  Open: boolean;
  Assigned: boolean;
  Completed: boolean;
  Paid: boolean;
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
  priority: any;
  id: number;
  uuid: string;
  workspace_uuid: string;
  name: string;
  brief: string;
  requirements: string;
  architecture: string;
  url: string;
  created: string;
  updated: string;
  created_by: string;
  updated_by: string;
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

export interface CreateFeatureInput {
  uuid?: string;
  workspace_uuid: string;
  name?: string;
  brief?: string;
  requirements?: string;
  architecture?: string;
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
  Completed: false
};

export const defaultSuperAdminBountyStatus: BountyStatus = {
  Open: false,
  Assigned: false,
  Completed: false,
  Paid: false
};

export const defaultBountyStatus: BountyStatus = {
  Open: true,
  Assigned: false,
  Completed: false,
  Paid: false
};

export const queryLimitTribes = 100;
export const queryLimit = 10;
export const orgQuerLimit = 500;
export const paginationQueryLimit = 20;
export const peopleQueryLimit = 500;
export const featureLimit = 3;
