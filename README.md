<a id="readme-top"></a>

## 1. About The Application

UGC(User Generated Content) Analyzer is a video-searching platform where a user can:

- Create an index (a library of the videos)
- Upload videos by URLS, and
- Search specific timelines of a video, or videos by a keyword.

This application utilizes [Twelve Labs API](https://docs.twelvelabs.io/docs) for the rich, contextual video search. Twelve Labs is an AI-powered video understanding platform that extracts various types of information from videos, such as movement and actions, objects and people, sound, text on screen, and speech.

![Product Name Screen Shot][product-screenshot]

### Built With

- JavaScript
- React
- React Bootstrap

### Component Design

![Component Design Screen Shot][component-design]

### To-Dos

- Add more tests (or automate)
- Improve error handling and add data validations
- Improve resetting search
- Allow a user to customize index/search options
- Improve UI showing upload status
- Refactor api.js to reduce code redundancy
- Show all videos (currently capped at 10 videos)
- Explore bulk video uploads

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 2. Getting Started

### Generate and save API Key

1. Visit [Twelve Labs Playground](https://playground.twelvelabs.io/) to generate your API Key
2. Check the current API Base URL at [Twelve Labs API Reference](https://docs.twelvelabs.io/reference/api-reference) and update the version as needed
3. Create .env file and store/update the values of API_KEY and API_URL
   ```
   .env
   REACT_APP_API_URL=https://api.twelvelabs.io/v1.1
   REACT_APP_API_KEY=YOUR_API_KEY
   ```

### Start the App

1. Clone the current repo
2. Install and start the client
   ```sh
   npm install
   npm start
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 3. Use Case

### Social media marketing for a brand

Discovering the right YouTube or TikTok influencer for your brand is crucial. The most effective influencer partnerships typically evolve organically, with influencers who already use or discuss your products or brand. However, pinpointing these influencers can be challenging, especially as YouTube and TikTok searches often miss content where your brand name isn't explicitly mentioned in video titles or descriptions.

This is where the User-Generated Content (UGC) Analyzer can provide immense value. Unlike standard YouTube or TikTok searches, this app enables in-depth, contextual video searching. By inputting a simple keyword (e.g., your brand name) or specific descriptions (e.g., "applying mascara"), you can identify videos that discuss or feature your brand/products, pinpointing the exact moments these references occur.

Follow this simple guide on how to use the UGC Analyzer:

1. Begin by uploading videos to the app using their URLs. To do this, you first need to convert the YouTube URL to a 360.mp4 URL at [ssyoutube](https://ssyoutube.com/en718gk/), then shorten the URL using [tinyurl](https://tinyurl.com/app).

2. Once the videos are uploaded, you can conduct a search using any keyword. Here are some suggestions:

   - Enter your brand name and discover who's already talking about you in their videos
   - Enter your competitors' brand names to see what types of influencers they're attracting and the types of audiences they're reaching
   - You can also search for very specific keywords such as "applying mascara" or "holding blue sunglasses"!

3. The search results will display videos where your keyword is mentioned or featured, offering a wealth of potential influencers and content creators for you to engage with

4. Based on these results, you can prioritize influencers and begin your outreach efforts, forging partnerships that can expand your brand reach and influence

Remember, success in influencer marketing is all about forming authentic partnerships!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[product-screenshot]: public/screenshot.png
[component-design]: public/component%20Design_UGC.png
