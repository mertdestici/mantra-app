const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const mantraRoutes = require('./routes/mantraRoutes');
const audioRoutes = require('./routes/audioRoutes');

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', mantraRoutes);
app.use('/api', audioRoutes);


app.listen(PORT, () => {
  console.log(`🟢 Server is running at http://localhost:${PORT}`);
});
