(function(){
  let cacheData = window.location.pathname.split('/', 3)[2],
      currentTopic = window.location.pathname.split('/')[3].replace(/-/g, ' ');
    console.log(currentTopic)

  function handleData(data) {
    debugger
    let dataArr = JSON.parse(data);
    let currentIdx = dataArr.findIndex(course => {
      return course['topic'].toLowerCase().replace(/\?/g, '') == currentTopic
    });
    console.log(currentIdx)
    let nxtTopic = dataArr[currentIdx + 1]['topic'],
        nxtTopicUrl = nxtTopic.toLowerCase().replace(/\s/g, '-' )

    document.getElementById('next-page').innerHTML = 'Next: ' +  '<a href="'+ nxtTopicUrl +'">' +
                                                      nxtTopic +'</a>'
  }

  debugger
  if(sessionStorage.getItem(cacheData) != undefined) {
    handleData(sessionStorage.getItem(cacheData))
  } else {
    ajax_get('/data/courses.json', (data) => {
        let courseInfo = data['courses'].find(course => (course['slug'] === cacheData))['curriculum']

        sessionStorage.setItem(cacheData, JSON.stringify(courseInfo));
        handleData(data);
      }
    )
  }
})();
