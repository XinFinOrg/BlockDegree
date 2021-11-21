---
parent: Blockchain professional course for engineer
title: Quiz - 3
template: courseContent.hbs
courseIdx: 2
---
<div class="py-3">
    <form id="quiz-questions-form">
        <div id="quiz-questions-wrapper"></div>
    </form>
</div>
 <script type="text/javascript">
    const getQuestionHtml = ({ id, question, choices }) => `<div class="mb-4">
      <div class="card bg-light py-3 px-4">
        <p id="q0" class="mb-3 exam-qns ">
          ${id + 1}. ${question}
        </p>
        <div class="row">
          ${choices.map((choice, index) => `<div class="col-12 col-md-6">
                    <div class="exam-choice d-flex align-items-baseline">
                      <input class="q_option" style="flex: 0 0 15px;" type="radio" id="q${id}-c${index}" name="q${id}" value="${index}">
                      <label for="q${id}-c${index}">${choice}</label>
                    </div>
                  </div>`).join('')}
        </div>
      </div>
      <div class="my-2 text-sm" id="helpText-${id}" style="min-height: 1.75rem;">
      </div>
    </div>`;
    $(document).ready(function () {
      const pageNo = 2, perPage = 7;
      $.ajax({
        type: "get",
        data: { pageNo, perPage },
        url: "/api/questionsProfessional",
        success: (result) => {
          const questions = result.questions
          $('#quiz-questions-wrapper').html(
            questions.map((q, id) =>
              getQuestionHtml({ id, question: q.question, choices: q.choices })
            ).join('') +
            `<button type="button" id="quiz-questions-submit" class="card-text btn btn-gradient">Submit</button>`
          )
          $("#quiz-questions-submit").on('click', () => {
            $.ajax({
              type: "get",
              data: { pageNo, perPage },
              url: "/api/AnswersProfessional",
              success: (result) => {
                console.log(result.answers)
                if (Array.isArray(result.answers)) {
                  questions.forEach((q, qid) => {
                    const choiceId = parseInt($("#quiz-questions-form")[0][`q${qid}`].value)
                    clickedOption(qid, choiceId, questions, result.answers[qid] - 1)
                  });
                }
              },
              error: (jqXHR, status, err) => {
                console.log(jqXHR, status, err)
              },
            });
          })
        },
        error: (jqXHR, status, err) => {
          console.log(jqXHR, status, err)
        },
      });
      const colorSuccess = "#28a745"
      const colorFail = "##dc3545"
      function clickedOption(questionId, choiceId, questions, answerId) {
        const question = questions.find((q, i) => i == questionId)
        const answer = question.choices[answerId]
        if (answerId == choiceId) {
          $(`#helpText-${questionId}`).html(`<span class="icon" style="width: 10px;height: 10px;font-size: 10px;background-color:${colorSuccess};"></span><span class="text">Correct Answer!</span>`)
        } else if (Number.isNaN(choiceId)) {
          $(`#helpText-${questionId}`).html(`
        <span class="icon" style="width: 10px;height: 10px;font-size: 10px;background-color:${colorFail};"></span>
        <span class="text">Correct Answer is:&nbsp;
          <span class="font-weight-bold">${answer}</span>
        </span>
        `)
        } else {
          $(`#helpText-${questionId}`).html(`
        <span class="icon" style="width: 10px;height: 10px;font-size: 10px;background-color:${colorFail};"></span>
        <span class="text">Wrong Answer!, Correct Answer is:&nbsp;
          <span class="font-weight-bold">${answer}</span>
        </span>
        `)
        }
      }
    })
  </script>