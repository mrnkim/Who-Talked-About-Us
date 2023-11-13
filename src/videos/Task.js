import { useQuery } from "@tanstack/react-query";
import TwelveLabsApi from "../api/api";
import { Container } from "react-bootstrap";
import { LoadingSpinner } from "../common/LoadingSpinner";
import completeIcon from "../svg/Complete.svg";
import { useEffect } from "react";
export function Task({ taskId, setCompleteTasks, setFailedTasks }) {
  const query = {
    queryKey: ["task", taskId],
    queryFn: () => TwelveLabsApi.getTask(taskId),
    refetchOnWindowFocus: false,
    refetchInterval: (task) => (task.status === "ready" ? false : 5000),
    refetchIntervalInBackground: true,
    enabled: true,
  };

  const { data: task, isLoading, refetch } = useQuery(query);

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
      {isLoading && <LoadingSpinner />}
      {!isLoading && (
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
              {task?.status}... {Math.round(task?.process.upload_percentage)}%
            </div>
          )}
        </Container>
      )}
    </Container>
  );
}
