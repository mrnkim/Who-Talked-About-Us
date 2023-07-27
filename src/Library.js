import { Button } from "react-bootstrap";

function Library({ data }) {
  return <Button>{data.index_name}</Button>;
}

export default Library;
