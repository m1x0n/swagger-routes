/*
   Run:
   node --no-warnings index.js http://localhost:8050 v1
 */
const puppeteer = require('puppeteer');

(async () => {
  const swaggerUiUrl = process.argv[2]

  if (!swaggerUiUrl) {
    console.error('No Swagger UI url specified. Exit')
    process.exit(1)
  }

  const prefix = process.argv[3] || ''

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const appSelector = '.swagger-ui.swagger-container'
  const routeSelector = '.opblock-summary'

  await page.goto(swaggerUiUrl)

  // Wait for the results page to load and display the results.
  await page.waitForSelector(appSelector)

  // Delay for remote connections
  await page.waitFor(5000)

  const routeInfo = await page.$$eval(routeSelector, (divs) => {
    return divs
        .map(div => {
          // Replace zero width whitespaces and split method\npath\ncomment
          return div.innerText
              .replace(/\u200B/g, '')
              .split('\n')
        })
        .map((item) => {
          let [method, path, comment] = item
          return {method: method, path: path, comment: comment}
        })
  });

  console.log(
      routeInfo.map(route => `${route.method} ${prefix}${route.path}`).join('\n')
  )
  await browser.close()
})()
  .catch((e) => {
    console.error(`Error: ${e.message}`)
    process.exit(1)
  })
