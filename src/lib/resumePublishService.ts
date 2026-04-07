import type { ForkRepository, PublishCallbacks, PublishError, PublishResult, PublishState } from "@/lib/types/resumePublish";

const GITHUB_API = "https://api.github.com";
const UPSTREAM_OWNER = "carlosrichardgeraldine";
const UPSTREAM_REPO = "my-link-gallery";
const UPSTREAM_FULL_NAME = `${UPSTREAM_OWNER}/${UPSTREAM_REPO}`;
const RESUME_PATH = "src/pages/Resume.tsx";

type GithubUser = {
  login: string;
};

type GithubRepo = {
  name: string;
  full_name: string;
  default_branch: string;
  owner: { login: string };
  parent?: { full_name?: string };
  fork?: boolean;
};

const mapRepository = (repo: GithubRepo): ForkRepository => ({
  owner: repo.owner.login,
  name: repo.name,
  defaultBranch: repo.default_branch,
  fullName: repo.full_name,
});

const toBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
};

const parseError = async (response: Response) => {
  let details = "";

  try {
    const data = (await response.json()) as { message?: string };
    details = data.message ?? "";
  } catch {
    details = "";
  }

  return details;
};

const createPublishError = (error: PublishError): never => {
  throw error;
};

const apiRequest = async <T>(path: string, token: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${GITHUB_API}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    createPublishError({
      code: "network_or_cors",
      message: "GitHub API is unreachable from this browser session.",
      details: error instanceof Error ? error.message : "Unknown network error.",
    });
  }

  if (!response.ok) {
    const details = await parseError(response);

    if (response.status === 401) {
      createPublishError({
        code: "auth_failed",
        message: "Authentication failed. Check your GitHub token permissions.",
        details,
      });
    }

    createPublishError({
      code: "unexpected",
      message: "GitHub API request failed.",
      details,
    });
  }

  return (await response.json()) as T;
};

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const findExistingTargetRepository = async (token: string, userLogin: string): Promise<ForkRepository | null> => {
  const directRepoPath = `/repos/${userLogin}/${UPSTREAM_REPO}`;

  try {
    const directRepo = await apiRequest<GithubRepo>(directRepoPath, token);

    if (directRepo.full_name === UPSTREAM_FULL_NAME) {
      return mapRepository(directRepo);
    }

    if (directRepo.fork && directRepo.parent?.full_name === UPSTREAM_FULL_NAME) {
      return mapRepository(directRepo);
    }
  } catch {
    // Continue to repo search if the direct path is missing.
  }

  const repositories = await apiRequest<GithubRepo[]>("/user/repos?per_page=100&affiliation=owner", token);

  const matchedFork = repositories.find((repo) => repo.fork && repo.parent?.full_name === UPSTREAM_FULL_NAME);

  if (!matchedFork) {
    return null;
  }

  return mapRepository(matchedFork);
};

const createForkAndResolve = async (token: string, userLogin: string): Promise<ForkRepository> => {
  try {
    await apiRequest<GithubRepo>(`/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/forks`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        default_branch_only: true,
      }),
    });
  } catch (error) {
    const publishError = error as PublishError;
    const details = (publishError.details ?? "").toLowerCase();

    if (userLogin === UPSTREAM_OWNER || details.includes("cannot fork") || details.includes("own repository")) {
      const upstream = await apiRequest<GithubRepo>(`/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}`, token);
      return mapRepository(upstream);
    }

    createPublishError({
      code: "fork_create_failed",
      message: "Unable to create a fork for this account.",
      details: publishError.details,
    });
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const resolved = await findExistingTargetRepository(token, userLogin);

    if (resolved) {
      return resolved;
    }

    await wait(1200);
  }

  createPublishError({
    code: "fork_create_failed",
    message: "Fork creation did not complete in time.",
    details: "Please retry publish in a few seconds.",
  });
};

const resolveTargetRepository = async (token: string): Promise<ForkRepository> => {
  const user = await apiRequest<GithubUser>("/user", token);

  const existingTarget = await findExistingTargetRepository(token, user.login);

  if (existingTarget) {
    return existingTarget;
  }

  if (user.login === UPSTREAM_OWNER) {
    const upstream = await apiRequest<GithubRepo>(`/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}`, token);
    return mapRepository(upstream);
  }

  return createForkAndResolve(token, user.login);
};

