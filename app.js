
/**
 * @purpose Bucket Ball problem solve functionalities
 * @version 1.0
 * @author Ritesh Das 
 * @createdDate 18 Jun 2023
 * @updateDate 18 Jun 2023
 * @updateBy Ritesh Das
 */

// Import required modules
const express = require('express');
const mongoose = require('mongoose');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bucket-ball-system', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define bucket schema and model
const bucketSchema = new mongoose.Schema({
  name: String,
  volume: Number,
  emptyVolume: Number
});

const Bucket = mongoose.model('Bucket', bucketSchema);

// Define ball schema and model
const ballSchema = new mongoose.Schema({
  name: String,
  volume: Number
});

const Ball = mongoose.model('Ball', ballSchema);

// Add a new bucket

app.post('/buckets', async (req, res) => {
  try {
    const { name, volume } = req.body;

    // Create a new bucket
    const bucket = new Bucket({
      name,
      volume,
      emptyVolume: volume
    });

    // Save the bucket to the database
    await bucket.save();

    res.status(201).json(bucket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add bucket' });
  }
});

// Add a new ball
app.post('/balls', async (req, res) => {
  try {
    const { name, volume } = req.body;

    // Create a new ball
    const ball = new Ball({
      name,
      volume
    });

    // Save the ball to the database
    await ball.save();

    res.status(201).json(ball);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add ball' });
  }
});

// Place balls in buckets
app.post('/place-balls', async (req, res) => {
  try {
    const balls = req.body.balls;

    // Sort buckets in descending order of emptyVolume
    const buckets = await Bucket.find().sort({ emptyVolume: -1 });

    let placedBalls = [];

    // Iterate over each ball
    for (const ball of balls) {
      let remainingVolume = ball.volume;

      // Iterate over each bucket
      for (const bucket of buckets) {
        if (bucket.emptyVolume >= remainingVolume) {
          // Place the ball in the bucket
          placedBalls.push({ ball: ball.name, bucket: bucket.name });

          // Update emptyVolume of the bucket
          bucket.emptyVolume -= remainingVolume;
          await bucket.save();

          break;
        } else {
          // Place part of the ball in the bucket
          placedBalls.push({ ball: ball.name, bucket: bucket.name });

          // Update remainingVolume
          remainingVolume -= bucket.emptyVolume;

          // Update emptyVolume of the bucket
          bucket.emptyVolume = 0;
          await bucket.save();
        }
      }
    }

    res.status(200).json({ placedBalls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place balls' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
