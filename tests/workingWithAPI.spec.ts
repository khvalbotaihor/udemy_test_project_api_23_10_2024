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

  // await page.route('*/**/api/articles?limit=10&offset=0', async route => {
  //   const response = await route.fetch()
  //   const responseBody = await response.json()
  //   responseBody.articles[0].title = 'this is test title'
  //   responseBody.articles[0].description = 'this is test description'

  //   await route.fulfill({
  //       body: JSON.stringify(responseBody)
  //   })
  // })

  await page.goto('https://conduit.bondaracademy.com/')
  await page.waitForTimeout(1000)

  await page.getByText('Sign in').click()
  await page.getByRole('textbox',{name: 'Email'}).fill('upqode.igor@gmail.com')
  await page.getByRole('textbox', {name: 'Password'}).fill('upqode')
  await page.getByRole('button', {name: 'Sign in'}).click()

})


test('check component presence', async ({page})=>{  
  await expect(page.locator('.navbar-brand')).toBeVisible()
  await expect(page.locator('app-article-preview h1').first()).toContainText('this is test title')

  await expect(page.locator('app-article-preview p').first()).toContainText('this is test description')
})

test('create and then delete articles', async ({page, request}) => {
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
    data: {"user":{"email":"upqode.igor@gmail.com","password":"upqode"}}
  } )
  const responseBody = await response.json()
  const accessToken = responseBody.user.token

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles',{
    data: {"article":{"title":"test2345","description":"about","body":"description","tagList":["tag1"]}},
    headers: {
      Authorization: `Token ${accessToken}`
    }
  } )
  await page.waitForTimeout(500)

   const articleBody = await articleResponse.json()
   const articleId = articleBody.article.slug
   await expect(articleResponse.status()).toBe(201)
  
  const deleteFunction = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleId}`,{
    headers: {
      Authorization: `Token ${accessToken}`
    }
  } )
  await expect(deleteFunction.status()).toBe(204)
  await page.waitForTimeout(500)


  // add new note by post request and then delete this note manually
  const articleResponse2 = await request.post('https://conduit-api.bondaracademy.com/api/articles',{
    data: {"article":{"title":"test23456","description":"about","body":"description","tagList":["tag1"]}},
    headers: {
      Authorization: `Token ${accessToken}`
    }
  } )
  await expect(articleResponse2.status()).toBe(201)

  await page.getByText('Your Feed').click()
  await page.getByText('Global Feed').click()

  await page.getByText('test23456').click()
  await page.getByRole('button', {name:' Delete Article'}).first().click()

  const headers = await page.locator('article-page h1').allTextContents();
  headers.forEach(text => {
      expect(text).not.toContain('New Article');
  });
})

test('create article', async ({page, request}) =>{
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name: 'Article title'}).fill('title 222')
  await page.getByRole('textbox', {name: "What's this article about?"}).fill('descriptiom')
  await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('it is a long text')
  await page.getByRole('textbox', {name: 'Enter tags'}).fill('tag 1')
  await page.getByRole('button', {name: 'Publish Article'}).click()

  const response = await page.waitForResponse(response => 
    response.url().includes('api/articles') && response.status() == 201
  )
  const jsonResponse  = await response.json()
  const articleId = jsonResponse.article.slug

  await expect(page.locator('app-article-page h1')).toHaveText('title 222')

  await page.getByText('Home').click()
  await expect(page.locator('app-article-preview h1').first()).toContainText('title 222')
//
  const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
    data: {"user":{"email":"upqode.igor@gmail.com","password":"upqode"}}
  } )
  const responseBody = await loginResponse.json()
  const accessToken = responseBody.user.token

  // delete item
  const deleteFunction = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleId}`,{
    headers: {
      Authorization: `Token ${accessToken}`
    }
  } )
  await expect(deleteFunction.status()).toBe(204)

// check deleted item
  await page.getByText('Your Feed').click()
  await page.getByText('Global Feed').click()

  const headers = await page.locator('article-page h1').allTextContents();
  headers.forEach(text => {
      expect(text).not.toContain('title 222');
  });

})