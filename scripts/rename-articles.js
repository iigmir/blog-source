/**
 * # Rename articles. Method is increse dec position
 * # For example:
 * # 1.md => 001.md
 * # 23.md => 023.md
 */

const articles = "../articles";
const fs = require("fs");

fs.readdir(articles, (err, files) =>
{
    files.forEach( (file_name, file_index) =>
    {
        let zero_polyfill = ["","00","0"];
        let file_number = file_name.split(".")[0];
        let old_file_name = `../articles/${file_name}`;
        let new_file_name = `../articles/${zero_polyfill[file_number.length]}${file_number}.md`;
        fs.rename( old_file_name , new_file_name, (err) =>
        {
            if (err) throw err;
            console.log(`Rename ${old_file_name} to ${new_file_name}`);
        });
    });
});