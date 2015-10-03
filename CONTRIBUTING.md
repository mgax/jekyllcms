# Hacking on JekyllCMS

Check out the [Trello board](https://trello.com/b/F1UQejYU/jekyllcms), that's
where we keep track of things to do. The green label means "beginner-friendly
task" and red means "high-value task".

1. Clone repo and install npm dependencies
  ```
  $ git clone https://github.com/mgax/jekyllcms.git
  $ cd jekyllcms
  $ npm install
  $ npm install -g gulp
  ```

2. Create GitHub Application - go to
   [Developer applications](https://github.com/settings/developers), click
   "Register new application", and fill in the details:

  * *Application name*: "JekyllCMS development"
  * *Homepage URL*: "http://localhost:5000/"
  * *Authorization callback URL*: "http://localhost:5000/"

3. Copy the file `example-devel` to `devel` and set `GITHUB_OAUTH_KEY` and
   `GITHUB_OAUTH_SECRET` from the GitHub application you just created.

4. Run the project (`./devel`) and open it in your web browser
   (`http://localhost:5000/`)
