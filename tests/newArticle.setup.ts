import {test as setup, expect} from '@playwright/test'

setup('create new article', async({request}) =>{
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles',{
        data: {"article":{"title":"Likes test article","description":"about","body":"description","tagList":["tag1"]}}
      } )

    expect(articleResponse.status()).toBe(201)

    const response = await articleResponse.json()  
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId

})