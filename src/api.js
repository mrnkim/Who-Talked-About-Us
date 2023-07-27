import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

class TwelveLabsApi {
  // Declare the `headers` object containing your API key
  static headers = {
    "x-api-key": API_KEY,
  };

  static async getIndexes() {
    const config = {
      method: "GET",
      url: "https://api.twelvelabs.io/v1.1/indexes",
      headers: this.headers,
    };

    try {
      const response = await axios.request(config);
      console.log(response.data);
      return response.data.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async createIndex(indexName) {
    const INDEXES_URL = `${API_URL}/indexes`;
    const INDEX_NAME = indexName;

    // Make a POST request to the `indexes` endpoint, passing the `x-api-key` header parameter
    try {
      const resp = await axios.post(
        INDEXES_URL,
        {
          engine_id: "marengo2.5",
          index_options: ["visual", "conversation", "text_in_video", "logo"],
          index_name: INDEX_NAME,
        },
        { headers: this.headers }
      );
      const { data: response } = resp;
      console.log(`Status code: ${resp.status}`);
      console.log(response);
      return resp;
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }

  static async uploadVideo(INDEX_ID, VIDEO_URL) {
    console.log(
      "🚀 > TwelveLabsApi > uploadVideo > INDEX_ID, VIDEO_URL=",
      INDEX_ID,
      VIDEO_URL
    );
    const TASKS_URL = `${API_URL}/tasks`;
    try {
      let formData = new FormData();
      formData.append("index_id", INDEX_ID);
      formData.append("language", "en");
      formData.append("video_url", VIDEO_URL);
      console.log("🚀 > TwelveLabsApi > uploadVideo > formData=", formData);

      let config = {
        method: "post",
        url: TASKS_URL,
        headers: TwelveLabsApi.headers,
        data: formData,
      };
      let resp = await axios(config);

      let response = await resp.data;

      const VIDEO_ID = response.json().get("video_id");
      console.log(`Status code: ${response.status}`);
      console.log(`VIDEO_ID: ${VIDEO_ID}`);
      console.log(response);
      return resp;
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }
}

export default TwelveLabsApi;
