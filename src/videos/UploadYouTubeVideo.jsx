import { useState} from 'react'
import { Button, Card, Container} from "react-bootstrap";
import TextField from '@mui/material/TextField'
import sanitize from 'sanitize-filename'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import { Box } from '@mui/material'
import "./UploadYouTubeVideo.css"


const SERVER_BASE_URL = new URL('http://localhost:4001')
const INDEX_ID_INFO_URL = new URL('/get-index-info', SERVER_BASE_URL)
const JSON_VIDEO_INFO_URL = new URL('/json-video-info', SERVER_BASE_URL)
const CHANNEL_VIDEO_INFO_URL = new URL('/channel-video-info', SERVER_BASE_URL)
const PLAYLIST_VIDEO_INFO_URL = new URL('/playlist-video-info', SERVER_BASE_URL)
const DOWNLOAD_URL = new URL('/download', SERVER_BASE_URL)
const CHECK_TASKS_URL = new URL('/check-tasks', SERVER_BASE_URL)

function UploadYoutubeVideo ({indexedVideos, setIndexedVideos, index, index_id, taskVideos, setTaskVideos}) {
    const [pendingApiRequest, setPendingApiRequest] = useState(false)
    const [apiElement, setApiElement] = useState(null)
    const [selectedJSON, setSelectedJSON] = useState(null)
    const [youtubeChannelId, setYoutubeChannelId] = useState(null)
    const [youtubePlaylistId, setYoutubePlaylistId] = useState(null)
    const [indexId, setIndexId] = useState(null)
    const [searchQuery, setSearchQuery] = useState(null)
    const [searchOptions, setSearchOptions] = useState(['visual', 'conversation', 'text-in-video', 'logo'])

    const handleJSONSelect = (event) => {
        setSelectedJSON(event.target.files[0])
    }

    const handleReset = () => {
        setPendingApiRequest(false)
        setIndexedVideos(null)
        setTaskVideos(null)
        setSelectedJSON(null)
        setYoutubeChannelId(null)
        setYoutubePlaylistId(null)
        setSearchQuery(null)
        setSearchOptions(['visual', 'conversation', 'text-in-video', 'logo'])
        setIndexId(null);
        updateApiElement(null);
    }

    const updateApiElement = (text) => {
        if (text) {
            setPendingApiRequest(true);

            let apiRequestElement =
            <Box sx={{ textAlign: 'center', marginTop: '20px' }}>{waitingBar}
            <Typography variant="body2" color="text.secondary" sx={{ display: 'inline-block', verticalAlign: 'middle' }}>
              {text}
            </Typography>
          </Box>
            setApiElement(apiRequestElement)
        } else {
            setPendingApiRequest(false);
            setApiElement(null)
        }
    }

    const handleYoutubeUrlEntry = (event) => {
        setYoutubeChannelId(event.target.value)
    }

    const handlePlaylistUrlEntry = (event) => {
        setYoutubePlaylistId(event.target.value)
    }

    const getInfo = async () => {
        updateApiElement('Getting Data...')
        if (selectedJSON) {
            let fileReader = new FileReader()
            fileReader.readAsText(selectedJSON)
            fileReader.onloadend = async () => {
                const jsonVideos = JSON.parse(fileReader.result)

                const response = await Promise.all(jsonVideos.map(getJsonVideoInfo))
                setTaskVideos(response)
            }
        } else if (youtubeChannelId) {
            const response = await getChannelVideoInfo(youtubeChannelId)
            setTaskVideos(response)
        } else if (youtubePlaylistId) {
            const response = await getPlaylistVideoInfo(youtubePlaylistId)
            setTaskVideos(response)
        } else if (indexId) {
            const response = await getIndexInfo()
            setIndexedVideos(response)
        }
        updateApiElement()
    }

    const getJsonVideoInfo = async (videoData) => {
        const queryUrl = JSON_VIDEO_INFO_URL
        queryUrl.searchParams.set('URL', videoData.url)
        const response = await fetch(queryUrl.href)
        return await response.json()
    }

    const getChannelVideoInfo = async () => {
        const queryUrl = CHANNEL_VIDEO_INFO_URL
        queryUrl.searchParams.set('CHANNEL_ID', youtubeChannelId)
        const response = await fetch(queryUrl.href)
        return await response.json()
    }

    const getPlaylistVideoInfo = async () => {
        const queryUrl = PLAYLIST_VIDEO_INFO_URL
        queryUrl.searchParams.set('PLAYLIST_ID', youtubePlaylistId)
        const response = await fetch(queryUrl.href)
        return await response.json()
    }

    const getIndexInfo = async () => {
        const queryUrl = INDEX_ID_INFO_URL
        queryUrl.searchParams.set('INDEX_ID', index_id)
        const response = await fetch(queryUrl.href)
        return await response.json()
    }

    const indexYouTubeVideos = async () => {
        updateApiElement('Do not leave or refresh the page. Please wait until indexing is done for ALL videos.')

        const videoData = taskVideos.map(videoData => { return {url: videoData.video_url || videoData.url, title: videoData.title, authorName: videoData.author.name}})
        const requestData = {
            videoData: videoData,
            indexName: index,
            index_id: index_id
        }
        const data = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        }
        const response = await fetch(DOWNLOAD_URL.toString(), data)
        const json = await response.json()
        const taskIds = json.taskIds
        setIndexId(json.indexId)
        await monitorTaskIds(taskIds)
    }

    const monitorTaskIds = async (taskIds) => {
        const sleep = ms => new Promise(
            resolve => setTimeout(resolve, ms)
        );
        let poll = true

        while (poll) {
            const taskStatuses = taskIds.map( async taskId => {
                const queryUrl = CHECK_TASKS_URL
                queryUrl.searchParams.set('TASK_ID', taskId._id)
                const response = await fetch(queryUrl.href)
                return await response.json()
            })
            const statuses = await Promise.all(taskStatuses)
            const videoTasksStatuses = statuses.map( status => {
                const taskMatch = taskVideos.filter( video => {
                    const safeName = `${sanitize(video.title)}.mp4`
                    if (safeName === status.metadata.filename) {
                        return video
                    }
                })
                if (taskMatch) {
                    return {...taskMatch[0], ...status}
                }
            })
            setTaskVideos(videoTasksStatuses)
            if (statuses.every(status => status.status === 'ready')) {
                poll = false
                updateApiElement()
                const response = await getIndexInfo()
                setIndexedVideos(response)
            } else {
                await sleep(10000)
            }
        }
    }

    let controls = <></>
    let videos = <></>
    let waitingBar =
    <Box sx={{ width: '100%', py: '0.2vh', display: 'flex', justifyContent: 'center', alignitems: 'center' }}>
            <LinearProgress sx={{ width: '30%' }}/>
        </Box>


