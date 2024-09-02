declare namespace Cypress {
  interface Chainable {
    login(userAlias: string): void;
    haves_phinx_login(userAlias: string): void;
    logout(userAlias: string): void;
    create_bounty(bounty: Bounty, clickMethod?: 'contains' | 'testId'): void;
    create_workspace_bounty(workspaceBounty: Bounty): void;
    lnurl_login(seed?: string): Chainable<string>;
    create_workspace(Workspace: Workspace): void;
    pay_invoice(details: InvoiceDetail): void;
    add_invoice(details: AddInvoice): Promise<any>;
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
    workspace?: string;
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

  type Workspace = {
    loggedInAs: string;
    name: string;
    description: string;
    website?: string;
    github?: string;
  };

  type InvoiceDetail = {
    invoice: string;
  };

  type AddInvoice = {
    amount: number;
  };
}
