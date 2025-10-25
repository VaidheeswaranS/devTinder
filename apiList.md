# DevTinder API's

## authRouter
- POST /signup
- POST /login
- POST /logout

## profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/changePassword
- PATCH /profile/forgotPassword

## connectionRequestRouter
- POST /request/send/:status/:userId - (interested or ignored)
- POST /request/review/:status/:requestId - (accepted or rejected)

## userRouter
- GET /user/connections
- GET /user/requests/received
- GET /user/feed