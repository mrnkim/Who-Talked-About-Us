if (taskVideos) {
  videos = taskVideos.map((video, index) => {
    let indexingStatusContainer = null;

    if (video.status) {
      let indexingMessage =
        video.status === "ready" ? (
          <div className="statusMessage doneMessage">
            {" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10 1.66667C5.40001 1.66667 1.66667 5.40001 1.66667 10C1.66667 14.6 5.40001 18.3333 10 18.3333C14.6 18.3333 18.3333 14.6 18.3333 10C18.3333 5.40001 14.6 1.66667 10 1.66667ZM10.8333 14.1667H9.16667V9.16667H10.8333V14.1667ZM10.8333 7.50001H9.16667V5.83334H10.8333V7.50001Z"
                fill="#5AC903"
              />
            </svg>{" "}
            Complete{" "}
          </div>
        ) : (
          <div className="statusMessage">Waiting...</div>
        );

      indexingStatusContainer = (
        <Container
          key={video.video_url || video.url}
          className="indexingStatusContainer"
        >
          {video.status === "ready" ? null : <LoadingSpinner />}

          <div>
            <Container
              variant="body2"
              color="text.secondary"
              display="flex"
              alignitems="center"
              className="indexingStatus"
            >
              {video.process ? (
                <div className="statusMessage">
                  Indexing... {Math.round(video.process.upload_percentage)}%
                </div>
              ) : (
                indexingMessage
              )}
            </Container>
          </div>
        </Container>
      );
    }

    // let element = (
    //   <Container key={video.video_url || video.url} className="taskVideo">
    //     <Container>
    //       <Card style={{ border: "none", margin: "0.5rem" }}>
    //         <a href={video.video_url || video.url} target="_blank">
    //           <Card.Img
    //             src={
    //               video.thumbnails[video.thumbnails.length - 1].url ||
    //               video.bestThumbnail.url
    //             }
    //             style={{ width: "100%", height: "100%" }}
    //           />
    //         </a>
    //       </Card>
    //       <Container
    //         style={{
    //           display: "flex",
    //           justifyContent: "center",
    //           alignitems: "center",
    //           marginTop: "10px",
    //         }}
    //       >
    //         {indexingStatusContainer ||
    //           (pendingApiRequest ? (
    //             <div className="downloadSubmit">
    //               Downloading & Submitting...
    //             </div>
    //           ) : null)}
    //       </Container>
    //     </Container>
    //   </Container>
    // );

    return element;
  });
  controls = (
    <>

    </>
  );
}



else {
  controls = (
    <>

}
return controls;



{!tasks && pendingApiRequest && (
            <div className="downloadSubmit">Downloading & Submitting...</div>
          )}


<div className="taskVideoContainer">
<div className="downloadSubmit">Downloading & Submitting...</div>
</div>