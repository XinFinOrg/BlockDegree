# Blockdegree - UI-dev Branch

<img src="https://img.shields.io/badge/deploy--ready-no-red" />

<img src="https://img.shields.io/badge/tested-ongoing-blue" />
<img src="https://img.shields.io/badge/uat--ready-yes-green" />  
<img src="https://img.shields.io/badge/UI--ready-ongoing-blue" />  

This is the UI-dev branch for blockdegree. 

## Setup

1. Clone the repository
2. run `npm install`; provide root access if permission denied like this : `sudo npm install --allow-root --unsafe-perm=true`
3. Run the commnad `gulp build`
4. Start MongoDB, local ipfs network ( if a local setup; for local set IPFS env = local )
5. Create a `.env` file as per the file `.env.example` given in the repo & set your cerdential with appropriate callbacks
6. To start: `npm run start`  

### BUGS
Following are the bugs, to be solved asap : 
- [x] Course 2, 3 payment not being updated
- [ ] Redirect to / from /login sometimes (UI) - issue with browser cookies
- [x] Forwading headers in IIS reverse proxy ( hosting -> shifted to Nginx, need to write complete URLs for callbacks )

Following are the tasks to do : 
### TO DO 
- [x] Fix login button's JS ( UI; API is present )
- [x] Contact Us mail service
- [ ] Add a loading icon to address the delay in paypal payment redirection ( UI - DATTABHAI )
- [ ] Fix the div tag's height change Enroll -> Take Exam ( UI - DATTABHAI )
- [ ] Complete testing and fixing the bugs found 
- [ ] Remove unnecessary node dependencies
- [ ] Add a simple error page to account for all errors
- [ ] Display buttons on the /exam-result page as per auth response
- [x] Update article URL for linkedin, twitter post
- [x] API to enable migration
- [x] Blockdegree User stats API ( priv. repo ) 
- [x] Extract timestamp out of exported data from MongoDB
- [x] Notify users on 1 HR gap between giving exams ( Not required )
- [x] Track the course visits of the users 
- [x] Set up user profile, must include { photo, email, name, education details }
- [ ] Setup two different certis one according to Uni. pattern, one including details of the user+exam ( UI )

