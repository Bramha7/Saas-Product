import mongoose from "mongoose";

const mongo_uri = process.env.MONGO_URI;

function connect() {
  mongoose
    .connect(mongo_uri)
    .then(() => console.log("Connected Successfully"))
    .catch((err) => console.log("Error", err));
}

export default connect;