const createBranchFromDefault = async (fork: ForkRepository, token: string, branch: string) => {
  const refPath = `/repos/${fork.owner}/${fork.name}/git/ref/heads/${encodeURIComponent(fork.defaultBranch)}`;
  const refData = await apiRequest<{ object: { sha: string } }>(refPath, token);

  const createRefPath = `/repos/${fork.owner}/${fork.name}/git/refs`;

  try {
    await apiRequest<{ ref: string; object: { sha: string } }>(createRefPath, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha: refData.object.sha,
      }),
    });
  } catch (error) {
    if ((error as PublishError).code === "unexpected") {
      createPublishError({
        code: "branch_create_failed",
        message: "Unable to create a branch in the target repository.",
        details: (error as PublishError).details,
      });
    }

    throw error;
  }
};

const commitResumeFile = async (fork: ForkRepository, token: string, branch: string, resumeSource: string) => {
  const contentPath = `/repos/${fork.owner}/${fork.name}/contents/${RESUME_PATH}?ref=${encodeURIComponent(branch)}`;
  const existing = await apiRequest<{ sha: string }>(contentPath, token);

  try {
    const updatePath = `/repos/${fork.owner}/${fork.name}/contents/${RESUME_PATH}`;

    const response = await apiRequest<{ content: { html_url: string } }>(updatePath, token, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "chore: update resume from builder",
        content: toBase64(resumeSource),
        branch,
        sha: existing.sha,
      }),
    });

    return response.content.html_url;
  } catch (error) {
    if ((error as PublishError).code === "unexpected") {
      createPublishError({
        code: "commit_failed",
        message: "Unable to commit Resume.tsx in the target repository.",
        details: (error as PublishError).details,
      });
    }

    throw error;
  }
};

const createOrReusePullRequest = async (fork: ForkRepository, token: string, branch: string) => {
  const head = fork.fullName === UPSTREAM_FULL_NAME ? branch : `${fork.owner}:${branch}`;

  const existingPath = `/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/pulls?state=open&head=${encodeURIComponent(head)}&base=main`;
  const existing = await apiRequest<Array<{ html_url: string; number: number }>>(existingPath, token);

  if (existing.length > 0) {
    return {
      url: existing[0].html_url,
      number: existing[0].number,
      wasExistingPr: true,
    };
  }

  try {
    const createPath = `/repos/${UPSTREAM_OWNER}/${UPSTREAM_REPO}/pulls`;
    const created = await apiRequest<{ html_url: string; number: number }>(createPath, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Resume Builder update",
        head,
        base: "main",
        body: "This PR updates src/pages/Resume.tsx using the in-app Resume Builder publish flow.",
      }),
    });

    return {
      url: created.html_url,
      number: created.number,
      wasExistingPr: false,
    };
  } catch (error) {
    if ((error as PublishError).code === "unexpected") {
      createPublishError({
        code: "pr_failed",
        message: "Unable to create a pull request against upstream main.",
        details: (error as PublishError).details,
      });
    }

    throw error;
  }
};

const createBranchName = () => {
  const stamp = Date.now().toString();
  return `resume-builder/update-${stamp}`;
};

const createUniqueBranch = async (fork: ForkRepository, token: string) => {
  const base = createBranchName();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt}`;

    try {
      await createBranchFromDefault(fork, token, candidate);
      return candidate;
    } catch (error) {
      const publishError = error as PublishError;
      const alreadyExists =
        publishError.code === "branch_create_failed" &&
        (publishError.details ?? "").toLowerCase().includes("reference already exists");

      if (!alreadyExists) {
        throw error;
      }
    }
  }

  createPublishError({
    code: "branch_create_failed",
    message: "Unable to create a unique branch for publishing.",
    details: "Repeated branch collisions occurred in your fork.",
  });
};

const notifyState = (callbacks: PublishCallbacks | undefined, state: PublishState) => {
  callbacks?.onStateChange?.(state);
};

export const publishResumeToFork = async (
  token: string,
  resumeSource: string,
  callbacks?: PublishCallbacks
): Promise<PublishResult> => {
  notifyState(callbacks, "validating");

  notifyState(callbacks, "preparing");
  const fork = await resolveTargetRepository(token);
  const branch = await createUniqueBranch(fork, token);

  notifyState(callbacks, "committing");
  const commitUrl = await commitResumeFile(fork, token, branch, resumeSource);

  notifyState(callbacks, "creating_pr");
  const pullRequest = await createOrReusePullRequest(fork, token, branch);

  notifyState(callbacks, "success");

  return {
    fork,
    branch,
    commitUrl,
    pullRequestUrl: pullRequest.url,
    pullRequestNumber: pullRequest.number,
    wasExistingPr: pullRequest.wasExistingPr,
  };
};
