import "./App.css";
import IndexForm from "./indexes/IndexForm";
import VideoIndex from "./indexes/VideoIndex";
import Container from "react-bootstrap/Container";
import { useGetIndex } from "./api/apiHooks";
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
  const [indexId, setIndexId] = useState();

  console.log(
    "🚀 > App > process.env.REACT_APP_INDEX_ID=",
    process.env.REACT_APP_INDEX_ID
  );
  console.log(
    "🚀 > App > process.env.REACT_APP_API_URL=",
    process.env.REACT_APP_API_URL
  );
  const queryClient = useQueryClient();

  // const {
  //   data: indexesData,
  //   refetch,
  //   isPreviousData,
  // } = useGetIndexes(page, PAGE_LIMIT);

  const {
    data: index,
    refetch,
    isPreviousData,
  } = useGetIndex(process.env.REACT_APP_INDEX_ID || null);

  console.log("🚀 > App > index=", index);

  // const indexes = indexesData?.data;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [keys.INDEX] });
  }, [index]);

  return (
    <div className="App">
      <Container className="m-auto p-3">
        <h1 className="m-3 display-5">Who Talked About Us?</h1>
        <h4>Find the right influencers (organic brand fans) to reach out </h4>
      </Container>
      {!index && (
        <div>
          <div className="doNotLeaveMessageWrapper">
            <img src={infoIcon} alt="infoIcon" className="icon"></img>
            <div className="doNotLeaveMessage">
              There is no index. Start creating one!
            </div>
          </div>
          <Container className="m-auto p-3 indexFormContainer">
            <IndexForm />
          </Container>
        </div>
      )}
      {index && (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => refetch()}
          resetKeys={[keys.INDEX]}
        >
          <Container className="m-auto p-3">
            <div className="mb-3" key={index._id}>
              <Suspense fallback={<LoadingSpinner />}>
                <VideoIndex index={index} />
              </Suspense>
            </div>
          </Container>{" "}
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
