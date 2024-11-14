import { request, expect } from "@playwright/test";

async function GlobalTeardown(){
   // console.log('Global teardown')
    const context = await request.newContext();

    const deleteFunction = await context.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`, {
        headers: {
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
          }
    })
    await expect(deleteFunction.status()).toBe(204)
}

export default GlobalTeardown;