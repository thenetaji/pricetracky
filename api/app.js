import express from "express";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
const app = express();

import router from "./routes.js";

//middlewares
app.use(morgan("dev"));
const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));
//pre flight request config
app.options("*", cors(corsOptions));
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  expressRateLimit({
    windowMs: 60 * 1000,
    max: 7,
  }),
);
app.use(express.json());

//main app logic
app.use("/", router);

//server initialization
const port = process.env.PORT || 2626;
app.listen(port, () => {
  console.info(`Server is at port ${port}... :)`);
});
