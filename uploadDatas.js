const fs = require('fs');
const {sequelize, Product, Iteration} = require('./models/products.model');
const puppeteer = require('puppeteer');

const {getSizeEquivalents} = require('./utils/sizes/index');
const upperFirst = require('lodash/upperFirst');
const {checkAndClosePopups} = require('./helpers/popups');

var initial; // starting sequece if products upload get struct inbetween need to update this field,
const populateInitial = async () => {
  initialData = await Iteration.findOne();
  initial = 0;
  console.log('initial', initial);
};
populateInitial();

var firstImageSelector =
  '#photos > div.web_ui__Cell__cell.web_ui__Cell__wide > div > div > div > div.media-select__input > div > button';

const nonFirstImageSelector = "div.media-select__input-box-content > button[type='button']";

var title = '#title';
var description = '#description';
var url = 'https://www.vinted.es/items/new';
var categorySelector = '#catalog_id';
var firstCategorySuggestion =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[1]/div/div[1]/div/div/div/ul/li[2]/div';
var brand = '#brand_id';

var addBrandSelector = '#custom-select-brand';
var sizeSelector = '#size_id';

const sizesChoice =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[5]/div[1]/div[1]/div/div/div/ul/li/div';
const sizesChoice2nd =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[5]/div[1]/div[1]/div/div/div/ul[2]/li/div';
const sizesChoice3rd =
  '/html/body/main/div/section/div/div[2]/section/div/div/div[7]/div[6]/div[1]/div[1]/div/div/div/ul/li/div';

var sizeMSelector = '#size-208';
var conditionSelector = '#status_id';
const status1Selector = '#status-6';
const status2Selector = '#status-1';
const status3Selector = '#status-2';
var colorSelector = '#color';

var priceSelector = '#price';

