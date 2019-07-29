if(typeof jQuery != 'undefined') {
  $(document).ready(function(){
    if ($('.enroll-btn').length) {

      $('.enroll-btn').on('click', function(e){
        let coursePage = $(this).data('title');

        $.ajax({
          type: 'POST',
          url: coursePage
        })
      })
    }
  });
}
