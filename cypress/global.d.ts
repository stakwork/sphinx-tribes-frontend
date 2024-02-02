declare namespace Cypress {
  interface Chainable {
    login(userAlias: string): void;
    logout(userAlias: string): void;
    create_bounty(bounty: Bounty): void;
  }

  type Category =
    | 'Web development'
    | 'Mobile development'
    | 'Design'
    | 'Desktop app'
    | 'Dev ops'
    | 'Bitcoin / Lightning'
    | 'Other';

  type Bounty = {
    organization?: string;
    title: string;
    github_issue_url?: string;
    category: Category;
    coding_language?: string[];
    description: string;
    amount: string;
    tribe?: string;
    estimate_session_length?: string;
    estimate_completion_date?: string; // MM/DD/YYYY
    deliverables?: string;
    assign?: string;
  };
}