const submitButtonSelector = '[data-testid="upload-form-save-button"]';

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
      //**  IMAGE upload
      for (j = 0; j < data[i].dataValues.noof_Fotos; j++) {
        let imageSelector = firstImageSelector;
        if (j != 0) {
          imageSelector = nonFirstImageSelector;
        }
        await page.waitForSelector(imageSelector, {timeout: 60000});
        await page.click(imageSelector);
        const elementHandle = await page.$('input[type="file"]');
        console.log('Photo uploading...', `./vintedFotos/${sku[1]}/${parseInt(sku[2])}.${j + 1}.jpg`);
        await elementHandle.uploadFile(`./vintedFotos/${sku[1]}/${parseInt(sku[2])}.${j + 1}.jpg`);
        console.log(`IMAGE upload finished ${j + 1}`);
      }
      await sleep(1000);
      //** Title
      await page.waitForSelector(title);

      await page.focus(title);
      const formattedTitle = upperFirst(data[i].dataValues.Nombre.toLowerCase());
      await page.keyboard.type(formattedTitle);

      //** Title
      await page.focus(description);
      await page.keyboard.type(
        `${data[i].dataValues.Talla || ''} ${data[i].dataValues.Marca || ''} ${data[i].dataValues.Descripción || ''}`,
      );
      //** Category
      await sleep(1000);
      await page.waitForSelector(categorySelector);
      await page.click(categorySelector);
      const catElements = await page.$x(firstCategorySuggestion);
      console.log('catElements', catElements.length);
      // colorElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
      try {
        await catElements[0].click();
        console.log('Category Clicked');
      } catch (err) {
        console.log('Category Error', err);
      }

      await sleep(1000);

      //** Brand
      const brandSuggestionsSelector = 'li.pile__element';
      let isBrandAdded = false;
      await page.waitForSelector(brand);
      await page.click(brand);
      await page.keyboard.type(data[i].dataValues.Marca);
      await sleep(1000);

      const brandElements = await page.$$(brandSuggestionsSelector);
      console.log('brandElements', brandElements.length);
      let b = 0;
      console.log('brand value', data[i].dataValues.Marca);
      while (brandElements[b] != undefined) {
        let value = await brandElements[b].evaluate(el => el.textContent);
        let brandReg = new RegExp(data[i].dataValues.Marca, 'ig');
        if (brandReg.test(value)) {
          await brandElements[b].click();
          isBrandAdded = true;
          break;
        }
        b++;
      }
      if (!isBrandAdded) {
        await page.waitForSelector(addBrandSelector);
        page.click(addBrandSelector);
      }
      await sleep(1000);
      await checkAndClosePopups(page);

      //**  SIZE LOGIC

      let isSizeSelected = false;
      const sizeInputElement = await page.$(sizeSelector);
      //** Only when size input is there (not in accesories) */
      if (sizeInputElement) {
        await page.waitForSelector(sizeSelector);
        await page.click(sizeSelector);
        await sleep(1000);
        //developing
        // const sizeChoicesSelector = 'li.pile__element';
        // await page.waitForSelector(sizeChoicesSelector);
        // await sleep(120000);
        // const sizeChoices = await page.$$(sizeChoicesSelector);

        // console.log('sizeChoices', sizeChoices.length);
        //** */

        let choiceNumber = 1;
        let currentSizesChoice = sizesChoice;
        try {
          await page.waitForXPath(currentSizesChoice);
        } catch (error) {
          console.log('error waiting sizesChoice lets try 3rd', error);
          choiceNumber = 3;
        }

        if (choiceNumber == 3) {
          currentSizesChoice = sizesChoice3rd;
          await page.waitForXPath(currentSizesChoice);
        }

        let sizeElements = await page.$x(currentSizesChoice);
        if (sizeElements.length == 0) {
          console.log('SIZE 2nd selector');
          currentSizesChoice = sizesChoice2nd;
          await page.waitForXPath(currentSizesChoice);
          sizeElements = await page.$x(currentSizesChoice);
        }
        console.log('sizeElements', sizeElements.length);

        let c = 0;
        while (sizeElements[c] != undefined) {
          let value = await sizeElements[c].evaluate(el => el.textContent);
          console.log('size value', value);
          let sizeReg = new RegExp('^' + data[i].dataValues.Talla, 'ig');
          console.log('sizeReg', sizeReg);
          if (sizeReg.test(value)) {
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
            console.log('sizeValue 2nd TRY', value);
            let sizeReg = new RegExp(data[i].dataValues.Talla.trim(), 'ig');
            console.log('sizeReg 2nd TRY', sizeReg);
            if (sizeReg.test(value.trim())) {
              await sizeElements[c].click();
              isSizeSelected = true;

              break;
            }
            c++;
          }
        }
        if (!isSizeSelected) {
          //IF SIZE NOT FOUND...
          //and is "one size"
          if (data[i].dataValues.Talla == 'Talla única') {
            //THEN set the standard size "M"
            console.log('M SIZE SELECTED');
            await page.click(sizeMSelector);
            isSizeSelected = true;
          } else {
            //Try equivalent sizes
            const sizeEquivalents = getSizeEquivalents(data[i].dataValues.Talla);
            console.log('sizeEquivalents', sizeEquivalents);
            //letter equivalent
            const equivalentSize = sizeEquivalents[0];
            c = 0;
            while (sizeElements[c] != undefined) {
              let value = await sizeElements[c].evaluate(el => el.textContent);
              console.log('sizeValue EQUIVALENT TRY', value);
              let sizeReg = new RegExp(equivalentSize, 'ig');
              console.log('sizeReg EQUIVALENT TRY', sizeReg);
              if (sizeReg.test(value.trim())) {
                await sizeElements[c].click();
                isSizeSelected = true;

                break;
              }
              c++;
            }
          }
          if (!isSizeSelected) {
            console.error('SIZE ERROR, NOT FOUND');
          }
        }
      }

      await sleep(1000);

      //**  PRICE LOGIC
      console.log('Pricing...');
      await page.focus(priceSelector);
      await page.keyboard.type(data[i].dataValues.Precio_Final);

      await sleep(1000);

      const colorChoicesSelector = 'li.pile__element';
      //**  COLOR LOGIC
      await page.click(colorSelector, {delay: 500});
      await sleep(1000);

      // const colorElements = await page.$x(colorChoices);
      const colorElements = await page.$$(colorChoicesSelector);

      let d = 0;
      let mainColor = '';
      let secondaryColor = '';
      let colorReg = new RegExp(data[i].dataValues.Color, 'ig');
      let optionalColorReg;
      if (data[i].dataValues.Color_optional) {
        optionalColorReg = new RegExp(data[i].dataValues.Color_optional, 'ig');
      }
      console.log('DATA COLORS regs', colorReg, optionalColorReg);
      while (colorElements[d] != undefined) {
        let value = await colorElements[d].evaluate(el => el.textContent);
        console.log('color value', value);
        if (colorReg.test(value) && !mainColor) {
          console.log(colorReg, value);
          await colorElements[d].click({
            delay: 1000,
          });
          console.log('colorClicked main');
          mainColor = value;

          if (!optionalColorReg) {
            break;
          }
        }
        if (optionalColorReg) {
          if (optionalColorReg.test(value) && !secondaryColor) {
            await colorElements[d].click({
              delay: 1000,
            });
            console.log('colorClicked second');
            secondaryColor = value;
            break;
          }
        }
        if (mainColor && secondaryColor) {
          break;
        }
        d++;
      }
      if (!mainColor && !secondaryColor) {
        console.log('COLOR NOT FOUND');
        await sleep(1000);
        await colorElements[0].click({
          delay: 1000,
        });
      }

      await sleep(1000);

      //**  CONDITION LOGIC
      console.log('Condition...');
      await page.waitForSelector(conditionSelector);
      await page.click(conditionSelector);

      await page.waitForSelector(status3Selector);
      try {
        await page.click(status3Selector);
      } catch (error) {
        console.log('status selector error', error.message);
        await page.waitForSelector(status2Selector);
        try {
          await page.click(status2Selector);
        } catch (error) {
          console.log('status selector error 2', error.message);
          await page.waitForSelector(status1Selector);
          await page.click(status1Selector);
        }
      }

      await sleep(1000);

      //**  PACKAGE LOGIC
      console.log('Package...');

      await page.waitForSelector('#package-size-2');
      const packageElement = await page.$('#package-size-2');
      await packageElement.click();

      await sleep(1000);

      //**  SUBMIT LOGIC
      console.log('Submiting...');
      await page.waitForSelector(submitButtonSelector);
      await page.click(submitButtonSelector, {delay: 4000});

      try {
        await page.waitForNavigation({timeout: 30000});
        console.log(`------------------${data[i].dataValues.SKU} product upload finished------------`);
      } catch (err) {
        console.error('NAVIGATION ERROR', err.message);
        console.log('Submiting 2...');
        await page.waitForSelector(submitButtonSelector);
        await page.click(submitButtonSelector, {delay: 4000});
        try {
          await page.waitForNavigation({timeout: 30000});
          console.log(`------------------${data[i].dataValues.SKU} product upload finished------------`);
        } catch (error) {
          console.error('NAVIGATION ERROR 2', error.message);
        }
      }
      // await Iteration.update({current: i + 1}, {where: {id: 1}});
    }
  }
};

dataUpload();
