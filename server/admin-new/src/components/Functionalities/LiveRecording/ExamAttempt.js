import React, {useState, useEffect} from 'react'
import {getExamAttemptsFromExamSchedulesSlug, setExamAttempts} from '../../../services/LiveRecording.services';
import {recordingPath} from '../../../constants/static'

export default function ExamAttempt({examSchedulesSlug}) {
  const [score, scoreSet] = useState(0);
  const [loading, loadingSet] = useState(false);
  const [examAttempts, examAttemptsSet] = useState([]);
  const [selection, selectionSet] = useState(0);

  useEffect(() => {
    const loadExamAttempts = async () => {
      loadingSet(true)
      const examAttempts = await getExamAttemptsFromExamSchedulesSlug(examSchedulesSlug)
      examAttemptsSet(examAttempts)
      loadingSet(false)
    }

    loadExamAttempts()
  }, [examSchedulesSlug])
  
  const handleSubmit = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const setMarks = async () =>{
      loadingSet(true)
      const r = await setExamAttempts({id: examAttempts[selection].id, totalMarks: score})
      loadingSet(false)
      scoreSet(0)
    }
    setMarks()
  }

  return (
    <div>
      <div>Select Attempt</div>
      {loading ? (<div className="text-center">Loading...</div>) : (
        <div>
          {examAttempts.length > 0 ? (<div>
            <ul>
              {examAttempts.map((e,i)=>(<li onClick={()=>selectionSet(i)}>{e.email}:{e.attemptNo}</li>))}
            </ul>
            <div>
              <div>Selected examSchedule:</div>
              <div>totalMarks: {examAttempts[selection].totalMarks || ''}</div>
              <div>attemptNo: {examAttempts[selection].attemptNo || ''}</div>
              <div>username: {examAttempts[selection].username || ''}</div>
              <div>user email: {examAttempts[selection].email || ''}</div>
              {examAttempts[selection].userRecordingFileName && (
                <div>camera video: {`${recordingPath}${examAttempts[selection].userRecordingFileName}`}</div>
              )}
              {examAttempts[selection].screenRecordingFileName && (
                <div>screen video: {`${recordingPath}${examAttempts[selection].screenRecordingFileName}`}</div>
              )}
            </div>
            <form class="form-inline">
              <div class="form-group mx-sm-3 mb-2">
                  <label for="Score" class="sr-only">Score</label>
                  <input type="number" class="form-control" id="Score" placeholder="Score" onChange={(e)=>scoreSet(e.target.value)} value={score}/>
              </div>
              <button type="button" class="btn btn-primary mb-2" onClick={handleSubmit}>Submit</button>
            </form>
          </div>) : (<div className="text-center">No Attempts</div>)}
        </div>
      )}
    </div>
  )
}
