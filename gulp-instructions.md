Module 1: https://xinfinorg.github.io/Blockchain_Tutorial-website/blockchain.html

## To do
- [ ] Login functionality
- [ ] Need to check on the rerouting of the express function that authenticates whether user isLoggedIn
- [ ] Pages for the link at footer
- [ ] Email sign up (only UI)
- [ ] Enroll today, start lesson.
- [ ] Functionality for certificate page
- [ ] Functionality for contact form
- [X] Become partner button at university course offline
- [ ] Previous and next arrow when use finish reading the documents
- [ ] Content for become partner popup
- [ ] No page showing all courses, clicking on online blockchain training goes to blockchain basic course for engineer
- [X] Code to read the images in folder for gallery and automatically generate it
- [X] 404 page
- [ ] For the course content pages, it is preferable if the side bar could automatically be populated with the heading and sub-heading generated in the markdown files or generate a json file of that

## Running the website
The src file runs on Gulp, handlebars, livereload and other relevant packages. Using handlebars, the templates could be reused easily and the code is more maintainable. Otherwise, the dist folder is good to go as well. Have to run on server environment.

Some of the benefits of this template:
1. Easily change hero images, title and copy with a single line e.g. as seen in the university courses page
```
{{> includes/hero hero-title="University Courses" hero-image="/img/pm4.jpg" hero-copy="this is if you want to add a line below the title"}}
```


2. Add two column template
```
{{> layouts/two-columns}}  {{#\*inline "col-left"}}{{/inline}}  {{#\*inline "col-right"}}{{/inline}}
```

3. Easily update courses pages, update courses sub-menu, home page courses link by updating the data structure in __/dist/data/courses.json__. Run __gulp compileCourseOverview__ and the new pages will be generated in __/dist/courses__. The structure of the course page is updated at __/src/partials/layouts/courseOverview.hbs__. (To note, at the home page, there is no fix number set to the courses display)

4. Similarly for events and contributors. Easily add, edit and remove the data structure. This made changing the view while reducing error.

5. The same header, navigation and footer can be generated for every single as each referred to the same __/partials/includes/header__ etc.

6. Create courses in markdown under __/content__. The file structure that you created for data will be generated under __/server/protected/courses/__. This is generated using metalsmith, hence you need to run metalsmith command separately.
```
gulp metalsmith
```

Get node up and running
```
npm install
```

To watch live changes during development
```
gulp watch
```

Sometimes, the browser does not reload, or if you change the data structure for courses, it might not immediately make changes (gulp only watches the courses.hbs to regenerate the page), when that happens, you can manually rebuild the website or compile the courses page (2 separate commands).

Rebuild the html pages.
```
gulp html
```

Rebuild the course overview pages.
```
gulp compileCourseOverview
```

## Recommended resources
https://cloudfour.com/thinks/the-hidden-power-of-handlebars-partials/

https://www.sitepoint.com/using-inline-partials-and-decorators-with-handlebars-4-0/

https://code-maven.com/handlebars-with-slightly-complex-data

http://tompennington.co.uk/posts/generating-multiple-static-html-pages-with-gulp-and-handlebars/

https://www.codeofaninja.com/2018/09/rest-api-authentication-example-php-jwt-tutorial.html

http://learningwithjb.com/posts/markdown-and-handlebars-to-make-pages

https://www.netlify.com/blog/2015/12/08/a-step-by-step-guide-metalsmith-on-netlify/
