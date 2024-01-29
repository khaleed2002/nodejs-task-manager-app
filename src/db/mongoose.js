import mongoose from "mongoose";

try {
    mongoose.connect(process.env.MONGODB_URL);
} catch (error) {
    console.log("Error occured when connecting with the database.");
    console.log(error);
} finally {
}

export default mongoose;
