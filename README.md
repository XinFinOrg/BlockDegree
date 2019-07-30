# Blockdegree - Dev Branch

<img src="https://img.shields.io/badge/deploy--ready-no-red" />  

This is the dev branch for blockdegree. 

Following are the tasks to do : 
### TO DO ( First batch )
- [x] First Restructuring codebase ( corrected way to use credentials etc.)
- [x] Login with Google, Twitter, Linkedin
- [x] Different js-services for different types of services ( auth, content, payment )
- [x] Fix login with Facebook 
- [X] Update Schema of the database and recursively change the DB interactions
- [x] Get 'payment' service working
- [x] Relocate passport to service directory
- [x] Fix re-loading of the '/exam-result' resulting in two copies of data being pushed
- [ ] Maintain atomicity of transactions ( exam submission, payments )
- [ ] Try to make a better structure for getting a PNG from hash ( currently huge 6 sec delay )
- [x] Fix for Delay of 5+ seconds for payment redirection ( will be addressed by loading-icon )
- [X] Directly post on twitter ( required ? ) 
- [x] Share on socials ( Twitter | Linkedin | Facebook )
- [x] Local download of the certificate
- [x] API to retrive certificate hashes of a user 
- [ ] Make social login e-mail independent ( incorporate phone users )
- [ ] Fix login button's JS ( UI; API is preesent )
- [ ] Add a loading icon to address the delay in paypal payment redirection ( UI )
- [ ] Fix the div tag's height change Enroll -> Take Exam ( UI )

- [ ] Complete testing and fixing the bugs found 

### TO DO ( SECOND BATCH )
- [ ] Make IPFS module scale across machines, monitor usage per api-call
- [ ] Progress bars ( UI + Backend )
- [ ] Integration of blockchain-test environment  
