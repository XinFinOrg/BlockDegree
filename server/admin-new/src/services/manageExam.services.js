import { base_url } from '../constants/api'

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

export const getExamSchedules = async () => {
  try {
    const url = base_url + `examSchedules/submitted`
    const response = await fetch(url);
    const {status, examSchedules} = await response.json();
    if (status){
      return examSchedules.map(transformExamSchedule)
    }
  } catch(e) {
    return {status: false, error: 'failed to fetch examSchedules'}
  }
}

function transformExamSchedule(e) {
  return {
    id: e._id,
    attemptsTaken: e.attemptsTaken,
    courseTitle: e.course.title,
    duration: e.duration,
    username: e.user.name,
    email: e.user.email,
    urlSlug: e.urlSlug,
  }
}

export const getExamAttemptsFromExamSchedulesSlug = async (examSchedulesSlug) => {
  try {
    const url = base_url + `examAttempts/examSchedule/${examSchedulesSlug}`
    const response = await fetch(url);
    const {status, examAttempts} = await response.json();
    if (status){
      return examAttempts.map(transformExamAttempts)
    }
  } catch(e) {
    return {status: false, error: 'failed to fetch examSchedules'}
  }
}

function transformExamAttempts(e) {
  return {
    id: e._id,
    totalMarks: e.totalMarks,
    attemptNo: e.attemptNo,
    attempt: e.attempt,
    username: e.user.name,
    email: e.user.email,
    userRecordingFileName: e.userRecordingFileName,
    screenRecordingFileName: e.screenRecordingFileName,
  }
}

export const setExamAttempts = async ({id, totalMarks}) => {
  try {
    const r = await postData(base_url + `examAttempt/marks`, { id, totalMarks })
    return r
  } catch(e) {
    return {status: false, error: 'failed to fetch examSchedules'}
  }
}