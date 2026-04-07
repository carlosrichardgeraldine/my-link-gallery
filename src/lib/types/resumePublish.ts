export type PublishState =
  | "idle"
  | "validating"
  | "preparing"
  | "committing"
  | "creating_pr"
  | "success"
  | "error";

export type PublishErrorCode =
  | "auth_failed"
  | "fork_not_found"
  | "fork_create_failed"
  | "branch_create_failed"
  | "commit_failed"
  | "pr_failed"
  | "network_or_cors"
  | "unexpected";

export type PublishError = {
  code: PublishErrorCode;
  message: string;
  details?: string;
};

export type ForkRepository = {
  owner: string;
  name: string;
  defaultBranch: string;
  fullName: string;
};

export type PublishResult = {
  fork: ForkRepository;
  branch: string;
  commitUrl: string;
  pullRequestUrl: string;
  pullRequestNumber: number;
  wasExistingPr: boolean;
};

export type PublishCallbacks = {
  onStateChange?: (state: PublishState) => void;
};
