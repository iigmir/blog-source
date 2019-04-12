const ary = require("../info-files/contents.json");
const fs = require("fs");

if( Array.isArray(ary) )
{
    ary.map( (item, index) =>
    {
        let filename = "";
        if( item.hasOwnProperty("context") )
        {
            filename = `../articles/${ item.id }.md`;
            fs.writeFile( filename , item.context , (err) =>
            {
                if (err) throw err;
                console.log(`Write file: ../articles/${ item.id }.md`);
            });
        }
    });
}
else
{
    console.log(ary);
}