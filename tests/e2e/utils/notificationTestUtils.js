export const setMobileViewport = async (page) => {
  await page.setViewportSize({ width: 390, height: 844 })
}

export const expandNotificationSection = async (page, label) => {
  const trigger = page.getByRole('button', { name: new RegExp(label) })
  if ((await trigger.count()) === 0) {
    return
  }
  const expanded = await trigger.getAttribute('aria-expanded')
  if (expanded !== 'true') {
    await trigger.click()
  }
}

export const ensureGeneralNotificationsOpen = (page) =>
  expandNotificationSection(page, '일반 알림')
