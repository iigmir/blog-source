const fs = require("fs");

fs.readdir( "articles", (articles_error, files_data) =>
{
    if( articles_error ) throw new articles_error;
    fs.readFile( "info-files/contents.json", "utf8", (contents_error, contents_data) =>
    {
        if( contents_error ) throw new contents_error;
        read_files( files_data, JSON.parse( contents_data ) );
    });
});

const read_files = ( files_data = [], contents_data = [] ) =>
{
    const titles = files_data.map( filename =>
    {
        const file_id = filename.replace( /\.md/gi, "" );
        const got_data = contents_data.filter( item => item.id == file_id )[0];
        if( got_data ) return got_data.title;
    });
    files_data.map( file => `articles/${ file }` ).forEach( (file, file_id) =>
    {
        const fid = file.replace( /(articles\/)|(\.md)/gi, "" );
        fs.readFile( file, "utf8", (error, data) =>
        {
            if( error ) throw new error;
            parse_new_md_file({
                title: titles[file_id],
                context: data,
                fid,
            });
        });
    });
};

const parse_new_md_file = ({ context = "", title = "", fid = "" }) =>
{
    const modify_text = ( title = "", context = "" ) =>
    {
        const new_title = "# " + title;
        let new_context = "";
        new_context = context.replace( /###/gi, "##" ).replace( /####/gi, "###" );
        return new_title + "\n\n" + new_context;
    };
    fs.writeFile( `new-articles/${ fid }.md`, modify_text( title, context ), (err) =>
    {
        if (err) throw err;
    });
};
