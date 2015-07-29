# Hacking on JekyllCMS
1. Install npm dependencies
  ```
  $ npm install
  $ npm install -g gulp
  ```

2. Install and configure [Gatekeeper](https://github.com/prose/gatekeeper)

3. Create a configuration file for JekyllCMS in `build/config.json` that
   includes the GitHub OAuth client ID:
  ```json
  {
    "url": "http://localhost:8000",
    "gatekeeper": "http://localhost:9999",
    "clientId": "55555555555555555555"
  }
  ```

4. Build the project (`gulp build`) or auto-build on file changes (`gulp
   devel`).

5. Start up a web server to serve the app:
  ```
  $ python -m SimpleHTTPServer
  ```
