import "./App.css";
import IndexForm from "./IndexForm";
import SearchForm from "./SearchForm";
import UploadForm from "./UploadForm";
import { useEffect, useState } from "react";
import TwelveLabsApi from "./api";
import Library from "./Library";

function App() {
  const [indexes, setIndexes] = useState({
    data: null,
    isLoading: true,
  });
  console.log("🚀 > App > indexes=", indexes);

  useEffect(function fetchIndexesWhenMounted() {
    async function fetchIndexes() {
      const response = await TwelveLabsApi.getIndexes();
      const filteredResponse = response.map((index) => ({
        _id: index._id,
        index_name: index.index_name,
      }));
      setIndexes({ data: filteredResponse, isLoading: false });
    }
    fetchIndexes();
  }, []);

  async function addIndex(indexName) {
    const newIndex = await TwelveLabsApi.createIndex(indexName);
    console.log("🚀 > addIndex > newIndex=", newIndex);
    setIndexes((indexes) => ({
      data: [...indexes.data, { ...newIndex, index_name: indexName }],
      isLoading: false,
    }));
  }

  if (indexes.isLoading) return <i>Loading...</i>;
  return (
    <div className="App">
      <IndexForm
        indexes={indexes.data}
        setIndexes={setIndexes}
        addIndex={addIndex}
      />
      {indexes.data &&
        indexes.data.map((index) => <Library key={index._id} data={index} />)}
      {/* <UploadForm index={newIndex.data._id} /> */}
      {/* <SearchForm /> */}
    </div>
  );
}

export default App;
