const request = require('request');
const cheerio = require('cheerio');
const readline = require("readline");

const { VK, Keyboard } = require('vk-io');
const { SessionManager } = require('@vk-io/session');

var urll = "http://randomfilms.ru/film/";

const vk = new VK({
	token: "a5272af24f13757e5b467ccf337cf0f14515f84bccbfa829c2d6cfbdf49f0ab12b0d1c00e78a91823b30a"
});


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ss = new SessionManager();

var fs = require('fs');

var kbstart = {
    "one_time": null,
    "buttons": [
        [
            {
                "action": {
                    "type": "text",
                    "payload": "{\"button\": \"2\"}",
                    "label": "Случайный фильм"
                },
                "color": "positive"
            }
        ]
    ]
};

getTitle = (url, senderId, msg) =>{
    /*rl.question("Enter word: ",(answer)=>{
        url+=answer.toString();
    });*/
    console.log(url);
    console.time("1");
    return new Promise(resolve=>{
        request(url, (error, response, body)=>{
            var $ = cheerio.load(body)
            if(error || $('body').text().includes('404 film not found'))
            {
                console.log("error: " + error);
                return getTitle(urll + Math.floor(Math.random() * 10000).toString());
            }
            else{
                console.log("Okay");;
                let f1 = new Promise(resolve=>{
                    title = $('h1').text().replace(/\s+/g," ");
                    resolve();
                });
                
                let f2 = new Promise(resolve=>{
                    genres = $('div[class="navigation"]').text().replace(/\s+/g,", ").slice(2).slice(0, -2);
                    resolve();
                });

                let f3 = new Promise(resolve=>{
                    rating = $('div[class="margin-bottom--24"]').text().slice(1);
                    resolve();
                });

                let saveTheme = new Promise(resolve=>{
                    Theme = $('meta[property="og:image"]').attr("content");
                    console.log(urll.slice(0, -6) + Theme);
                    /*download('urll.slice(0, -6) + Theme', 'urll.slice(0, -6) + Theme + ".jpeg"', () => {
                        console.log('done');
                    });*/
                    let uri = urll.slice(0, -6) + Theme;
                    console.log(uri);
                    msg.sendPhoto(uri);



                    resolve();
                });

                //var title = $('h1').text().replace(/\s+/g," ");
                //var genres = $('div[class="navigation"]').text().replace(/\s+/g,", ").slice(2).slice(0, -2);
                //var rating = $('div[class="margin-bottom--24"]').text().slice(1);//replace(/\s+/g,", ").slice(2).slice(0, -2);
                Promise.all([f1, f2, f3, saveTheme]).then(()=>{
                    resolve("Название фильма: " + title + "\nЖанры: " + genres + "\nРейтинг: " + rating);
                });
            }
        });
    });
};
vk.updates.hear('Начать', async (msg) => {
    //console.log(msg.getAttachments([type]));
    //console.log(1);
    try{
        msg.send({message: 'Привет, напиши или нажми на кнопку "Случайный фильм", чтобы начать', keyboard: JSON.stringify(kbstart)});
    }
    catch(err){
        console.log(err);
    }
});

vk.updates.hear('Случайный фильм', async (msg) => {
    //console.log(msg.getAttachments([type]));
    //console.log(1);
    try{
        let mmsid = msg.senderId;
        getTitle(urll + Math.floor(Math.random() * 10000).toString(), mmsid, msg).then((data)=>{
            console.log(data);
            msg.send({message: data, keyboard: JSON.stringify(kbstart)});
            console.timeEnd("1");
        });
    }
    catch(err){
        console.log(err);
    }
});
vk.updates.start().catch(console.error);