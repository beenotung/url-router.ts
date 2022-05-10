import { Router } from './core'
import { expect } from 'chai'
import { toQuery } from './helpers'

describe('router core TestSuit', () => {
  let router: Router<any>

  function get(path: string) {
    return router.route(path)?.value
  }

  beforeEach(() => {
    router = new Router<any>()
  })

  it('should handle root route', function () {
    router.add('/', 'home')
    expect(get('/')).equals('home')
  })

  it('should handle multiple direct match routes', function () {
    router.add('/', 'home page')
    router.add('/profile', 'profile page')
    router.add('/settings', 'setting page')
    expect(get('/')).equals('home page')
    expect(get('/profile')).equals('profile page')
    expect(get('/settings')).equals('setting page')
    expect(get('/404')).undefined
  })

  it('should add multiple routes in dictionary', function () {
    router.addDict({
      '/1': 'one',
      '/2': 'two',
    })
    expect(get('/1')).equals('one')
    expect(get('/2')).equals('two')
  })

  it('should handle multiple level of direct match route', function () {
    router.add('/', 'home')
    router.add('/users', 'user list')
    router.add('/users/1', 'profile page')
    router.add('/users/1/friends', 'friend list')

    expect(get('/')).equals('home')
    expect(get('/users')).equals('user list')
    expect(get('/users/1')).equals('profile page')
    expect(get('/users/1/friends')).equals('friend list')
  })

  it('should handle single route with params', function () {
    router.add('/users/:user_id', 'profile page')
    let context = router.route('/users/123')!
    expect(context).not.undefined
    expect(context.value).equals('profile page')
    expect(context.params).deep.equals({ user_id: '123' })
  })

  it('should handle unspecified route (404)', function () {
    expect(get('/404')).undefined
    expect(get('/profile/404')).undefined

    router.add('/profile/:uid', 'user profile')
    expect(get('/profile')).undefined

    expect(get('/profile/404')).not.undefined
  })

  it('should handle single route with multiple params', function () {
    router.add('/users/:uid/friends/:fid', 'friend')
    let context = router.route('/users/123/friends/456')!
    expect(context).not.undefined
    expect(context.value).equals('friend')
    expect(context.params).deep.equals({ uid: '123', fid: '456' })
  })

  it('should handle multiple routes with params', function () {
    router.add('/user/:pid/profile', 'p')
    router.add('/user/:uid/friends', 'f')
    router.add('/user/self/noodles', 'n')

    expect(router.route('/user/1/profile')!.value).equals('p')
    expect(router.route('/user/1/profile')!.params).deep.equals({ pid: '1' })

    expect(router.route('/user/2/friends')!.value).equals('f')
    expect(router.route('/user/2/friends')!.params).deep.equals({ uid: '2' })

    expect(router.route('/user/self/noodles')!.value).equals('n')
  })

  it('should handle mixed routes w/wo params', function () {
    router.add('/', 'home page')
    router.add('/posts', 'post list')
    router.add('/posts/:pid', 'post page')
    router.add('/posts/:pid/page/:p', 'post n page')

    expect(router.route('/')!.value).equals('home page')

    expect(router.route('/posts')!.value).equals('post list')

    expect(router.route('/posts/123')!.value).equals('post page')
    expect(router.route('/posts/123')!.params).deep.equals({ pid: '123' })

    expect(router.route('/posts/123/page/42')!.value).equals('post n page')
    expect(router.route('/posts/123/page/42')!.params).deep.equals({
      pid: '123',
      p: '42',
    })
  })

  it('should handle route with one optional params', function () {
    router.add('/about/:mode?', 'about page')

    let route = router.route('/about/markdown')
    expect(route).not.undefined
    expect(route.value).equals('about page')
    expect(route.params).not.undefined
    expect(route.params.mode).equals('markdown')

    route = router.route('/about')
    expect(route).not.undefined
    expect(route.value).equals('about page')
    expect(route.params).not.undefined
    expect(route.params.mode).undefined
  })

  it('should handle route with multiple optional params', function () {
    router.add('/articles/:year?/:month?/:day?', 'article list')

    let route = router.route('/articles/2022/05/10')
    expect(route).not.undefined
    expect(route.value).equals('article list')
    expect(route.params.year).equals('2022')
    expect(route.params.month).equals('05')
    expect(route.params.day).equals('10')

    route = router.route('/articles/2022/05')
    expect(route).not.undefined
    expect(route.value).equals('article list')
    expect(route.params.year).equals('2022')
    expect(route.params.month).equals('05')
    expect(route.params.day).undefined

    route = router.route('/articles/2022')
    expect(route).not.undefined
    expect(route.value).equals('article list')
    expect(route.params.year).equals('2022')
    expect(route.params.month).undefined
    expect(route.params.day).undefined

    route = router.route('/articles')
    expect(route).not.undefined
    expect(route.value).equals('article list')
    expect(route.params.year).undefined
    expect(route.params.month).undefined
    expect(route.params.day).undefined
  })

  it('should handle routes with query', function () {
    router.add('/post', 'post page')
    router.add('/', 'home page')

    let match = router.route('/post?lang=en')!
    expect(match).not.undefined
    expect(match.search).not.undefined
    let query = toQuery(match.search!)
    expect(query).deep.equals({ lang: 'en' })
    expect(match.value).equals('post page')

    match = router.route('/?lang=en')!
    expect(match).not.undefined
    expect(match.search).not.undefined
    query = toQuery(match.search!)
    expect(query).deep.equals({ lang: 'en' })
    expect(match.value).equals('home page')

    match = router.route('/?q=keyword+with+space')!
    expect(match).not.undefined
    expect(match.search).not.undefined
    query = toQuery(match.search!)
    expect(query).deep.equals({ q: 'keyword with space' })
  })

  it('should handle routes with hash', function () {
    router.add('/', 'home page')

    let match = router.route('/')!
    expect(match).not.undefined
    expect(match.hash).undefined

    match = router.route('/#feeds')!
    expect(match).not.undefined
    expect(match.hash).equals('#feeds')
  })

  it('should handle routes with both query and hash', function () {
    router.add('/search', 'search page')

    let match = router.route(
      '/search?client=firefox-b-d&q=url+with+hash+and+search+query#rhs',
    )!
    expect(match).not.undefined
    expect(match.value).equals('search page')
    expect(match.search).not.undefined
    let query = toQuery(match.search!)
    expect(query).deep.equals({
      client: 'firefox-b-d',
      q: 'url with hash and search query',
    })
    expect(match.hash).equals('#rhs')
  })
})
