import { Suspense, useState, useEffect } from "react";
import setIndexIdContext from "./common/setIndexIdContext";
import Container from "react-bootstrap/Container";
import VideoIndex from "./indexes/VideoIndex";
import LoadingSpinner from "./common/LoadingSpinner";
import "./App.css";

/** Who Talked About Us App
 *
 * - Uses REACT_APP_DEFAULT_INDEX_ID from .env for the default index
 *
 * App -> VideoIndex
 */

function App() {
  const [indexId, setIndexId] = useState(
    process.env.REACT_APP_DEFAULT_INDEX_ID || null
  );

  return (
    <setIndexIdContext.Provider value={{ setIndexId }}>
      <div className="App">
        <Container className="m-auto p-3">
          <div className="mb-3">
            <Suspense fallback={<LoadingSpinner />}>
              <VideoIndex indexId={indexId} />
            </Suspense>
          </div>
        </Container>
      </div>
    </setIndexIdContext.Provider>
  );
}

export default App;
