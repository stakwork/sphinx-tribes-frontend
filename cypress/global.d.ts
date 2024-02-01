declare namespace Cypress {
  interface Chainable {
    login(userAlias: string): void;
    logout(userAlias: string): void;
  }

  type Bounty = {
    organization?: string;
    title: string;
    github_issue_url?: string;
    category: string;
    coding_language?: string[];
    description: string;
    amount: number;
    tribe?: string;
    estimate_session_length?: string;
    estimate_completion_date?: string;
    deliverables?: string;
    assign?: string;
  };
}
