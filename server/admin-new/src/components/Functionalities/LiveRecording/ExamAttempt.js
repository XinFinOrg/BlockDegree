import React, {useState, useEffect} from 'react'
import { getExamAttemptsFromExamSchedulesSlug, setExamAttempts } from '../../../services/manageExam.services';
import { videoRecordingPath, screenRecordingPath } from '../../../constants/static'

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
      const examAttempt = examAttempts[selection]
      const r = await setExamAttempts({id: examAttempt.id, totalMarks: score})
      const newExamAttempts = examAttempts.map((e,i)=>{
        if (i === selection){
          e.totalMarks = score
        }
        return e
      })
      examAttemptsSet(newExamAttempts)
      loadingSet(false)
      scoreSet(0)
    }
    setMarks()
  }

  const examAttempt = examAttempts[selection]
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
              <div>totalMarks: {examAttempt.totalMarks || ''}</div>
              <div>attemptNo: {examAttempt.attemptNo || ''}</div>
              <div>username: {examAttempt.username || ''}</div>
              <div>user email: {examAttempt.email || ''}</div>
              {examAttempt.userRecordingFileName && (
                <div>camera video: {`${videoRecordingPath}${examAttempt.userRecordingFileName}`}</div>
              )}
              {examAttempt.screenRecordingFileName && (
                <div>screen video: {`${screenRecordingPath}${examAttempt.screenRecordingFileName}`}</div>
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
