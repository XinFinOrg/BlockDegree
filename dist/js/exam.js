// https://bl.ocks.org/shiftyp/0e2516f91a044acfb396
$(function() {

  function Quiz() {
    this.correctAnswers = 0;

    this.app = new App();
    this.app.attachEventHandlers();
  }

  function App() {
    this.submitButton = document.getElementById('exam-submit');
  }

  App.prototype.getUserAnswers = function(ansSelector) {
    let self = this
    self.answers = []

    $(ansSelector).each(function(){
      self.answers.push( $(this).attr('id') )
    })

    return self.answers
  }

  App.prototype.sendUserAnswers = function(ans) {
    let self = this;

    $.ajax({
      type: "POST",
      url: '/answers',
      data: {...ans},
      error: function(xhr, status, error){
          alert("Error!" + xhr.status);
      }
    })
      .done(function(res){
        console.log(res) // This will have to be connected to the number of correct answers
      })
  }

  App.prototype.attachEventHandlers = function() {
  	var self = this;

  	self.submitButton.addEventListener('click', function(){
      self.getUserAnswers('.exam-choice input:checked')
      self.sendUserAnswers(self.answers)
    })
  };

  Quiz();
});
