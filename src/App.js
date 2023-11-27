import "./App.css";
import IndexForm from "./indexes/IndexForm";
import VideoIndex from "./indexes/VideoIndex";
import Container from "react-bootstrap/Container";
import { useGetIndexes } from "./api/apiHooks";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense, useEffect, useState } from "react";
import ErrorFallback from "./common/ErrorFallback";
import infoIcon from "./svg/Info.svg";
import { useQueryClient } from "@tanstack/react-query";
import { keys } from "./api/keys";
import { PageNav } from "./common/PageNav";

const PAGE_LIMIT = 10;

/** Who Talked About Us App
 *
 * - indexes: list of indexes and loading status
 *
 * App -> { IndexForm, VideoIndex }
 */

function App() {
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const {
    data: indexesData,
    refetch,
    isPreviousData,
  } = useGetIndexes(page, PAGE_LIMIT);

  const indexes = indexesData?.data;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [keys.INDEXES] });
  }, [indexes, page]);

  return (
    <div className="App">
      <Container className="m-auto p-3">
        <h1 className="m-3 display-5">Who Talked About Us?</h1>
        <h4>Find the right influencers (organic brand fans) to reach out </h4>
      </Container>
      <Container className="m-auto p-3 indexFormContainer">
        <IndexForm />
      </Container>
      {indexes?.length === 0 && (
        <div className="doNotLeaveMessageWrapper">
          <img src={infoIcon} alt="infoIcon" className="icon"></img>
          <div className="doNotLeaveMessage">
            There is no index. Start creating one!
          </div>
        </div>
      )}
      {indexes?.length > 0 && (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => refetch()}
          resetKeys={[keys.INDEXES]}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Container className="m-auto p-3">
              {indexes &&
                indexes.map((index) => (
                  <div className="mb-3" key={index._id}>
                    <VideoIndex index={index} key={index._id} />
                  </div>
                ))}
            </Container>{" "}
            <PageNav
              page={page}
              setPage={setPage}
              data={indexesData}
              inPreviousData={isPreviousData}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
