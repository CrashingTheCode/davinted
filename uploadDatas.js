const fs = require('fs');
const {sequelize, Product, Iteration} = require('./models/products.model');
const puppeteer = require('puppeteer');
const {scrollPageToBottom} = require('puppeteer-autoscroll-down');

var initial; // starting sequece if products upload get struct inbetween need to update this field,
const populateInitial = async () => {
  initial = (await Iteration.findOne()).current;
  console.log('initial', initial);
};
populateInitial();

var addImage =
  '#photos > div.web_ui__Cell__cell.web_ui__Cell__wide > div > div > div > div.media-select__input > div > button';
var secondImageSelector =
  '#photos > div.web_ui__Cell__cell.web_ui__Cell__wide > div > div > div > div.media-select__grid > div.media-select__input-box > div > button';
var thirdImageSelector =
  '#photos > div.web_ui__Cell__cell.web_ui__Cell__wide > div > div > div.dropzone > div.media-select__grid > div.media-select__input-box > div > button';
var imageUrls = [addImage, secondImageSelector, thirdImageSelector];

var title = '#title';
var description = '#description';
var url = 'https://www.vinted.es/items/new';
var categorySelector = '#catalog_id';
var firstCategorySuggestion =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[1]/div/div[1]/div/div/div/ul/li[2]/div';
var brand = '#brand_id';
var brandBtn =
  '#ItemUpload-react-component-e77229db-4838-4c64-b45e-7b11460a94e5 > div:nth-child(8) > div:nth-child(3) > div > div > span > svg';
var firstBrandSuggestion =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[3]/div/div[1]/div/div/div/ul/li/div';
var addBrandSelector = '#custom-select-brand';
var sizeSelector = '#size_id';

var sizesChoice =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[5]/div[1]/div[1]/div/div/div/ul[2]/li/div';
//    /html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[5]/div[1]/div[1]/div/div/div/ul/li[1]/div
var otherSize = '#size-97';
var conditionSelector = '#status_id';
var conditionChoices =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[7]/div/div[1]/div/div/div/ul/li/div';
var colorSelector = '#color';

var colorChoices =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[9]/div/div[1]/div/div/div/ul[2]/li/div';
('/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[10]/div/div[1]/div/div/div/ul[2]/li[1]/div');
// #ItemUpload - react - component - b8c5cc2d - e3b4 - 43fc - 839e-215c88e4f77f > div: nth - child(8) > label
var suggestedColor = '#suggested-color-24 > div.web_ui__Cell__content > div';

var priceSelector = '#price';

var submitButton = '/html/body/main/div/section/div/div[2]/section/div/div/div[15]/div/button[2]';

