# DevTinder API's

## authRouter
- POST /signup
- POST /login
- POST /logout

##  profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/changePassword
- PATCH /profile/forgotPassword

## connectionRequestRouter
- POST /request/send/:status/:userId - (interested or ignored)
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

## userRouter
- GET /user/conenctions
- GET /user/requests
- GET /user/feed