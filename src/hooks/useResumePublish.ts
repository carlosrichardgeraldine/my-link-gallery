import { useMemo, useState } from "react";
import { publishResumeToFork } from "@/lib/resumePublishService";
import type { PublishError, PublishResult, PublishState } from "@/lib/types/resumePublish";

type UseResumePublishReturn = {
  state: PublishState;
  error: PublishError | null;
  result: PublishResult | null;
  statusLabel: string;
  publish: (token: string, resumeSource: string) => Promise<PublishResult | null>;
  reset: () => void;
};

const statusLabels: Record<PublishState, string> = {
  idle: "",
  validating: "Validating token and account access...",
  preparing: "Preparing a branch in your fork...",
  committing: "Committing Resume.tsx to your fork branch...",
  creating_pr: "Creating pull request against upstream main...",
  success: "Publish completed.",
  error: "Publish failed.",
};

export const useResumePublish = (): UseResumePublishReturn => {
  const [state, setState] = useState<PublishState>("idle");
  const [error, setError] = useState<PublishError | null>(null);
  const [result, setResult] = useState<PublishResult | null>(null);

  const reset = () => {
    setState("idle");
    setError(null);
    setResult(null);
  };

  const publish = async (token: string, resumeSource: string) => {
    setState("validating");
    setError(null);
    setResult(null);

    try {
      const publishResult = await publishResumeToFork(token, resumeSource, {
        onStateChange: setState,
      });

      setResult(publishResult);
      return publishResult;
    } catch (caughtError) {
      const publishError: PublishError =
        caughtError && typeof caughtError === "object" && "code" in caughtError && "message" in caughtError
          ? (caughtError as PublishError)
          : {
              code: "unexpected",
              message: "Unexpected publish error.",
            };

      setState("error");
      setError(publishError);
      return null;
    }
  };

  const statusLabel = useMemo(() => statusLabels[state], [state]);

  return {
    state,
    error,
    result,
    statusLabel,
    publish,
    reset,
  };
};
