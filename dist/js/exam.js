// import { futimesSync } from "fs";

// https://bl.ocks.org/shiftyp/0e2516f91a044acfb396
$(function() {

  // function Quiz() {
  //   this.correctAnswers = 0;

  //   this.app = new App();
  //   this.app.attachEventHandlers();
  // }

  // function App() {
  //   this.submitButton = document.getElementById('exam-submit');
  // }

  // App.prototype.getUserAnswers = function(ansSelector) {
  //   let self = this
  //   self.answers = []

  //   $(ansSelector).each(function(){
  //     self.answers.push( $(this).attr('id') )
  //   })

  //   return self.answers
  // }

  // App.prototype.sendUserAnswers = function(ans) {
  //   let self = this;
  //   console.log('ans', ans);
  //   alert('prototype')
  //   $.ajax({
  //     type: "POST",
  //     url: '/postExam',
  //     data: {...ans},
  //     success : function(data) {
  //       console.log(data);
  //     }
  //   });
  // }

  // App.prototype.attachEventHandlers = function() {
  // 	var self = this;

  // 	self.submitButton.addEventListener('click', function(){
  //     self.getUserAnswers('.exam-choice input:checked')
  //     self.sendUserAnswers(self.answers)
  //   })
  // };

  // Quiz();

  function postExamData(data) {
    alert('post exam before');
    $('#examResult').html('<P>You failed</p>');
    alert('post exam after');
  }


  // $('#exam-submit').on('click', (e) => {
  //   e.preventDefault();
  //   var form = $('#basicExamForm-submit');
  //   var ansArray = [];
  //   document.getElementById("exam-submit").disabled = true;
  //   document.getElementById("exam-submit").value = "Sending...";
  //   for(var i = 0; i < form[0].length; i++) {
  //     var ans = $('input[name='+i+']:checked').val();
  //     if(ans) {
  //       ansArray.push(ans);
  //     } else {
  //       ans = 5;
  //       ansArray.push(ans); 
  //     }      
  //   }
  //   // console.log('data', JSON.stringify(ansArray));
    
  //   $.ajax({
  //     type: "POST",
  //     url: '/postExam',
  //     data: {...ansArray},
  //     dataType: 'json',
  //     success : function(result) {
  //       console.log(result);
  //       postExamData(result);
  //     },
  //     error: function(err) {
  //       console.log(err);
  //     }
  //   });
   
  // })  
});
