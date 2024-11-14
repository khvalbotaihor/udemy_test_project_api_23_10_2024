import {test as setup, expect, request} from '@playwright/test'
import user from './auth/user.json'
import fs from 'fs'

async function GlobalSetup(){
    const authFile = './auth/user.json'
    const context = await request.newContext()


    const responseToken = await context.post('https://conduit-api.bondaracademy.com/api/users/login',{
        data: {"user":{"email":"upqode.igor@gmail.com","password":"upqode"}}
      } )
    const responseBody = await responseToken.json()
    const accessToken = responseBody.user.token

    user.origins[0].localStorage[0].value = accessToken
    fs.writeFileSync(authFile, JSON.stringify(user))

    process.env['ACCESS_TOKEN'] = accessToken





    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles',{
        data: {"article":{"title":"Global likes test article","description":"about","body":"description","tagList":["tag1"]}},
        headers: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
          }
      } )

    expect(articleResponse.status()).toBe(201)

    const response = await articleResponse.json()  
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId

}

export default GlobalSetup;