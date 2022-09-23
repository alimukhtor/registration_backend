import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import listEndpoints from 'express-list-endpoints'
const {MONGO_URL} = process.env
const server = express()
const port = process.env.PORT || 3001

// *********************** IMPORT ROUTES ******************
import userRouter from './db/users/index.js'

// *********************** MIDDLEWARES ******************
server.use(cors())
server.use(express.json())

const whiteList = [process.env.FE_LOCAL_URL, process.env.FE_REMOTE_URL];

const corsOptions = {
    origin: function (origin, next) {
        console.log(origin);
        if (!origin || whiteList.indexOf(origin) !== -1) {
            next(null, true);
        } else {
            next(new Error("Not allowed by CORS"));
        }
    },
};


// ************************ ROUTES *********************
server.use("/users", userRouter)


// *********************** DB CONNECTION ****************
mongoose.connect(MONGO_URL)
mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB!")
    server.listen(port, () => {
      console.table(listEndpoints(server))
      console.log(`Server running on port ${port}`)
    })
  })