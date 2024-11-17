import {test, expect} from '@playwright/test'
import {argosScreenshot} from '@argos-ci/playwright'

test('Like counter', async({page})=>{
    await page.goto('https://conduit.bondaracademy.com/')
    await page.getByText('Global Feed').click()
    const firstLikeButton = page.locator('app-article-preview').first().locator('button')
    await expect(firstLikeButton).toContainText('0', { timeout: 5000 })
    await argosScreenshot(page, "not marked like button");
    await firstLikeButton.click()
    await argosScreenshot(page, "marked like button");
    await expect(firstLikeButton).toContainText('1' ,{ timeout: 5000 })
})