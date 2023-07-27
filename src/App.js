import "./App.css";
import IndexForm from "./IndexForm";
import SearchForm from "./SearchForm";
import UploadForm from "./UploadForm";
import { useEffect, useState } from "react";
import TwelveLabsApi from "./api";

function App() {
  const [indexes, setIndexes] = useState({
    data: null,
    isLoading: true,
  });
  console.log("🚀 > App > indexes=", indexes);

  useEffect(function fetchIndexesWhenMounted() {
    async function fetchIndexes() {
      const response = await TwelveLabsApi.getIndexes();
      setIndexes({ data: response, isLoading: false });
    }
    fetchIndexes();
  }, []);

  if (indexes.isLoading) return <i>Loading...</i>;
  return (
    <div className="App">
      <IndexForm indexes={indexes.data} setIndexes={setIndexes} />
      {/* <UploadForm index={newIndex.data._id} /> */}
      {/* <SearchForm /> */}
    </div>
  );
}

export default App;
