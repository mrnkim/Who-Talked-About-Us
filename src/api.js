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
      url: `${API_URL}/indexes`,
      headers: this.headers,
    };

    try {
      const response = await axios.request(config);
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
      return resp.data;
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }

  static async getVideos(index_id) {
    const config = {
      method: "GET",
      url: `${API_URL}/indexes/${index_id}/videos`,
      headers: this.headers,
    };

    try {
      const response = await axios.request(config);
      return response.data.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async getVideo(index_id, video_id) {
    const config = {
      method: "GET",
      url: `${API_URL}/indexes/${index_id}/videos/${video_id}`,
      headers: {
        ...this.headers,
        "Content-Type":
          "multipart/form-data; boundary=---011000010111000001101001",
      },
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async searchVideo(indexId, query) {
    const config = {
      method: "POST",
      url: `${API_URL}/search`,
      headers: {
        ...this.headers,
        " accept": "application/json",
        "Content-Type": "application/json",
      },
      data: {
        index_id: `${indexId}`,
        search_options: ["visual", "conversation", "text_in_video", "logo"],
        query: { text: `${query}` },
      },
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  static async checkStatus(taskId) {
    const config = {
      method: "GET",
      url: `${API_URL}/tasks/${taskId}`,
      headers: {
        ...this.headers,
      },
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  static async uploadVideo(indexId, videoUrl) {
    try {
      let formData = new FormData();
      formData.append("index_id", indexId);
      formData.append("language", "en");
      formData.append("video_url", videoUrl);

      let config = {
        method: "post",
        url: `${API_URL}/tasks`,
        headers: {
          ...this.headers,
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      };

      let resp = await axios(config);
      let response = await resp.data;
      const VIDEO_ID = response.video_id;
      return response;
    } catch (error) {
      console.error(`Error: ${error}`);
      console.error(`Error response: ${error.response.data}`);
    }
  }
}

export default TwelveLabsApi;
