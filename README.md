# Blog source

The core of my blog, with all of articles and its datas.

## Project structure

```bash
├── articles
│   └── *.md
├── assets
│   └── **/*.*
├── info-files
│   ├── articles.json
│   └── categories.json
├── scripts
│   ├── *.*
├── source-dump
│   └── *.json
├── .gitignore
└── README.md
```

* `articles`: All articles for the blog ordering by number. THE core of the repo.
* `assets`: Images for articles if needed. Images placed in its corresponding blog number directory. i.e. all images `93` used will placed in `93` directory.
* `info-files`: Metadatas for the blog.
  * `articles.json`: Metadatas for the article like title, id, language... etc
  * `categories.json`: Article categories.
* `scripts`: Scripts to make things easier.
* `source-dump`: Source datas(This is, my old articles) from my old blog.

## See also

* [do-markdownit plugins](https://github.com/digitalocean/do-markdownit#plugin-features--options): You don't need using annoying `iframe` anymore!
