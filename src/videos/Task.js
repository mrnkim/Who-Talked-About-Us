import { useQuery } from "@tanstack/react-query";
import TwelveLabsApi from "../api/api";
import { Container } from "react-bootstrap";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import ErrorFallback from "../common/ErrorFallback";
import completeIcon from "../svg/Complete.svg";
import { useEffect } from "react";
import { keys } from "../api/keys";

export function Task({ taskId, setCompleteTasks, setFailedTasks }) {
  const query = {
    queryKey: [keys.TASK, taskId],
    queryFn: () => TwelveLabsApi.getTask(taskId),
    refetchOnWindowFocus: false,
    refetchInterval: (task) => (task.status === "ready" ? false : 5000),
    refetchIntervalInBackground: true,
    enabled: true,
  };

  const { data: task, refetch } = useQuery(query);

  useEffect(() => {
    if (task?.status === "ready") {
      setCompleteTasks((prev) => [...prev, task]);
      refetch({ enabled: false }); // Disable further refetching
    }
    if (task?.status === "failed") {
      setFailedTasks((prev) => [...prev, task]);
      refetch({ enabled: false }); // Disable further refetching
    }
  }, [task, refetch, setCompleteTasks, setFailedTasks]);

  return (
    <Container className="indexingStatusContainer" key={taskId}>
      {!task && (
        <div className="doNotLeaveMessageWrapper">
          <div className="doNotLeaveMessage">There is no task.</div>
        </div>
      )}
      {task && (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => refetch()}
          resetKeys={[keys.TASK]}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Container
              variant="body2"
              color="text.secondary"
              display="flex"
              alignitems="center"
              className="indexingStatus"
            >
              {task?.status === "ready" && (
                <div className="statusMessage doneMessage">
                  {completeIcon && (
                    <img src={completeIcon} alt="Icon" className="icon" />
                  )}
                  Complete{" "}
                </div>
              )}

              {!task?.process && task?.status !== "ready" && (
                <div className="statusMessage">
                  <LoadingSpinner />
                  {task?.status}...
                </div>
              )}

              {task?.process && (
                <div className="statusMessage">
                  <LoadingSpinner />
                  {task?.status}...{" "}
                  {Math.round(task?.process.upload_percentage)}%
                </div>
              )}
            </Container>
          </Suspense>
        </ErrorBoundary>
      )}
    </Container>
  );
}
