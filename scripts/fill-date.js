const fs = require("fs");

const API_FILE = "./info-files/articles.json";
const CREATED_AT = "created_at";
const UPDATED_AT = "updated_at";

function throw_promise_error(reject) {
    return e => reject(e);
}

const get_json_content = (input = "") => {
    try {
        return JSON.parse(input);
    } catch (error) {
        console.error(error);
        return [];
    }
};

function get_source_file() {
    return new Promise( (resolve, reject) => {
        fs.readFile(API_FILE, "utf8", (error, content = "") => {
            if (error) {
                reject(error);
            }
            resolve( get_json_content(content) );
        });
    });
}

function get_commiting_api(id = 1) {
    const formatted_id = String(id).padStart(3, "0");
    return `https://api.github.com/repos/iigmir/blog-source/commits?path=/articles/${formatted_id}.md`;
}

function get_github_token() {
    return new Promise( (resolve, reject) => {
        fs.readFile( ".env", "utf8", (error, content = "") => {
            if (error) {
                return "";
            }
            const match = content.match(/GITHUB_TOKEN=(.*)/);
            if( !match ) {
                reject("NO TOKEN: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens");
            }
            resolve(match ? match[1] : "");
        });
    }); 
}

function get_commits(id = 1) {
    return new Promise( (resolve, reject) => {
        const api = get_commiting_api(id);
        get_github_token().then( (srctoken) => {
            const request_params = {
                headers: {
                    "Authorization": `Bearer ${srctoken}`,
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            };
            const ajax = fetch( api, request_params ).then( (r) => r.json() );
            ajax.then( (response) => {
                resolve(response);
            }).catch( throw_promise_error(reject) );
        }).catch( throw_promise_error(reject) );
    });  
}

function get_date(id = 1) {
    return new Promise( (resolve, reject) => {
        const ajax = get_commits(id);
        ajax.then( (response) => {
            // Error handling: Rate limit
            if( !Array.isArray(response) ) {
                console.error(response);
                reject({ [CREATED_AT]: "", [UPDATED_AT]: "", id, message: response.message ?? "Unknown error" });
                return;
            }

            // Helper functions
            const get_commiter_date_string = (input) => input.commit.committer.date ?? "";
            const get_commiter_date = (input) => new Date( get_commiter_date_string(input) );

            // Sorting
            const commits = [...response].sort( (x, y) => get_commiter_date(y) - get_commiter_date(x) );

            // Get result
            const result = {
                [CREATED_AT]: get_commiter_date_string(commits[commits.length - 1]),
                [UPDATED_AT]: get_commiter_date_string(commits[0]),
                id,
            };

            // Finally...
            resolve(result);
        }).catch( e => {
            console.error(e);
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
        const set_date = (item) => {
            const index = result.findIndex((i) => i.id === item.id);
            result[index][CREATED_AT] = item[CREATED_AT];
            result[index][UPDATED_AT] = item[UPDATED_AT];
        };
        src.then( (contents = []) => {
            result = contents;
            const requesting_dates = contents.filter( (item) => no_date(item) ).map( i => i.id );
            const remaining_dates = Promise.all( requesting_dates.map( id => get_date(id) ) );
            remaining_dates.then( (list = []) => {
                list.forEach(set_date);
                resolve(result);
            }).catch( throw_promise_error(reject) );
        }).catch( throw_promise_error(reject) );
    });
}

function write_file(content) {
    fs.writeFile(API_FILE, JSON.stringify(content), (up) => {
        if (up) {
            throw up;
        }
    });
}

function main() {
    get_new_result().then( (content) => {
        write_file(content);
    }).catch( (up) => {
        throw up;
    });
}

main();

