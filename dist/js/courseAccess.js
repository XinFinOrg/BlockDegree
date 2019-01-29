if(typeof jQuery != 'undefined') {
  $(document).ready(function(){
    if ($('.enroll-btn').length) {

      $('.enroll-btn').on('click', function(e){
        let coursePage = $(this).data('title');
        accessCourseMod(coursePage);
        // Check if it is login, if login, redirect to page

        // Else direct to login
        // showLoginPage(coursePage);
      })

    }
  });
}
