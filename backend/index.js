const express = require('express');
const mongoose = require("mongoose")
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const { initializeApp } = require('firebase/app');
const { getAuth, verifyIdToken } = require('firebase/auth');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const PostModel  = require('./models/Post'); 
const User = require('./models/User'); 
const admin = require('firebase-admin');
require('dotenv').config();


const serviceAccount = {
  type: "service_account",
  project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
  private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure new lines are preserved
  client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
  auth_uri: process.env.GOOGLE_CLOUD_AUTH_URI,
  token_uri: process.env.GOOGLE_CLOUD_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_CLOUD_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLOUD_CLIENT_CERT_URL,
  universe_domain: process.env.GOOGLE_CLOUD_UNIVERSE_DOMAIN
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blog-4b077-default-rtdb.firebaseio.com"
});



// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

initializeApp(firebaseConfig);
const app = express();
const storage = getStorage();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://reactblog-eight.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://or63529:wLuePpf02OQrK4Qr@cluster0.vrmua9i.mongodb.net/');

// Multer setup for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to authenticate requests
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.sendStatus(403);
  }
};

// Route to verify token and create/update user
app.post('/verifyToken', authenticateToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        uid,
        email,
        Username: name,
      });
    } else {
      user.email = email;
      user.Username = name;
    }

    await user.save();

    res.status(200).json({ message: 'User authenticated and saved', user });
  } catch (error) {
    console.error('Error in /verifyToken:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET posts for a specific user
app.get('/user/:userId/posts',authenticateToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await PostModel.find({ author: userId })
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20);
      
      console.log(posts); 
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching posts' });
  }
});


// POST a new post for a specific user
app.post('/user/:userId/post', upload.single('file'), authenticateToken, async (req, res) => {
  const { userId } = req.params; // Extract userId from URL
  const { title, summary, content } = req.body; // Extract fields from body

  console.log('User info:', req.user); // Log user info for debugging

  try {
    // Ensure the logged-in user is the same as the userId in the URL
    if (req.user.uid !== userId) {
      return res.status(403).json({ error: 'You are not authorized to create a post for this user' });
    }

    // Handle file upload if present
    let imageUrl;
    if (req.file) {
      const storageRef = ref(storage, `images/${Date.now()}_${req.file.originalname}`);
      await uploadBytes(storageRef, req.file.buffer);
      imageUrl = await getDownloadURL(storageRef);
    }

    // Create the post document, including user email
    const postDoc = await PostModel.create({
      userId: req.user.uid, // Save the user's UID as userId
      title,
      summary,
      content,
      cover: imageUrl || null, // Use uploaded image URL if available
      author: req.user.uid,     // Author is the UID of the logged-in user
      email: req.user.email,    // Add user email to the post document
    });

    res.status(201).json(postDoc); // Respond with the created post
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'An error occurred while creating the post' });
  }
});


// PUT to update a specific user's post
app.put('/user/:userId/post/:id', upload.single('file'), authenticateToken, async (req, res) => {
 const { userId, id } = req.params; 
  const { title, summary, content } = req.body; // Extract fields from body


  try {
    // Ensure the logged-in user is the author of the post
    const postDoc = await PostModel.findById(id);
    if (!postDoc) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (postDoc.author.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this post' });
    }

    // Handle file upload if present
    let imageUrl = postDoc.cover; // Retain existing cover if no new file
    if (req.file) {
      const storageRef = ref(storage, `images/${Date.now()}_${req.file.originalname}`);
      await uploadBytes(storageRef, req.file.buffer);
      imageUrl = await getDownloadURL(storageRef);
    }

    // Update the post document
    await postDoc.updateOne({ title, summary, content, cover: imageUrl });
    res.json(postDoc); // Respond with the updated post
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'An error occurred while updating the post' });
  }
});

//Delete a post for specific user
app.delete('/user/:userId/post/:id', authenticateToken, async (req, res) => {
  const { userId, id } = req.params;

  try {
    // Find the post by ID
    const postDoc = await PostModel.findById(id);
    if (!postDoc) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Ensure the logged-in user is the author of the post
    if (postDoc.author.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }

    // Delete the post document
    await postDoc.remove(); // or use await PostModel.findByIdAndDelete(id);
    
    res.json({ message: 'Post deleted successfully' }); // Respond with success message
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'An error occurred while deleting the post' });
  }
});



// GET a specific post
app.get('/post/:id', async (req, res) => {
  const { id } = req.params; 


  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  try {
    const postDoc = await PostModel.findById(id).populate('author', ['username']);
    
    if (!postDoc) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(postDoc);
  } catch (error) {
    console.error('Error retrieving post:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the post' });
  }
});


app.get('/user/:userId/post/:id/share', authenticateToken, async (req, res) => {
  const { userId, id } = req.params;

  try {
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // Find the post by ID
    const postDoc = await PostModel.findById(id).populate('author', ['username']);
    
    if (!postDoc) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Ensure the logged-in user is allowed to share this post
    if (postDoc.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to share this post' });
    }

    // Format the post details for sharing
    const shareablePost = {
      title: postDoc.title,
      summary: postDoc.summary,
      content: postDoc.content,
      cover: postDoc.cover,
      author: postDoc.author.username,
      shareLink: `https://barneyy.vercel.app/post/${id}/share`, // Adjust the link as needed
    };

    // Respond with the formatted shareable post
    res.json(shareablePost);
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ error: 'An error occurred while sharing the post' });
  }
});



// Server setup
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));