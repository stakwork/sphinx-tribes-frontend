export type Bounty = {
  id: number;
  bounty_id: number;
  title: string;
  date: string;
  bounty_created: string;
  paid_date: string;
  dtgp: number;
  assignee: string;
  assigneeImage: string;
  provider: string;
  providerImage: string;
  organization_name: string;
  organizationImage: string;
  status: string;
  assignee_alias: string;
  paid: boolean;
};

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
  photo_url?: string;
  alias?: string;
  route_hint?: string;
  owner_route_hint?: string;
  owner_contact_key?: string;
  price_to_meet: number;
  last_login?: number;
  url?: string;
  verification_signature?: string;
  hide?: boolean;
  commitment_fee?: number;
  assigned_hours?: number;
  bounty_expires?: number;
}
