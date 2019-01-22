## To do
- [ ] Login functionality
- [ ] Pages for the link at footer
- [ ] Email sign up (only UI)
- [ ] Enroll today, start lesson.
- [ ] Functionality for certificate page
- [ ] Functionality for contact form
- [ ] Become partner button at university course offline
- [ ] No page showing all courses, clicking on online blockchain training goes to blockchain basic course for engineer
- [ ] Code to read the images in folder for gallery and automatically generate it
- [ ] 404 page

## Running the website
The src file runs on Gulp, handlebars, livereload and other relevant packages. Using handlebars, the templates could be reused easily and the code is more maintainable. Otherwise, the dist folder is good to go as well.

Some of the benefits of this template:
1. Easily change hero images, title and copy with a single line e.g. {{> includes/hero hero-title="University Courses" hero-image="/img/pm4.jpg" hero-copy="this is if you want to add a line below the title"}} as seen in the university courses page
2. Add two column template {{> layouts/two-columns}}  {{#\*inline "col-left"}}{{/inline}}  {{#\*inline "col-right"}}{{/inline}}
3. Easily update courses pages, update courses sub-menu, home page courses link by updating the data structure in /dist/data/courses.json. Run gulp courseCompile and the new pages will be generated in /dist/courses. The structure of the course page is updated at /src/partials/layouts/courses.hbs. (To note, at the home page, there is no fix number set to the courses display)
4. Similarly for events and contributors. Easily add, edit and remove the data structure. This made changing the view while reducing error.
5. The same header, navigation and footer can be generated for every single as each referred to the same /partials/includes/header etc.

Get node up and running
```
npm install
```

To see live changes during development
```
gulp watch
```

Sometimes, the browser does not reload, or if you change the data structure for courses, it might not immediately make changes (gulp only watches the courses.hbs to regenerate the page), when that happens, you can manually rebuild the website or compile the courses page (2 separate commands).

This will rebuild the html pages.
```
gulp html
```

This will rebuild the course pages.
```
gulp compileCourses
```

## Recommended resources
https://cloudfour.com/thinks/the-hidden-power-of-handlebars-partials/
https://www.sitepoint.com/using-inline-partials-and-decorators-with-handlebars-4-0/
https://code-maven.com/handlebars-with-slightly-complex-data
http://tompennington.co.uk/posts/generating-multiple-static-html-pages-with-gulp-and-handlebars/
