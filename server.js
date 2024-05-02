import { app } from "./app.js";
import { connectionDB } from "./data/database.js";
import cloudinary from "cloudinary"
import Stripe from "stripe";



connectionDB();

export const stripe = new Stripe(process.env.STRIPE_API_SECRET)
// configuring cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

})
app.listen(process.env.PORT, () => {
    console.log(
        `Server listening on port: ${process.env.PORT}, in ${process.env.NODE_ENV}
         MODE.`
    )

})