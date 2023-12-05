import "./App.css";
import IndexForm from "./indexes/IndexForm";
import ExistingIndexForm from "./indexes/ExistingIndexForm";
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
import { useRef } from "react";

const PAGE_LIMIT = 10;

/** Who Talked About Us App
 *
 * - indexes: list of indexes and loading status
 *
 * App -> { IndexForm, VideoIndex }
 */

function App() {
  const [indexId, setIndexId] = useState(
    process.env.REACT_APP_INDEX_ID || null
  );
  return (
    <div className="App">
      <Container className="p-3">
        <h1 className="display-5 p-2">Who Talked About Us?</h1>
        <h4>Find the right influencers (organic brand fans) to reach out </h4>
      </Container>
      {!indexId && (
        <div>
          <Container className="m-auto p-3 indexFormContainer">
            <IndexForm setIndexId={setIndexId} />
          </Container>
          <Container className="m-auto p-3 indexFormContainer">
            <ExistingIndexForm setIndexId={setIndexId} />
          </Container>
          {/* <div className="doNotLeaveMessageWrapper">
            <img src={infoIcon} alt="infoIcon" className="icon"></img>
            <div className="doNotLeaveMessage">
              There is no index. Start creating one!
            </div>
          </div> */}
        </div>
      )}
      {indexId && (
        <Container className="m-auto p-3">
          <div className="mb-3">
            <Suspense fallback={<LoadingSpinner />}>
              <VideoIndex indexId={indexId} setIndexId={setIndexId} />
            </Suspense>
          </div>
        </Container>
      )}
    </div>
  );
}

export default App;
