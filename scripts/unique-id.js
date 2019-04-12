/**
 * What does this script for:
 * Test all IDs in one JSON file is all unique, no duplicate.
 */
const contents = require("../info-files/contents.json");
const categories = require("../info-files/categories.json");

function unique_test(ary)
{
    ary.map( content =>
    {
        let e = ary.filter( item => content.id === item.id );
        console.assert( e.length === 1, "ID is not unique!", e );
    });
}

unique_test(contents);
unique_test(categories);

console.log("Unique ID test compeleted.");