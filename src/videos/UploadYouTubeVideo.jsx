import { useState} from 'react'
import {  Card, Container} from "react-bootstrap";
import sanitize from 'sanitize-filename'
import "./UploadYouTubeVideo.css"
import infoIcon from "../svg/Info.svg"

const SERVER_BASE_URL = new URL('http://localhost:4001')
const INDEX_ID_INFO_URL = new URL('/get-index-info', SERVER_BASE_URL)
const JSON_VIDEO_INFO_URL = new URL('/json-video-info', SERVER_BASE_URL)
const CHANNEL_VIDEO_INFO_URL = new URL('/channel-video-info', SERVER_BASE_URL)
const PLAYLIST_VIDEO_INFO_URL = new URL('/playlist-video-info', SERVER_BASE_URL)
const DOWNLOAD_URL = new URL('/download', SERVER_BASE_URL)
const CHECK_TASKS_URL = new URL('/check-tasks', SERVER_BASE_URL)

function UploadYoutubeVideo ({setIndexedVideos, index, taskVideos, setTaskVideos, loadingSpinner}) {
    const [pendingApiRequest, setPendingApiRequest] = useState(false)
    const [apiElement, setApiElement] = useState(null)
    const [selectedJSON, setSelectedJSON] = useState(null)
    const [youtubeChannelId, setYoutubeChannelId] = useState("")
    const [youtubePlaylistId, setYoutubePlaylistId] = useState("")
    const [indexId, setIndexId] = useState(null)
    const [searchQuery, setSearchQuery] = useState(null)

    const handleJSONSelect = (event) => {
        setSelectedJSON(event.target.files[0])
    }

    const handleReset = () => {
        setPendingApiRequest(false)
        setIndexedVideos(null)
        setTaskVideos(null)
        setSelectedJSON(null)
        setYoutubeChannelId("")
        setYoutubePlaylistId("")
        setSearchQuery(null)
        setIndexId(null);
        updateApiElement(null);
    }

    const updateApiElement = (text) => {
        if (text) {
            setPendingApiRequest(true);

            let apiRequestElement =

            <div className="doNotLeaveMessageWrapper">
                <img src={infoIcon} alt="infoIcon" className="icon"></img>
                <div className="doNotLeaveMessage">{text}</div>
            </div>
            setApiElement(apiRequestElement)
        } else {
            setPendingApiRequest(false);
            setApiElement(null)
        }
    }

    const handleYoutubeChannelIdEntry = (event) => {
        setYoutubeChannelId(event.target.value)
    }

    const handleYoutubePlaylistIdEntry = (event) => {
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
        queryUrl.searchParams.set('INDEX_ID', index._id)
        const response = await fetch(queryUrl.href)
        return await response.json()
    }

    const indexYouTubeVideos = async () => {
        updateApiElement('Do not leave or refresh the page. Please wait until indexing is done for ALL videos.')

        const videoData = taskVideos.map(videoData => { return {url: videoData.video_url || videoData.url, title: videoData.title, authorName: videoData.author.name}})
        const requestData = {
            videoData: videoData,
            indexName: index,
            index_id: index._id
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


if (taskVideos) {
    videos = taskVideos.map((video, index) => {
        let indexingStatusContainer = null;

        if (video.status) {
            let indexingMessage = video.status === 'ready' ? <div className="statusMessage doneMessage"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 1.66667C5.40001 1.66667 1.66667 5.40001 1.66667 10C1.66667 14.6 5.40001 18.3333 10 18.3333C14.6 18.3333 18.3333 14.6 18.3333 10C18.3333 5.40001 14.6 1.66667 10 1.66667ZM10.8333 14.1667H9.16667V9.16667H10.8333V14.1667ZM10.8333 7.50001H9.16667V5.83334H10.8333V7.50001Z" fill="#5AC903"/>
          </svg> Complete  </div> : <div className="statusMessage">Waiting...</div>;
            indexingStatusContainer =
                <Container key={video.video_url || video.url} className="indexingStatusContainer">
                    { video.status === 'ready' ? null :
                    <div className="loading-spinner-wrapper">
                    <img src={loadingSpinner} alt="Loading Spinner" className="loading-spinner" />
                    </div> }

                    <div>
                        <Container variant="body2" color="text.secondary" display='flex' alignitems='center' className="indexingStatus">
                            { video.process ? <div className="statusMessage">Indexing... {Math.round(video.process.upload_percentage)}%</div> : indexingMessage }
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
                        { indexingStatusContainer || (pendingApiRequest ? <div className="downloadSubmit">Downloading & Submitting...</div> : null) }
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
                            <button className="button" onClick={ indexYouTubeVideos } disabled={ pendingApiRequest ? true : false } style={{marginRight: "5px"}}>
                                Continue
                            </button>
                            <button className="button" onClick={ handleReset } disabled={ pendingApiRequest ? true : false }>
                                Back
                            </button>
                        </Container>
                    </Container>

                    <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom:'2rem', marginTop:'2rem' }}>
                        { apiElement }
                    </Container>

                        <Container fluid>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", justifyContent: "center", alignitems: "center" }}>
                         {videos.length === 1 ? (<div className="single-video">{videos}</div>) : (videos)}</div>
                        </Container>
                </Container>
            </>
        } else {
        controls =
            <>
                <Container display='flex' justifycontent='center' alignitems='center'  direction='column'>
                    <Container style={{marginBottom:"1rem"}}display="flex" justifycontent='center' alignitems='center' >
                        <label htmlFor="jsonFileInput" className={!!selectedJSON || !!youtubeChannelId|| !!youtubePlaylistId ? "jsonDisabled" : "selectJsonButton"}
                            >Select JSON File</label>
                        <input
                            id="jsonFileInput"
                            type='file'
                            accept='.json'
                            hidden
                            onChange={handleJSONSelect}
                            disabled={!!youtubeChannelId || !!youtubePlaylistId || pendingApiRequest}
                            value={undefined}
                            />
                        <span className="selectedFile" >Selected File:
                        { selectedJSON ? selectedJSON.name : 'none' } </span>
                    </Container>

                    <Container display='flex' xs={3}  style={{marginBottom:"1rem"}}>
                        <input
                            className={!!selectedJSON || !!indexId || !!youtubePlaylistId ? "customDisabled" : "youTubeId"}
                            placeholder="YouTube Channel ID"
                            onChange={ handleYoutubeChannelIdEntry }
                            disabled={ !!selectedJSON || !!youtubePlaylistId}
                            value={youtubeChannelId}/>
                    </Container>

                    <Container display='flex' xs={3}  style={{marginBottom:"1rem"}}>
                        <input
                        className={!!selectedJSON || !!indexId || !!youtubeChannelId ? "customDisabled" : "youTubeId"}
                        placeholder="YouTube Playlist ID"
                        onChange={ handleYoutubePlaylistIdEntry }
                        disabled={ !!selectedJSON || !!youtubeChannelId}
                        value={youtubePlaylistId}/>
                    </Container>

                    <Container display='flex' className="buttons">
                        <button className="button" onClick={ getInfo }>
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        >
                        <path
                            d="M7.99996 8.33333V7.83333H7.49996H5.37373L9.99996 3.20711L14.6262 7.83333H12.5H12V8.33333V12.8333H7.99996V8.33333ZM15.3333 15.5V16.1667H4.66663V15.5H15.3333Z"
                            fill="black"
                            stroke="black"
                        />
                        </svg>
                            Upload
                        </button>
                        <button className="button cancel" onClick={ handleReset }>
                            Cancel
                        </button>
                    </Container>

                    <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        { apiElement }
                    </Container>

                </Container>
            </>
    }
    return (
        controls
    )
}

export default UploadYoutubeVideo
