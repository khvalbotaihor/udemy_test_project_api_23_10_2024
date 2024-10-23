import {test, expect } from '@playwright/test'
import tags from '../test-data/tags.json'

test.beforeEach(async({page}) => {
  // create a mock
  await page.route('*/**/api/tags', async route => {
      await route.fulfill({
        body: JSON.stringify(tags)
      })      
  })
  await page.goto('https://conduit.bondaracademy.com/')
  await page.waitForTimeout(1000)
})


test('check component presence', async ({page})=>{
  await expect(page.locator('.navbar-brand')).toBeVisible()
})