const loadCookie = async page => {
  const cookieJson = await fs.readFile('./www.vinted.es.cookies.json', async (err, data) => {
    const cookies = JSON.parse(data);
    await page.setCookie(...cookies);
    await page.goto(url, {waitUntil: 'networkidle0'});
  });
};

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const dataUpload = async () => {
  var data = await Product.findAll();
  let arg = [
    '--aggressive-cache-discard',
    '--disable-cache',
    '--disable-application-cache',
    '--disable-offline-load-stale-cache',
    '--disable-gpu-shader-disk-cache',
    '--media-cache-size=0',
    '--disk-cache-size=0',
    '--enable-features=NetworkService',
  ];
  let browser = await puppeteer.launch({
    headless: false,
    // executablePath: "/usr/bin/chromium-browser",
    arg,
  });
  let page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
  );
  await page.setViewport({
    width: 1000,
    height: 1200,
    deviceScaleFactor: 1,
  });
  await page.setDefaultNavigationTimeout(0);
  await page.setCacheEnabled(false);
  await loadCookie(page);
  for (i = initial; i < data.length; i++) {
    if (i != initial) {
      await page.goto(url, {waitUntil: 'networkidle0'});
      console.log('------next started------');
    }
    if (data[i].dataValues.SKU.length > 0) {
      let sku = data[i].dataValues.SKU.split('.');
      // image upload
      for (j = 0; j < data[i].dataValues.noof_Fotos; j++) {
        await page.waitForSelector(imageUrls[j], {timeout: 60000});
        await page.click(imageUrls[j]);
        const elementHandle = await page.$('input[type="file"]');
        await elementHandle.uploadFile(`./productsManual/${sku[1]}/${parseInt(sku[2])}.${j + 1}.jpg`);
        console.log(`upload finished`);
      }

      //title data input
      await page.waitForSelector(title);

      await page.focus(title);
      await page.keyboard.type(data[i].dataValues.Nombre);

      await page.focus(description);
      await page.keyboard.type(
        `${data[i].dataValues.Talla || ''} ${data[i].dataValues.Marca || ''} ${data[i].dataValues.Descripción || ''}`,
      );
      // category selector
      await page.waitForSelector(categorySelector);
      await page.click(categorySelector);
      const catElements = await page.$x(firstCategorySuggestion);
      // colorElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
      try {
        await catElements[0].click();
      } catch (err) {
        console.log(err);
      }

      //brand
      let isBrandAdded = false;
      await page.waitForSelector(brand);
      await page.click(brand);
      await page.keyboard.type(data[i].dataValues.Marca);
      await page.waitForXPath(firstBrandSuggestion);
      const brandElements = await page.$x(firstBrandSuggestion);
      console.log('brandElements', brandElements.length);
      let b = 0;
      while (brandElements[b] != undefined) {
        let value = await brandElements[b].evaluate(el => el.textContent);
        let brandReg = new RegExp(data[i].dataValues.Marca, 'ig');
        console.log('brand value', data[i].dataValues.Marca);
        if (brandReg.test(value)) {
          await brandElements[b].click();
          isBrandAdded = true;
          break;
        }
        b++;
      }
      if (!isBrandAdded) {
        page.click(addBrandSelector);
      }
      //  size logic
      let isSizeSelected = false;
      await page.waitForSelector(sizeSelector);
      await page.click(sizeSelector);

      try {
        sizesChoice =
          '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[5]/div[1]/div[1]/div/div/div/ul[2]/li/div';
        await page.waitForXPath(sizesChoice);
      } catch {
        sizesChoice =
          '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[5]/div[1]/div[1]/div/div/div/ul/li/div';
      }
      const sizeElements = await page.$x(sizesChoice);
      console.log('sizeElements', sizeElements.length);
      let c = 0;
      while (sizeElements[c] != undefined) {
        let value = await sizeElements[c].evaluate(el => el.textContent);
        let brandReg = new RegExp('^' + data[i].dataValues.Talla, 'ig');
        if (brandReg.test(value)) {
          await sizeElements[c].click();
          isSizeSelected = true;
          break;
        }
        c++;
      }

      if (!isSizeSelected) {
        c = 0;
        while (sizeElements[c] != undefined) {
          let value = await sizeElements[c].evaluate(el => el.textContent);
          let brandReg = new RegExp(data[i].dataValues.Talla.trim(), 'ig');

          if (brandReg.test(value.trim())) {
            await sizeElements[c].click();
            isSizeSelected = true;

            break;
          }
          c++;
        }
      }
      if (!isSizeSelected) {
        await page.click(otherSize);
      }
      let tabc = await page.$x('//*[contains(text(), "Medidas")]');
      console.log(tabc.length, 'error didnt thrown');
      if (tabc.length > 1) {
        conditionChoices =
          '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[8]/div/div[1]/div/div/div/ul/li[3]/div';
        colorChoices =
          '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[10]/div/div[1]/div/div/div/ul[2]/li/div';
        submitButton = '/html/body/main/div/section/div/div[2]/section/div/div/div[15]/div/button[2]';
      } else {
        console.log('error block');
        conditionChoices =
          '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[7]/div/div[1]/div/div/div/ul/li/div';
        colorChoices =
          '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[9]/div/div[1]/div/div/div/ul[2]/li/div';
        submitButton = '/html/body/main/div/section/div/div[2]/section/div/div/div[15]/div/button[2]';
      }
      //  condition logic,
      try {
        await page.waitForSelector(conditionSelector);
        await page.click(conditionSelector);
        const conditionElements = await page.$x(conditionChoices);
        await conditionElements[0].click();
      } catch {}

      console.log('run 2');
      await page.waitForSelector('#package-size-1');
      await page.click('#package-size-3');

      /**
       * price logic
       */

      await page.focus(priceSelector);

      await page.keyboard.type(data[i].dataValues.Precio_Final);

      // color logic-------------------------------------------------

      await page.click(colorSelector, {delay: 500});
      const colorElements = await page.$x(colorChoices);
      console.log('colorElements', colorElements);
      let d = 0;
      noofSelectedColor = 0;
      let colorReg = new RegExp(data[i].dataValues.Color, 'ig');
      let optionalColorReg;
      if (data[i].dataValues.Color_optional) {
        optionalColorReg = new RegExp(data[i].dataValues.Color_optional, 'ig');
      }
      while (colorElements[d] != undefined) {
        let value = await colorElements[d].evaluate(el => el.textContent);

        console.log(colorReg, value);
        if (colorReg.test(value)) {
          await Promise.all([
            await colorElements[d].click({
              delay: 1000,
            }),
          ]).catch(e => console.log(e));
          if (!optionalColorReg) {
            break;
          } else {
            noofSelectedColor++;
          }
        }
        if (optionalColorReg) {
          if (optionalColorReg.test(value)) {
            await colorElements[d].click({
              delay: 1000,
            });
            noofSelectedColor++;
          }
        }
        if (noofSelectedColor == 2) {
          break;
        }
        d++;
      }

      await page.waitForXPath(submitButton);
      const submitElements = await page.$x(submitButton);
      await submitElements[0].click({delay: 4000});
      // await sleep(5000)
      console.log(`------------------${data[i].dataValues.SKU} product uploaded successfully------------`);
      try {
        await page.waitForNavigation({timeout: 6000});
      } catch (err) {}
      await Iteration.update({current: i}, {where: {id: 1}});
    }
  }
};

dataUpload();
