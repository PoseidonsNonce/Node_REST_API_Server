// Express packages 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// AUTH0 packages
const jwt = require('express-jwt');
const jwkRsa = require('jwks-rsa');

const {startDatabase} =  require('./database/mongo');
const {insertAd, getAds, deleteAd, updateAd} = require('./database/db');

const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));


const checkJwt = jwt({
    secret: jwkRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: '{YOUR JWKSURI  auth0 }'
    }),
    audience: '{ YOUR AUDIENCE }',
    issuer: '{YOUR ISSUER}',
    algorithms: ['RS256']
});


app.get('/', async (req, res) =>{
    res.send(await getAds());
});

// snice this is set after GET -- it will not be used for get requests -- good 
app.use(checkJwt);

app.post('/', async(req, res) =>{
    const newAd = req.body;
    await insertAd(newAd);
    res.send({message: "New Add Inserted."});
});

app.delete('/:id', async (req, res) => {
    await deleteAd(req.params.id);
    res.send({message: 'Ad removed'});
});

app.put('/:id', async (req, res) =>{
    const updatedAd = req.body;
    await updateAd(req.params.id, updatedAd);
    res.send({message: 'Ad Updated'});
});



startDatabase().then(async () =>{
    await insertAd({title: "Node server from in-memory MongoDB"});

    app.listen(3001, async () => {
        console.log('listening on port 3001');
    });
});

