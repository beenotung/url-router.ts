import { toQuery } from './helpers'
import { expect } from 'chai'

describe('router helpers TestSuit', () => {
  it('should handle empty search', function () {
    let query = toQuery('')
    expect(query).not.undefined
    expect(Object.keys(query)).to.have.lengthOf(0)

    query = toQuery('?')
    expect(query).not.undefined
    expect(Object.keys(query)).to.have.lengthOf(0)
  })

  it('should handle singular search', function () {
    let query = toQuery('?a=b')
    expect(query).deep.equals({ a: 'b' })

    query = toQuery('a=b')
    expect(query).deep.equals({ a: 'b' })
  })

  it('should handle multiple search', function () {
    let query = toQuery('?a=b&c=d')
    expect(query).deep.equals({ a: 'b', c: 'd' })
  })

  it('should handle duplicated search', function () {
    let query = toQuery('?a=b&a=c')
    expect(query).deep.equals({ a: ['b', 'c'] })
  })

  it('should handle search with space', function () {
    let query = toQuery('?q=keyword+with+space')
    expect(query).deep.equals({ q: 'keyword with space' })
  })

  it('should handle complex search', function () {
    let query = toQuery('?q=keyword+with+space&lang=en&skip=1&skip=2&skip=3+')
    expect(query).deep.equals({
      q: 'keyword with space',
      lang: 'en',
      skip: ['1', '2', '3 '],
    })
  })

  it('should accept string or URLSearchParams', function () {
    let search = '?a=b'
    expect(toQuery(search)).deep.equals({ a: 'b' })
    expect(toQuery(new URLSearchParams(search))).deep.equals({ a: 'b' })
  })
})
