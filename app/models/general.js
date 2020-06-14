const cheerio = require("cheerio");
const axios = require("axios").default;
const mysql = require('mysql');


const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'scrap'
});


const fethHtml = async url => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch {
        console.error(`ERROR: An error occurred while trying to fetch the URL: ${url}`);
    }
};

const general = selector => {
    const tipe = selector
        .find("h2")
        .find("h2[class='ivTl'] > span[class='ivTl_name']")
        .text()
        .trim();

    const hargaOtr = selector
        .find("p")
        .find("p[class='modelDtl_price'] > span[class='modelDtl_priceLow']")
        .text()
        .trim();


    saveToSQL(tipe,hargaOtr);

    return {
        tipe,
        hargaOtr
    };
};
function saveToSQL(tipe, hargaOtr){
    let sql = "INSERT INTO general (`type`, `hargaOtr`) VALUES(?)";
    let values = [tipe,hargaOtr];

    db.query(sql, [values], function (err) {
        if (err) throw err;
        db.end()
    });

    // db.connect();
    // db.query('INSERT INTO general (type, hargaOtr) VALUES(?)',[tipe, hargaOtr],function(err,result){
    //     console.log('Inserted data into table.')
    // });

    // db.query('INSERT INTO general(hargaOtr) VALUES(?)',[hargaOtr],function(err,result){
    //     console.log('Inserted ' + hargaOtr + ' into table.')
    // });

    // db.end();
}
const scrapGeneral = async () => {
    const specUrl =
        "https://id.priceprice.com/Suzuki-Ignis-19115/";

    const html = await fethHtml(specUrl);

    const selector = cheerio.load(html);

    const searchResults = selector("body")
        .find(".modelDtlWrap > .modelDtl");

    const generals = searchResults
        .map((idx, el) => {
            const elementSelector = selector(el);
            return general(elementSelector);
        })
        .get();

    return generals;
};

module.exports = scrapGeneral;