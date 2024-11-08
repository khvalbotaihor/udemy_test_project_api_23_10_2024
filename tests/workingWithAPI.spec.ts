import {test, expect, request } from '@playwright/test'
import tags from '../test-data/tags.json'
import articles from '../test-data/articles.json'

test.beforeEach(async({page}) => {
  // create a mock
  await page.route('*/**/api/tags', async route => {
      await route.fulfill({
        body: JSON.stringify(tags)
      })      
  })

  await page.route('*/**/api/articles?limit=10&offset=0', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = 'this is test title'
    responseBody.articles[0].description = 'this is test description'

    await route.fulfill({
        body: JSON.stringify(responseBody)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/')
  await page.waitForTimeout(1000)
})


test('check component presence', async ({page})=>{  
  await expect(page.locator('.navbar-brand')).toBeVisible()
  await expect(page.locator('app-article-preview h1').first()).toContainText('this is test title')

  await expect(page.locator('app-article-preview p').first()).toContainText('this is test description')
})

test('delete articles', async ({page, request}) => {
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
    data: {"user":{"email":"upqode.igor@gmail.com","password":"upqode"}}
  } )
  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles',{
    data: {"article":{"title":"test234","description":"about","body":"description","tagList":["tag1"]}},
    headers: {
      Authorization: `Token ${accessToken}`
    }
  } )
  await page.waitForTimeout(5000)

  //await expect(page.locator('app-article-list app-article-preview', {hasText: 'test234'})).toBeVisible()
  await expect(articleResponse.status()).toBe(201)
  
  const deleteF = await request.delete('https://conduit-api.bondaracademy.com/api/articles/test234-12473',{
    //data: {"article":{"title":"test234","description":"about","body":"description","tagList":["tag1"]}},
    headers: {
      Authorization: `Token ${accessToken}`
    }
  } )
  await expect(articleResponse.status()).toBe(200)

})

test('create article', async ({page}) =>{
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: 'New Article'}).fill('title')
  await page.getByRole('textbox', {name: "What's this article about?"}).fill('descriptiom')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('it is a long text')
  await page.getByRole('textbox', {name: 'Enter tags'}).fill('tag 1')
  await page.getByRole('button', {name: 'Publish Article'}).click()

  await expect(page.locator('article-page h1')).toHaveText('New Article')

  await page.getByText('Home').click()
  await expect(page.locator('app-article-preview h1').first()).toContainText('New Article')

})