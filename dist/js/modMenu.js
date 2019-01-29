if(typeof jQuery != 'undefined') {
  $(document).ready(function(){
    function fixedCurriculumToggleBtn() {
      $('.toggle-curriculum').addClass('d-block curriculum--fixed');
    }

    function curriculumToggleBtnInBlk() {
      $('.toggle-curriculum').removeClass('curriculum--fixed');
    }

    function toggleCurriculum() {
      $('.mod__sidebar #mod__details').toggleClass('d-none d-block');
    }

    function hideCurriculum() {
      $('.mod__sidebar #mod__details').removeClass('d-block');
      $('.mod__sidebar #mod__details').addClass('d-none');
    }

    // For mobile page in module/curriculum course page
    if(document.documentElement.clientWidth < 560) {
      hideCurriculum();

      $(window).scroll(function() {
        let scroll = $(window).scrollTop(),
            curriculumPos = $('.toggle-curriculum').position().top + $('.toggle-curriculum').outerHeight(true) + 600;

        if(scroll > curriculumPos){
          fixedCurriculumToggleBtn();
          hideCurriculum();
        } else {
          curriculumToggleBtnInBlk();
          $('.mod__sidebar #mod__details').removeClass('mod--fixed')
        }
      });

      $('.toggle-curriculum').on('click', function() {
        toggleCurriculum();
        if($('.toggle-curriculum').hasClass('curriculum--fixed')){
          $('.mod__sidebar #mod__details').addClass('mod--fixed');
        }
      });

      $('.mod__sub-heading').on('click', function() {
        hideCurriculum();
      });
    }
  });
}
