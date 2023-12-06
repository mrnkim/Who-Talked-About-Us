import "./App.css";
import IndexForm from "./indexes/IndexForm";
import ExistingIndexForm from "./indexes/ExistingIndexForm";
import VideoIndex from "./indexes/VideoIndex";
import Container from "react-bootstrap/Container";
import { LoadingSpinner } from "./common/LoadingSpinner";
import { Suspense, useState } from "react";

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
      <Container className="p-3 mt-5">
        <h1 className="display-5 p-2">Who Talked About Us?</h1>
        <h4>Find the right influencers (organic brand fans) to reach out </h4>
      </Container>
      {!indexId && (
        <div className="formContainer">
          <Container className="m-auto p-3 indexFormContainer">
            <IndexForm setIndexId={setIndexId} />
          </Container>
          <Container className="m-auto p-3 indexFormContainer">
            <ExistingIndexForm setIndexId={setIndexId} />
          </Container>
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
