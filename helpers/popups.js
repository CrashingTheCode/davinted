const authenticitySelector = 'button[data-testid="authenticity-modal--close-button"]';

const checkAndClosePopups = async page => {
  const popupElement = await page.$(authenticitySelector);
  if (popupElement) {
    await page.waitForSelector(authenticitySelector);
    await page.click(authenticitySelector);
  }
};

module.exports = {checkAndClosePopups};
