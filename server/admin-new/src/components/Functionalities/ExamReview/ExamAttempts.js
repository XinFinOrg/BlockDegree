import React, {useState, useEffect} from 'react'
import { getExamAttemptsFromExamSchedulesSlug, setExamAttempt, getCertificate } from '../../../services/manageExam.services';
import { videoRecordingPath, screenRecordingPath } from '../../../constants/static'

function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}

function getTotalMarks(attempt) {
  if (Array.isArray(attempt)) {
    return attempt.reduce((a,c) => a+parseFloat(c.marks) ,0)
  }
  return 0
}

export default function ExamAttempt({examSchedulesSlug, course}) {
  const [loading, loadingSet] = useState(false);
  const [examAttempts, examAttemptsSet] = useState([]);
  const [selection, selectionSet] = useState(0);
  const [attemptData, attemptDataSet] = useState([]);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const loadExamAttempts = async () => {
      loadingSet(true)
      const examAttempts = await getExamAttemptsFromExamSchedulesSlug(examSchedulesSlug)
      examAttemptsSet(examAttempts)
      attemptDataSet(examAttempts[selection].attempt)
      loadingSet(false)
    }

    loadExamAttempts()
  }, [examSchedulesSlug])
  
  const handleSubmit = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const setMarks = async () =>{
      loadingSet(true)
      const id = examAttempts[selection].id
      const totalMarks = getTotalMarks(attemptData)
      const examAttempt = await setExamAttempt({id, totalMarks, attempt: attemptData})
      attemptDataSet(examAttempt.attempt)
      const newExamAttempts = examAttempts.map(a=>{
        if (a.id === examAttempt.id){
          return examAttempt
        }
        return a
      })
      examAttemptsSet(newExamAttempts)
      loadingSet(false)
    }
    setMarks()
  }

  const selectAttempt = (i) => {
    attemptDataSet(examAttempts[selection].attempt)
    selectionSet(i)
  }
  const updateFormData = (idx, name, value) => {
    const newattemptData = attemptData
    newattemptData[idx][name] = value
    attemptDataSet(newattemptData)
    forceUpdate()
  }
  const generateCertificate = async (email) => {
    const r = await getCertificate({email, course, marksObtained: getTotalMarks(attemptData)})
    console.log(r)
    debugger
  }

  const examAttempt = examAttempts[selection]
  const totalMarks = getTotalMarks(attemptData)
  return (
    <div>
      <div>Select Attempt</div>
      {loading ? (<div className="text-center">Loading...</div>) : (
        <div>
          {examAttempts.length > 0 ? (<div>
            <ul>
              {examAttempts.map((e,i)=>(<li key={i} onClick={()=>selectAttempt(i)}>{e.email}:{e.attemptNo}</li>))}
            </ul>
            <div>
              <div>Selected examSchedule:</div>
              <div>totalMarks: <b>{examAttempt.totalMarks || ''}</b></div>
              {parseFloat(examAttempt.totalMarks) >= 50 ? (
                <div><button type="button" className="btn btn-primary mb-2" onClick={()=>generateCertificate(examAttempt.email, )}>Generate Certificate</button></div>
              ) : (
                <div>Canditate needs atleast 50 marks to generate Certificate</div>
              )}
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
            <form className="form">
              <div className="form-group">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Question</th>
                      <th scope="col">Answer</th>
                      <th scope="col">User's Answer</th>
                      <th scope="col">marks</th>
                      <th scope="col">remark</th>
                    </tr>
                  </thead>
                  <tbody>
                      {attemptData.map((a,i) => (
                        <tr key={i}>
                          <td style={{width: '20%'}}>{a.givenQuestion}</td>
                          <td style={{width: '25%'}}>{a.givenAnswer}</td>
                          <td style={{width: '25%'}}>{a.usersAnswer}</td>
                          <td style={{width: '10%'}}>
                            <input type="number" className="form-control" placeholder="marks" onChange={(e)=>updateFormData(i,"marks",parseFloat(e.target.value) || undefined)} value={a.marks}/>
                          </td>
                          <td style={{width: '10%'}}>
                            <input type="string" className="form-control" placeholder="remark" onChange={(e)=>updateFormData(i,"remark",e.target.value)} value={a.remark}/>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                
              </div>
              <div className="form-group mx-sm-3 mb-2">
                <div>Score: {Number.isNaN(totalMarks) ? '--' : totalMarks}</div>
              </div>
              <button type="button" className="btn btn-primary mb-2" onClick={handleSubmit}>Submit</button>
            </form>
          </div>) : (<div className="text-center">No Attempts</div>)}
        </div>
      )}
    </div>
  )
}
