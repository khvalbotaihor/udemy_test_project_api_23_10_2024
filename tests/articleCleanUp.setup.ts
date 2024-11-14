import {test as setup, expect} from '@playwright/test'

setup('delete article after checks', async({request}) => {
    const deleteFunction = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`)
    await expect(deleteFunction.status()).toBe(204)
})