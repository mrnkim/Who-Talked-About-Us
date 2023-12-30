import { Suspense, useState } from "react";
import setIndexIdContext from "./common/setIndexIdContext";
import Container from "react-bootstrap/Container";
import IndexForm from "./indexes/IndexForm";
import ExistingIndexForm from "./indexes/ExistingIndexForm";
import VideoIndex from "./indexes/VideoIndex";
import LoadingSpinner from "./common/LoadingSpinner";
import "./App.css";

/** Who Talked About Us App
 *
 * - indexId: id of an index to work with
 *
 * App -> { IndexForm, VideoIndex }
 */

function App() {
  const [indexId, setIndexId] = useState(null);

  return (
    <setIndexIdContext.Provider value={{ setIndexId }}>
      <div className="App">
        <Container className="p-3 mt-5">
          <h1 className="display-5 p-2">Who Talked About Us?</h1>
          <h4>Find the right influencers (organic brand fans) to reach out </h4>
        </Container>

        {!indexId && (
          <div className="formContainer">
            <Container className="m-auto p-3 indexFormContainer">
              <IndexForm />
            </Container>
            <Container className="m-auto p-3 indexFormContainer">
              <ExistingIndexForm />
            </Container>
          </div>
        )}

        {indexId && (
          <Container className="m-auto p-3">
            <div className="mb-3">
              <Suspense fallback={<LoadingSpinner />}>
                <VideoIndex indexId={indexId} />
              </Suspense>
            </div>
          </Container>
        )}
      </div>
    </setIndexIdContext.Provider>
  );
}

export default App;
