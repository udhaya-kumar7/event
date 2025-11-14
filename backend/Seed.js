// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Event from "./models/Event.js"; // Make sure Event.js exists in models/

// dotenv.config();

// const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/luma_clone";

// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

// const events = [
//   {
//     title: "Music Fiesta",
//     date: "Oct 25, 2025",
//     time: "6:00 PM",
//     location: "New York, NY",
//     description: "Join us for a night of amazing music and fun!",
//     image: "https://source.unsplash.com/600x400/?concert"
//   },
//   {
//     title: "Tech Expo 2025",
//     date: "Nov 10, 2025",
//     time: "10:00 AM",
//     location: "San Francisco, CA",
//     description: "Explore the latest in tech and innovation.",
//     image: "https://source.unsplash.com/600x400/?tech"
//   },
//   {
//     title: "Food Carnival",
//     date: "Dec 5, 2025",
//     time: "12:00 PM",
//     location: "Los Angeles, CA",
//     description: "Taste the best dishes from around the world.",
//     image: "https://source.unsplash.com/600x400/?food"
//   }
// ];

// const seedDB = async () => {
//   await Event.deleteMany({});        // Deletes existing events
//   await Event.insertMany(events);    // Inserts sample events
//   console.log("Database seeded!");
//   mongoose.connection.close();
// };

// seedDB();
