# url-router.ts

General Purpose, Isomorphic url based router.

[![npm Package Version](https://img.shields.io/npm/v/url-router.ts.svg?maxAge=3600)](https://www.npmjs.com/package/url-router.ts)

## Installation
```bash
npm install url-router.ts
```

## Usage Example

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
