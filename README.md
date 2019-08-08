# Blockdegree - UAT Branch

<img src="https://img.shields.io/badge/deploy--ready-no-red" />

<img src="https://img.shields.io/badge/tested-ongoing-blue" />
<img src="https://img.shields.io/badge/uat--ready-yes-green" />  
<img src="https://img.shields.io/badge/UI--ready-ongoing-blue" />  

This is the uat branch for blockdegree. 

## Setup

1. Clone the repository
2. run `npm install`; provide root access if permission denied like this : `sudo npm install --allow-root --unsafe-perm=true`
3. Run the commnad `gulp build`
4. Start MongoDB, local ipfs network ( if a local setup )
5. Create a `.env` file as per the file `.env.example` given in the repo & set your cerdential with appropriate callbacks
6. To start: `npm run start` 

Following are the tasks to do : 
### TO DO 
- [x] Fix login button's JS ( UI; API is present )
- [ ] Add a loading icon to address the delay in paypal payment redirection ( UI - DATTABHAI )
- [ ] Fix the div tag's height change Enroll -> Take Exam ( UI - DATTABHAI )
- [ ] Complete testing and fixing the bugs found 
- [ ] Remove unnecessary node dependencies
- [ ] Add a simple error page to account for all errors
- [ ] Display buttons on the /exam-result page as per auth response
- [ ] Update article URL for linkedin, twitter post

