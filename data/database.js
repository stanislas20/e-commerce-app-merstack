import mongoose from "mongoose";


export const connectionDB = async()=>{

    try {
        const {connection } = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "ecommerceApp"
        })
        console.log(`Server connected to database ${connection.host}`)
        
    } catch (error) {
        console.log("Some error occured", error)
        process.exit(1) // to shut down the server
    }
}