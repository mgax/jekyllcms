'use strict';

function initialContent(options) {

var gitignore = `\
/_site
`;

var config_yml = `\
title: ${JSON.stringify(options.title)}
base_url: ${JSON.stringify('/'+options.repo)} # http://jekyllrb.com/docs/github-pages/#project-page-url-structure
defaults:
  - scope: {path: ""}
    values:
      layout: "page"
`;

var layout_base_html = `\
<!doctype html>
<meta charset="utf-8">
<title>{{ page.title }} &middot; {{ site.title }}</title>
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.css">

<body>

<nav class="navbar navbar-default">
  <div class="container">
    <div class="navbar-header">
      <a class="navbar-brand" href="{{ site.base_url }}">{{ site.title }}</a>
    </div>
  </div>
</nav>

<div class="container">
  {{ content }}
</div>
`;

var layout_home_html = `\
---
layout: base
---
<div class="jumbotron">
  <h1>{{ site.title }}</h1>
  {{ content }}
</div>

{% for post in site.posts %}
  <article>
    <h3>
      <a href="{{ site.base_url }}{{ post.url }}">{{ post.title}}</a>
      <small>{{ post.date | date_to_string }}</small>
    </h3>
    {{ post.excerpt }}
  </article>
{% endfor %}
`;

var layout_page_html = `\
---
layout: base
---
<h1>{{ page.title }}</h1>

{{ content }}
`;

var index_md = `\
---
layout: home
title: Home
---
This site was generated using [JekyllCMS](http://jekyllcms.grep.ro/). It has a
simple layout and some demo content to use as an example.
`;

var post_md = `\
---
title: Today I created a website
---
It was so easy!

I just created a GitHub repo, went into JekyllCMS, entered a title, and poof! A
website was born!
`;

var post_path = '_posts/' + moment().format('YYYY-MM-DD') + '-new-website.md';

return [
  {path: '_config.yml', content: config_yml},
  {path: '_layouts/base.html', content: layout_base_html},
  {path: '_layouts/home.html', content: layout_home_html},
  {path: '_layouts/page.html', content: layout_page_html},
  {path: 'index.md', content: index_md},
  {path: post_path, content: post_md},
  {path: '.gitignore', content: gitignore},
];

}
