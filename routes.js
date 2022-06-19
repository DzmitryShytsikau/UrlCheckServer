const express = require('express');
const fileUpload = require('express-fileupload');
const bp = require('body-parser');

const router = express.Router();

router.use(fileUpload({
    createParentPath: true
}));

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get("/server-state", function(req, res) {
  res.status(200).send('Ok!');
});

router.post('/upload-file', async (req, res) => {
    var wrap = req.body;
    if(!wrap) {
        res.status(200).send({
            status: false,
            message: 'Text is empty!'
        });
    } else {
        var urls = '';
        var data = wrap.uncheckedText;
        var fileText = data.toString('utf8');
        urls = urls + fileText.match(/\b((https?|ftp|file):\/\/|(www|ftp)\.)[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/ig);
        var splittedUrls = urls.split(',');
        var isInfected = false;
        var fixedUrls;
        for (var i = 0; i < splittedUrls.length; i++) {
            var fixedUrl1 = splittedUrls[i].replace(/\s/g,"");
            var fixedUrl2 = splittedUrls[i].replace(/\s/g,"");
            if(!fixedUrl1.includes("http")){
                fixedUrl1 = 'http://' + fixedUrl1;
                fixedUrl2 = 'https://' + fixedUrl2;
            }
            for(var e = 0 ; e < wrap.restrictedUrls.length; e++){
                if(!isInfected){
                    if(fixedUrl1 === wrap.restrictedUrls[e] || fixedUrl2 === wrap.restrictedUrls[e]){
                        console.log('==== INFECTED');
                        var isInfected = true;
                    } else {
                        if(!fixedUrls){
                            fixedUrls = "; \n" + fixedUrl1;
                            fixedUrls = fixedUrls + "; \n" + fixedUrl2;
                        } else {
                            fixedUrls = fixedUrls + "; \n" + fixedUrl1;
                            fixedUrls = fixedUrls + "; \n" + fixedUrl2;
                        }
                    }
                }
            }
        }
        if(isInfected){
            res.status(200).send({
                status: true,
                message: 'One or more URLs are restricted!'
            });
        } else {
            res.status(200).send({
                status: true,
                message: fixedUrls
            });
        }
    }                                            
});

module.exports = router;
