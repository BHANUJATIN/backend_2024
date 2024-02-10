import express from "express";

const app = express();

// app.get("/", (req, res) => {
//   res.send("Server is running ..");
// });

const port = process.env.PORT || 3000;

// get a list of jokes
app.get('/api/v1/jokes', (req, res) => { // std way is api/v1/jokes
    const jokes = [
        {
          id: 1,
          title: "The Math Magician",
          content: "Why was the equal sign so humble? Because he knew he wasn't less than or greater than anyone else."
        },
        {
          id: 2,
          title: "Coffee Lover",
          content: "Why do coffee beans never get into arguments? Because they know how to espresso themselves."
        },
        {
          id: 3,
          title: "Light Bulb Moment",
          content: "How many programmers does it take to change a light bulb? None, that's a hardware issue."
        },
        {
          id: 4,
          title: "Vegetarian Dinosaur",
          content: "What do you call a dinosaur with an extensive vocabulary? A thesaurus."
        },
        {
            id: 5,
            title: "Astronaut's Favorite Candy",
            content: "Why did the astronaut break up with his girlfriend? Because he needed space."
          },
          {
            id: 6,
            title: "Tech Support",
            content: "Why did the computer keep its drink on the windowsill? Because it wanted a cold drink."
          },
          {
            id: 7,
            title: "Time Traveler's Meeting",
            content: "Time travelers meeting: 'When do we want time travel?' 'It's irrelevant.'"
          }
      ];
      
    res.send(jokes);
})

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
});
