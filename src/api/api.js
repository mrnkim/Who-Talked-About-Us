import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

/** API Class
 *
 * Static class tying together methods used to get/send to to the API.
 *
 */
class TwelveLabsApi {
  /** Declare the `headers` object containing your API key */
  static headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  };

  /** Get indexes of a user */
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

  /** Creates an index */
  static async createIndex(indexName) {
    const INDEXES_URL = `${API_URL}/indexes`;
    const INDEX_NAME = indexName;

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

  /** Deletes an index */
  static async deleteIndex(indexId) {
    const config = {
      method: "DELETE",
      url: `${API_URL}/indexes/${indexId}`,
      headers: this.headers,
    };
    try {
      const response = await axios.request(config);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  /** Get all videos of an index */
  static async getVideos(index_id) {
    const config = {
      method: "GET",
      params: { page_limit: "50" },
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

  /** Search videos with a given query */
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

  /** Updates a video */
  static async updateVideo(indexId, videoId, data) {
    const config = {
      method: "PUT",
      url: `${API_URL}/indexes/${indexId}/videos/${videoId}`,
      headers: this.headers,
      data: data,
    };
    try {
      const response = await axios.request(config);
      return response.status;
    } catch (error) {
      console.error(error);
    }
  }

  /** Check the status of a specific indexing task */
  static async checkStatus(taskId) {
    const config = {
      method: "GET",
      url: `${API_URL}/tasks/${taskId}`,
      headers: this.headers,
    };

    try {
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}

export default TwelveLabsApi;
