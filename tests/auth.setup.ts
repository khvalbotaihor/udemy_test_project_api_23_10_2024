import {test as setup } from '@playwright/test'

const authFile = './auth/user.json'

setup('authentication', async({page}) => {
    await page.goto('https://conduit.bondaracademy.com/')  
    await page.getByText('Sign in').click()
    await page.getByRole('textbox',{name: 'Email'}).fill('upqode.igor@gmail.com')
    await page.getByRole('textbox', {name: 'Password'}).fill('upqode')
    await page.getByRole('button', {name: 'Sign in'}).click()
    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

    await page.context().storageState({ path: authFile })
})