if (taskVideos) {
    videos = taskVideos.map((video, index) => { 
        let indexingStatusContainer = null;

        if (video.status) {
            let indexingMessage = video.status === 'ready' ? <p> Done Indexing  </p> : <p>Waiting...</p>;

            indexingStatusContainer =
                <Container key={video.video_url || video.url} className="indexingStatusContainer">
                    { video.status === 'ready' ? null : waitingBar }
                    <div>
                        <Container variant="body2" color="text.secondary" display='flex' alignitems='center' className="indexingStatus">
                            { video.process ? `Indexing... ${Math.round(video.process.upload_percentage)}% complete` : indexingMessage }
                        </Container>
                    </div>
                </Container>;
        }

        let element =
            <Container key={video.video_url || video.url} className="taskVideo">
                <Container >
                    <Card  style={{ border: 'none', margin: "0.5rem"}}>
                        <a href={ video.video_url || video.url } target='_blank'>
                            <Card.Img
                                src={ video.thumbnails[video.thumbnails.length-1].url || video.bestThumbnail.url}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </a>
                    </Card>
                    <Container style={{ display: 'flex', justifyContent: 'center', alignitems: 'center', marginTop: '10px' }}>
                        { indexingStatusContainer || (pendingApiRequest ? "Downloading & Submitting..." : null) }
                    </Container>
                </Container>
            </Container>;

        return element;
    });
        controls =
            <>
                <Container justifycontent='center' alignitems='center' direction='column'  disableequaloverflow="true">

                    <Container direction='row'  sx={{pb: '2vh', width: '100%', bgcolor: '#121212', 'z-index': 5}} position='fixed' top='0' justifycontent='center' alignitems='end'>
                        <Container className="m-3">
                            <Button component='label' onClick={ indexYouTubeVideos } disabled={ pendingApiRequest ? true : false } style={{marginRight: "5px"}}>
                                Add {taskVideos.length} Videos
                            </Button>
                            <Button component='label' onClick={ handleReset } disabled={ pendingApiRequest ? true : false }>
                            <i className="bi bi-arrow-counterclockwise"></i>
                                  <span> Back</span>
                            </Button>
                        </Container>
                    </Container>

                        { apiElement }
                        <Container fluid>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", justifyContent: "center", alignitems: "center" }}>
  {videos.length === 1 ? (
    <div className="single-video">
      {videos}
    </div>
  ) : (
    videos
  )}
</div>

</Container>
                </Container>
            </>
    } else {
        controls =
            <>
                <Container display='flex' justifycontent='center' alignitems='center'  direction='column'>
                    <Container style={{marginBottom:"1rem"}}display="flex" justifycontent='center' alignitems='center' >
                        <label htmlFor="jsonFileInput"   className="label-container">Select JSON File</label>
                        <input
                        id="jsonFileInput"
                        type='file'
                        accept='.json'
                        hidden
                        onChange={handleJSONSelect}
                        disabled={!!youtubeChannelId || !!youtubePlaylistId || pendingApiRequest}
                        />
                        <strong>Selected File: </strong>
                        { selectedJSON ? selectedJSON.name : 'None' }
                    </Container>
                    <Container display='flex' xs={3}>
                        <TextField label={<span><i className="bi bi-youtube"></i> YouTube Channel ID</span>} variant='standard' sx={{ width: '50%' }} onChange={ handleYoutubeUrlEntry } disabled={ !!selectedJSON || !!indexId || !!youtubePlaylistId}/>
                    </Container>

                    <Container display='flex' xs={3}>
                        <TextField label={<span><i className="bi bi-youtube"></i> YouTube Playlist ID</span>}  variant='standard' sx={{ width: '50%' }}onChange={ handlePlaylistUrlEntry } disabled={ !!selectedJSON || !!indexId || !!youtubeChannelId }/>
                    </Container>


                    <Container display='flex' className="mt-3">
                        <Button  style={{ marginRight: '0.5rem' }} onClick={ getInfo }>
                            Submit
                        </Button>
                        <Button variant="secondary" onClick={ handleReset }>
                            Cancel
                        </Button>
                    </Container>

                    { apiElement }
                </Container>
            </>
    }

    return (
        controls
    )
}

export default UploadYoutubeVideo
