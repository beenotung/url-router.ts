# url-router.ts

General Purpose, isomorphic url based router that works in node.js and browser without dependency.

[![npm Package Version](https://img.shields.io/npm/v/url-router.ts.svg?maxAge=3600)](https://www.npmjs.com/package/url-router.ts)

## Installation

### Install from npm
```bash
npm install url-router.ts
```

### Load from script in index.html
```html
<!-- bundled 3.6K, gzipped 1.1K -->
<script src="https://cdn.jsdelivr.net/npm/url-router.ts@0.3/bundle/index.js"></script>

<!-- minified 1.4K, gzipped 693B -->
<script src="https://cdn.jsdelivr.net/npm/url-router.ts@0.3/bundle/index.min.js"></script>
```

## Usage Example

### Using as micro SPA
```html
<script src="bundle/index.js"></script>
<script>
  let router = new UrlRouter();
  router.add("/users/:uid", Profile);
  router.add("/search", Search);

  window.addEventListener("popstate", () => render(currentUrl()));
  render(currentUrl());

  function currentUrl() {
    return location.href.replace(location.origin, "");
  }

  function render(url) {
    let match = router.route(url);
    let title
    if (!match) {
      title = 'Page Not Found'
      NotFound(url);
    } else {
      let page = match.value;
      title = page.name;
      page(match);
    }
    document.title = title
    if (url !== currentUrl()) {
      history.pushState(null, title, url);
    }
  }

  function Profile(req) {
    document.body.innerHTML = `
      <h1>Profile Page</h1>
      ${navBar()}
      uid: ${req.params.uid}
    `;
  }

  function Search(req) {
    let query = UrlRouter.toQuery(req.search);
    document.body.innerHTML = `
      <h1>Search Page</h1>
      ${navBar()}
      search: ${req.search}
      <br>
      keywords: ${query.q}
      <br>
      timestamp: ${new Date(+query.t)}
    `;
  }

  function navBar() {
    return `<div>
      <button onclick="render('/')">Home</button>
      <button onclick="render('/users/123')">Profile</button>
      <button onclick="render('/404')">404</button>
      <input id="search">
      <button onclick="render('/search?q='+search.value.replace(/\ /g,'+')+'&t='+Date.now())">Search</button>
    </div>`;
  }
</script>
```
Details refer to [example.html](./example.html)

### More Usage Examples

```typescript
import { Router, toQuery } from 'url-router.ts'
import { expect } from 'chai'

let router = new Router<any>()

router.add('/users/:uid/friends/:fid', 'friend page')
router.add('/search', 'search page')

let match = router.route('/users/123/friends/456')!
expect(match).not.undefined
expect(match.value).equals('friend page')
expect(match.params).deep.equals({ uid: '123', fid: '456' })

match = router.route('/search?client=firefox&q=url+with+hash+and+search+query#rhs')!
expect(match).not.undefined
expect(match.value).equals('search page')
expect(match.search).not.undefined
let query = toQuery(match.search!)
expect(query).deep.equals({
  client: 'firefox',
  q: 'url with hash and search query',
})
expect(match.hash).equals('#rhs')
```

Details refer to [core.spec.ts](./src/core.spec.ts)

## License
[BSD-2-Clause](./LICENSE) (Free Open Sourced Project)
