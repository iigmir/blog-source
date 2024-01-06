const fs = require("fs");

const API_FILE = "./info-files/articles.json";
const CREATED_AT = "created_at";
const UPDATED_AT = "updated_at";

function get_source_file() {
    return new Promise( (resolve, reject) => {
        const get_json = (input = "") => {
            try {
                return JSON.parse(input);
            } catch (error) {
                console.error(error);
                return [];
            }
        };
        fs.readFile(API_FILE, "utf8", (error, content = "") => {
            if (error) {
                reject(error);
            }
            resolve( get_json(content) );
        });
    });
}

function get_commits(id = 1) {
    function get_date_api(id = 1) {
        const formatted_id = String(id).padStart(3, "0");
        return `https://api.github.com/repos/iigmir/blog-source/commits?path=/articles/${formatted_id}.md`;
    }
    return new Promise( (resolve, reject) => {
        const api = get_date_api(id);
        const ajax = fetch(api).then( (r) => r.json() );
        ajax.then( (response) => {
            resolve(response);
        }).catch( e => reject(e) );
    });  
}

function get_date(id = 1) {
    return new Promise( (resolve, reject) => {
        const ajax = get_commits(id);
        ajax.then( (response) => {
            // Error handling: Rate limit
            if( !Array.isArray(response) ) {
                reject({ [CREATED_AT]: "", [UPDATED_AT]: "", id, message: response.message });
                return;
            }
            // Actions
            const get_commiter_date_string = (input) => {
                try {
                    return input.commit.committer.date;
                } catch (error) {
                    console.error(error);
                    return "";
                }
            };
            const get_commiter_date = (input) => new Date( get_commiter_date_string(input) );
            // Sorting
            let commits = [...response];
            commits.sort( (x, y) => get_commiter_date(y) - get_commiter_date(x) );
            // Get result
            const result = {};
            result[CREATED_AT] = get_commiter_date_string(commits[commits.length - 1]);
            result[UPDATED_AT] = get_commiter_date_string(commits[0]);
            result.id = id;
            resolve(result);
        }).catch( e => {
            reject({ [CREATED_AT]: "", [UPDATED_AT]: "", id });
        } );
    }); 
}

function no_date(item) {
    return !Object.hasOwn(item, CREATED_AT) || !Object.hasOwn(item, UPDATED_AT);
}

function get_new_result() {
    return new Promise( (resolve, reject) => {
        const src = get_source_file();
        let result = [];
        src.then( (contents = []) => {
            result = contents;
            const requesting_dates = contents.filter( (item) => no_date(item) ).map( i => i.id );
            const remaining_dates = Promise.all( requesting_dates.map( id => get_date(id) ) );
            remaining_dates.then( (list = []) => {
                list.forEach( (item) => {
                    const index = result.findIndex( (i) => i.id === item.id )
                    result[index][CREATED_AT] = item[CREATED_AT];
                    result[index][UPDATED_AT] = item[UPDATED_AT];
                });
                resolve(result);
            }).catch( e => reject(e) );
        }).catch( e => reject(e) );
    });
}

function main() {
    get_new_result().then( (content) => {
        fs.writeFile( API_FILE, JSON.stringify(content), (up) => {
            if (up) {
                throw up;
            }
        });
    }).catch( (up) => {
        throw up;
    });
}

main();
