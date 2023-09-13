import "./App.css";
import IndexForm from "./indexes/IndexForm";
import { useEffect, useState } from "react";
import TwelveLabsApi from "./api/api";
import VideoIndex from "./indexes/VideoIndex";
import Container from "react-bootstrap/Container";
// const { getIndexes } = require('./api/server');

/** UGC Analyzer application
 *
 * - indexes: list of indexes and loading status
 *   { data: [{_id: '1', index_name: 'testIndex2', index_options: Array(4),...},
 *            {_id: '2', index_name: 'testIndex2', index_options: Array(4),...}]
 *          , isLoading: false }
 *
 * App -> { IndexForm, VideoIndex }
 */

function App() {
  const [indexes, setIndexes] = useState({
    data: null,
    isLoading: true,
  });

  useEffect(function fetchIndexesOnMount() {
    async function fetchIndexes() {
      const response = await TwelveLabsApi.getIndexes();
      setIndexes({ data: response, isLoading: false });
    }
    fetchIndexes();
  }, []);

  /** Triggered by index form submit; creates/adds a new index */
  async function addIndex(indexName) {
    const newIndex = await TwelveLabsApi.createIndex(indexName);
    setIndexes((indexes) => ({
      data: [...indexes.data, { ...newIndex, index_name: indexName }],
      isLoading: false,
    }));
  }

  if (indexes.isLoading) return <i>Loading...</i>;
  return (
    <div className="App">
      <Container className="m-auto p-3">
        <h1 className="m-3 display-5" style={{ fontWeight: "700" }}>
          <i className="bi bi-chat-square-dots"></i> Who Talked About Us?
        </h1>
        <h4>Find the right influencers (organic brand fans) to reach out </h4>
      </Container>
      <Container>
        <IndexForm indexes={indexes.data} addIndex={addIndex} />
      </Container>
      <Container className="m-auto p-3">
        {indexes.data &&
          indexes.data.map((index) => (
            <div className="mb-3" key={index._id}>
              <VideoIndex
                indexes={indexes}
                setIndexes={setIndexes}
                index={index}
                index_id={index._id}
                className="mb-3"
              />
            </div>
          ))}
      </Container>
    </div>
  );
}

export default App;
