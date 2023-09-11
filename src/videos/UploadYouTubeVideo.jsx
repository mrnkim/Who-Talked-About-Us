import { useState, useEffect } from 'react'
import { Button, Card, Container } from "react-bootstrap";
import TextField from '@mui/material/TextField'
import sanitize from 'sanitize-filename'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import { Box } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import ReactPlayer from 'react-player'

const SERVER_BASE_URL = new URL('http://localhost:4001')
const INDEX_ID_INFO_URL = new URL('/get-index-info', SERVER_BASE_URL)
const JSON_VIDEO_INFO_URL = new URL('/json-video-info', SERVER_BASE_URL)
const CHANNEL_VIDEO_INFO_URL = new URL('/channel-video-info', SERVER_BASE_URL)
const PLAYLIST_VIDEO_INFO_URL = new URL('/playlist-video-info', SERVER_BASE_URL)
const DOWNLOAD_URL = new URL('/download', SERVER_BASE_URL)
const CHECK_TASKS_URL = new URL('/check-tasks', SERVER_BASE_URL)
const UPDATE_VIDEO_URL = new URL('/update-video', SERVER_BASE_URL)

function UploadYoutubeVideo ({indexedVideos, setIndexedVideos, index, index_id, taskVideos, setTaskVideos}) {
    const [pendingApiRequest, setPendingApiRequest] = useState(false)
    console.log("🚀 > UploadYoutubeVideo > pendingApiRequest,=", pendingApiRequest,)
    const [apiElement, setApiElement] = useState(null)
    const [selectedJSON, setSelectedJSON] = useState(null)
    const [youtubeChannelId, setYoutubeChannelId] = useState(null)
    const [youtubePlaylistId, setYoutubePlaylistId] = useState(null)
    const [indexId, setIndexId] = useState(null)
    // const [indexName, setIndexName] = useState(null)
    const [searchQuery, setSearchQuery] = useState(null)
    const [searchOptions, setSearchOptions] = useState(['visual', 'conversation', 'text-in-video', 'logo'])

    const handleJSONSelect = (event) => {
        setSelectedJSON(event.target.files[0])
    }

    const handleReset = () => {
        setIndexedVideos(null)
        setTaskVideos(null)
        setSelectedJSON(null)
        setYoutubeChannelId(null)
        setYoutubePlaylistId(null)
        setPendingApiRequest(false)
        setSearchQuery(null)
        setSearchOptions(['visual', 'conversation', 'text-in-video', 'logo'])
    }

    const updateApiElement = (text) => {
        if (text) {
            let apiRequestElement =
                <Box>
                    <LinearProgress/>
                    <Typography variant="body2" color="text.secondary" display='flex' alignitems='center'>
                        { text }
                    </Typography>
                </Box>
                setApiElement(apiRequestElement)
        } else {
            setApiElement(null)
        }
        setPendingApiRequest(previousPendingApiRequest => !previousPendingApiRequest)
    }

    const handleYoutubeUrlEntry = (event) => {
        setYoutubeChannelId(event.target.value)
    }

    const handlePlaylistUrlEntry = (event) => {
        setYoutubePlaylistId(event.target.value)
    }

    const handleIndexIdEntry = (event) => {
        setIndexId(event.target.value)
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
        console.log("🚀 > getPlaylistVideoInfo > response=", response)
        return await response.json()
    }

    const getIndexInfo = async () => {
        const queryUrl = INDEX_ID_INFO_URL
        queryUrl.searchParams.set('INDEX_ID', index_id)
        const response = await fetch(queryUrl.href)
        return await response.json()
    }

    const indexYouTubeVideos = async () => {
        updateApiElement()
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
        console.log("🚀 > indexYouTubeVideos > json=", json)
        const taskIds = json.taskIds
        console.log("🚀 > indexYouTubeVideos > taskIds=", taskIds)
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

    const handleSearchOptions = async (option) => {
        let tempSearchOptions = searchOptions
        if (searchOptions.includes(option)) {
            tempSearchOptions.splice(searchOptions.indexOf(option), 1)
        } else {
            tempSearchOptions.push(option)
        }
        console.log(tempSearchOptions)
        setSearchOptions(tempSearchOptions)
    }

    let controls = <></>
    let videos = <></>
    let waitingBar =
        <Box sx={{ width: '100%', py: '1vh' }}>
            <LinearProgress/>
        </Box>

    // if (indexedVideos && !pendingApiRequest) {
    //     videos = indexedVideos.map(video => {
    //         let element =
    //         <Container key={ video._id } xs={12} sm={6} md={4} lg={3}>
    //         <Container>
    //                     <Card>
    //                             <ReactPlayer url={ video.hls.video_url } controls width='100%' height='100%'/>

    //                     </Card>
    //                 </Container>
    //             </Container>
    //         return element
    //     })

    //     console.log(searchOptions)

    //     controls =
    //         <>
    //             <Container justifycontent='center' alignitems='center' direction='column' disableEqualOverflow>
    //                 <Container direction='row' sx={{pb: '2vh', width: '100%', bgcolor: '#121212', 'z-index': 5}} position='fixed' top='0' justifycontent='center' alignitems='end'>
    //                     <Container>
    //                         <TextField label='Search' variant='standard' fullWidth
    //                             disabled={ pendingApiRequest ? true : false } onChange={ (event) => setSearchQuery(event.target.value) }/>
    //                     </Container>

    //                     <Container>
    //                         <Button component='label' disabled={ (pendingApiRequest || !searchQuery || !searchOptions) ? true : false }>
    //                             Submit Search
    //                         </Button>
    //                     </Container>

    //                 </Container>

    //                     { apiElement }


    //                 <Container direction='row' spacing={ 2 } justifycontent='center' alignitems='center'  sx={{m: '8vh'}}>
    //                     { videos }
    //                 </Container>
    //             </Container>
    //         </>
    // } else
    if (taskVideos) {
        let indexingStatus

        videos = taskVideos.map(video => {
            if (video.status) {
                let indexingMessage = video.status === 'ready' ? <p> Done Indexing  </p> : <p>'Waiting...'</p>

                indexingStatus =
                    <>

                        { video.status === 'ready' ? null : waitingBar }
                        <div>
                        <Container variant="body2" color="text.secondary" display='flex' alignItems='center'>
                            { video.process ? `Indexing... ${Math.round(video.process.upload_percentage)}% complete` : indexingMessage }
                        </Container>
                            </div>

                    </>
            }

            let element =
                <Container key={ video.videoId } xs={12} sm={6} md={4} lg={3}
                >
                    <Container>
                        <Card  style={{ border: 'none', margin: "1em"}}>
                            <a href={ video.video_url || video.url } target='_blank'>
                                <Card.Img
                                    src={ video.thumbnails[video.thumbnails.length-1].url || video.bestThumbnail.url}
                                    style={{ width: '60%', height: '60%' }}
                                />
                            </a>
                        </Card>
                    </Container>
                    <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                         { indexingStatus || (pendingApiRequest ? "Downloading and Submitting for Indexing" : null) }
                    </Container>
                </Container>
            return element
        })

        controls =
            <>
                <Container justifycontent='center' alignitems='center' direction='column'  disableEqualOverflow>
                    <Container direction='row'  sx={{pb: '2vh', width: '100%', bgcolor: '#121212', 'z-index': 5}} position='fixed' top='0' justifycontent='center' alignitems='end'>
                        <Container className="m-3">
                            <Button component='label' onClick={ indexYouTubeVideos } disabled={ pendingApiRequest ? true : false } style={{marginRight: "5px"}}>
                                Add Videos
                            </Button>
                            <Button component='label' onClick={ handleReset } disabled={ pendingApiRequest ? true : false }>
                            <i className="bi bi-arrow-counterclockwise"></i>
                                  Reset
                            </Button>
                        </Container>
                    </Container>

                        { apiElement }


                    <Container direction='row' spacing={ 2 } justifycontent='center' alignItems='center'  sx={{m: '8vh'}}>
                        { videos }
                    </Container>
                </Container>
            </>
    } else {
        controls =
            <>
                <Container display='flex' justifycontent='center' alignitems='center'  direction='column'>
                    {/* <Container display='flex' xs> */}
                    <Container display="flex" justifycontent='center' alignitems='center' >
                        <label htmlFor="jsonFileInput" style={{
                                                            display: 'inline-block',
                                                            padding: '10px 20px',
                                                            background: '#fff', // White background
                                                            color: '#6C757D', // Font color in secondary
                                                            border: '1px solid #6C757D', // Secondary outline
                                                            borderRadius: '4px', // Rounded corners
                                                            cursor: 'pointer',
                                                            marginRight: '10px', // Added margin-right property
                                                            transition: 'color 0.3s', // Added transition for smooth color change
                                                            }}
                                                            onMouseOver={(event) => {
                                                                event.target.style.color = 'black'; // Change color on hover
                                                              }}
                                                              onMouseOut={(event) => {
                                                                event.target.style.color = '#6C757D'; // Reset color when not hovering
                                                              }}
                                                            >
                                                              Select JSON File
                                                            </label>
                        <input
                        id="jsonFileInput"
                        type='file'
                        accept='.json'
                        hidden
                        onChange={handleJSONSelect}
                        disabled={!!youtubeChannelId || !!youtubePlaylistId || pendingApiRequest}
                        />
                    {/* </Container> */}

                    {/* <Container display='flex' justifyContent='center' alignitems='center' className="mt-3 mb-2"> */}
                        <strong>Selected File: </strong>
                    {/* </Container> */}

                    {/* <Container display='flex' justifyContent='center' alignitems='center' className="mt-1 mb-2"> */}
                        { selectedJSON ? selectedJSON.name : 'None' }
                    {/* </Container> */}
                    </Container>
                    <Container sx={{mb: 3}} display='flex' xs={3}>
                        <TextField label='Channel ID' variant='standard' sx={{ width: '50%' }} onChange={ handleYoutubeUrlEntry } disabled={ !!selectedJSON || !!indexId || !!youtubePlaylistId}/>
                    </Container>

                    <Container sx={{mb: 3}} display='flex' xs={3}>
                        <TextField label='Playlist ID' variant='standard' sx={{ width: '50%' }}onChange={ handlePlaylistUrlEntry } disabled={ !!selectedJSON || !!indexId || !!youtubeChannelId }/>
                    </Container>


                    <Container display='flex' className="mt-3">
                        <Button disabled={ (!selectedJSON && !youtubeChannelId && !youtubePlaylistId && !indexId) || (pendingApiRequest) ? true : false} onClick={ getInfo }>
                            Submit
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
