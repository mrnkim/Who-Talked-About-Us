import { Container } from "react-bootstrap";
import LoadingSpinner from "../common/LoadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import ErrorFallback from "../common/ErrorFallback";
import completeIcon from "../svg/Complete.svg";
import { useEffect } from "react";
import keys from "../apiHooks/keys";
import { useGetTask } from "../apiHooks/apiHooks";
import { useQueryClient } from "@tanstack/react-query";

export function Task({ taskId, setCompleteTasks, setFailedTasks }) {
  const queryClient = useQueryClient();
  const { data: task, refetch } = useGetTask(taskId._id);

  useEffect(() => {
    if (task && task.status === "ready") {
      setCompleteTasks((prev) => [...prev, task]);
      refetch({ enabled: false });
    }
    if (task && task.status === "failed") {
      setFailedTasks((prev) => [...prev, task]);
      refetch({ enabled: false });
    }
  }, [task, refetch, setCompleteTasks, setFailedTasks]);

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [keys.TASK, taskId._id],
    });
  }, [task, taskId._id]);

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
              {task.status === "ready" && (
                <div className="statusMessage doneMessage">
                  {completeIcon && (
                    <img src={completeIcon} alt="Icon" className="icon" />
                  )}
                  Complete{" "}
                </div>
              )}

              {task.status !== "ready" && !task.process && (
                <div className="statusMessage">
                  <LoadingSpinner />
                  {task.status}...
                </div>
              )}

              {task.status !== "ready" && task.process && (
                <div className="statusMessage">
                  <LoadingSpinner />
                  {task.status}... {Math.round(task.process.upload_percentage)}%
                </div>
              )}
            </Container>
          </Suspense>
        </ErrorBoundary>
      )}
    </Container>
  );
}
