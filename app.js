import express from 'express';
import { HfInference } from "@huggingface/inference";
import imageToUri from 'image-to-uri';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
dotenv.config();



const app = express();
app.set('view engine', 'ejs');


//Hugging Face Configuration
const HF_ACCESS_TOKEN = process.env.HFTOKEN;
const inference = new HfInference(HF_ACCESS_TOKEN);


//Middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// Generates URI from Image and returns it.
function returnURI(image){
    const uri = imageToUri(`${image}`);
    return uri;
}


// Takes URI and Returns a Caption
async function generateCaptions(uri){

    const res = await inference.imageToText({
        data: await (await fetch(`${uri}`)).blob(),
        model: 'nlpconnect/vit-gpt2-image-captioning',  
      })

      return res;
}



app.get('/home', (req, res) => {
    res.render('index', { result : false , image : false});
  });



app.post('/home', upload.single('image'), async (req, res) => {

    const image = req.file.path;
   

    const uri = await returnURI(image);
    const result = await generateCaptions(uri);

    res.render('index', { result : result });

  });



app.listen(8000, ()=>{
    console.log(`server listening on port 8000`);
});




