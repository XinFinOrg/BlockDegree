let Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("https://www.blockdegree.org");
});

afterEach(async () => {
  await page.close();
});

test("landing page loads", async () => {
  const text = await page.$eval("div.banner-content h1", el => el.innerHTML);
  expect(text).toEqual(expect.stringContaining("Become a Certified"))
});