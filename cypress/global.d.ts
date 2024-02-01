declare namespace Cypress {
  interface Chainable {
    login(userAlias: string): void;
    logout(userAlias: string): void;
    create_bounty(bounty: Bounty): void;
  }

  type Bounty = {
    organization?: string;
    title: string;
    github_issue_url?: string;
    category: string;
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
