declare namespace Cypress {
  interface Chainable {
    login(userAlias: string): void;
    logout(userAlias: string): void;
    create_bounty(bounty: Bounty): void;
    lnurl_login(): void;
    create_org(Organization: Organization): void;
    pay_invoice(details: InvoiceDetail): void;
    assert_org_bounty(bounty: Bounty, organization: string): void;
  }

  type Category =
    | 'Web development'
    | 'Mobile development'
    | 'Design'
    | 'Desktop app'
    | 'Dev ops'
    | 'Bitcoin / Lightning'
    | 'Other';

  type EstimateSessionLength =
    | 'Less than 1 hour'
    | 'Less than 3 hour'
    | 'More than 3 hour'
    | 'Not sure yet';

  type Bounty = {
    organization?: string;
    title: string;
    github_issue_url?: string;
    category: Category;
    coding_language?: string[];
    description: string;
    amount: string;
    tribe?: string;
    estimate_session_length?: EstimateSessionLength;
    estimate_completion_date?: string; // MM/DD/YYYY
    deliverables?: string;
    assign?: string;
  };

  type Organization = {
    loggedInAs: string;
    name: string;
    description: string;
    website?: string;
    github?: string;
  };

  type InvoiceDetail = {
    payersName: string;
    invoice: string;
  };
}
