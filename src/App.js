import "./App.css";
import IndexForm from "./IndexForm";
import SearchForm from "./SearchForm";
import UploadForm from "./UploadForm";
import { useEffect, useState } from "react";
import TwelveLabsApi from "./api";
import Library from "./Library";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

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

  async function addIndex(indexName) {
    const newIndex = await TwelveLabsApi.createIndex(indexName);
    setIndexes((indexes) => ({
      data: [...indexes.data, { ...newIndex, index_name: indexName }],
      isLoading: false,
    }));
  }

  async function deleteIndex(indexId) {
    if (window.confirm("Are you sure you want to delete this index?")) {
      await TwelveLabsApi.deleteIndex(indexId);
      setIndexes((prevState) => ({
        ...prevState,
        data: prevState.data.filter((index) => index._id !== indexId),
      }));
    }
  }

  if (indexes.isLoading) return <i>Loading...</i>;
  return (
    <div className="App">
      <Container className="m-auto p-3">
        <h1 className="m-3">UGC Analyzer</h1>
      </Container>
      <Container className="m-auto p-3">
        <IndexForm indexes={indexes.data} addIndex={addIndex} />
      </Container>
      <Container className="m-auto p-3">
        {indexes.data &&
          indexes.data.map((index) => (
            <div className="mb-3" key={index._id}>
              <Library
                index={index}
                className="mb-3"
                deleteIndex={deleteIndex}
                key={index._id}
              />
            </div>
          ))}
      </Container>
    </div>
  );
}

export default App;
