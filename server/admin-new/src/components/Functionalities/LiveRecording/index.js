import React, {useState, useEffect} from 'react'
// import Dropdown from "react-bootstrap/dropdown";
import {getExamSchedules} from '../../../services/manageExam.services';
import ExamAttempt from './ExamAttempt';

export default function LiveRecording() {
  const [examSchedules, examSchedulesSet] = useState([]);
  const [selection, selectionSet] = useState(0);
  const [loading, loadingSet] = useState(false);
  useEffect(() => {
    const loadExamSchedules = async () => {
      loadingSet(true)
      const examSchedules = await getExamSchedules()
      examSchedulesSet(examSchedules)
      loadingSet(false)
    }

    loadExamSchedules()
  }, [])
  
  
  return (
    <div>
      <div className="row">
        <div className="col-md-12">
          {loading ? (<div className="text-center">Loading...</div>) : (
            <div>
            {examSchedules.length > 0 && (<div>
              <ul>
                {examSchedules.map((e,i)=>(<li onClick={()=>selectionSet(i)}>{e.courseTitle}:{e.attemptsTaken}</li>))}
              </ul>  
              {/* <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  Dropdown Button
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                  <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                  <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown> */}
              <div>
                <div>Selected examSchedule:</div>
                <div>courseTitle: {examSchedules[selection].courseTitle || ''}</div>
                <div>attemptsTaken: {examSchedules[selection].attemptsTaken || ''}</div>
                <div>username: {examSchedules[selection].username || ''}</div>
                <div>user email: {examSchedules[selection].email || ''}</div>
              </div>
              <ExamAttempt examSchedulesSlug={examSchedules[selection].urlSlug}/>
            </div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// import React, { Component } from "react";
// // import DownloadUserEmailList from "./DownloadUserEmailList";

// class LiveRecording extends Component {
//   render() {
//     return (
//       <div>
//         <div className="row">
//           <div className="col-md-4">
//             live
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default LiveRecording;
