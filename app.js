console.log('Hi there! 🔥');

window.onload = function () {
  //memory
  const questionsMemory = [];
  const correctAnswersMemory = [];
  let questionNumber = 0;
  const userAnswers = [];
  let pointsMemory = 0;

  //referenze

  const startBtn = document.getElementById('startBtn');
  const confirmBtn = document.getElementById('confirmBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');

  //listeners
  startBtn.addEventListener('click', getUserPreferences);
  confirmBtn.addEventListener('click', getAnswer);
  nextQuestionBtn.addEventListener('click', showNextAnswer);

  function getUserPreferences() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const difficulty = document.getElementById('difficulty').value;
    if (isNaN(quantity)) {
      alert('please select a number');
      return; //! mettere qualcosa tipo focus sull'input
    }
    getQuestions(quantity, difficulty).then((data) => {
      const { results: questions } = data;
      pushQuestions(questions, questionsMemory);
      pushCorrectAnswers(questions, correctAnswersMemory);
      switchUiCard(
        document.getElementById('startCard'),
        document.getElementById('userCard')
      );
      renderQuestion(questionNumber);
    });

    console.log(`correctAnswersMemory:`, correctAnswersMemory);
    console.log(`questionsMemory:`, questionsMemory);

    // console.log(questionsMemory);
    // console.log(quantity, difficulty);
  }

  //fetch function
  async function getQuestions(quantity, difficulty) {
    const endpoint = `https://opentdb.com/api.php?amount=${quantity}&category=18&difficulty=${difficulty}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    return data;
  }

  function pushQuestions(fetchedQuestions, localQuestions) {
    fetchedQuestions.forEach((question) => localQuestions.push(question));
  }

  function pushCorrectAnswers(questions, answersMemory) {
    const answers = questions.map((question) => {
      const { correct_answer: correctAnswer } = question;
      return correctAnswer;
    });
    answers.forEach((correctAnsw) => answersMemory.push(correctAnsw));
  }

  function switchUiCard(cardToHide, cardToShow) {
    cardToHide.classList.add('hide');
    cardToShow.classList.remove('hide');
  }

  function renderQuestion(qNum) {
    //prima devo levare il disabled sui radio
    enableRadio();
    //estraggo dalla memoria la domanda che mi serve, in base all'indice
    const question = questionsMemory.find((_, idx) => idx === qNum);

    //referenze alla domanda nel DOM
    const question_number = document.querySelector('.question-number');
    const question_body = document.querySelector('.question-body');
    const user_points = document.querySelector('.user-points');

    //referenze risposta in base a tipo di domanda
    const multipleChoiceSection = document.querySelector('.multiple-choice');
    const booleanSection = document.querySelector('.boolean');

    //estraggo le parrti che mi servono
    const {
      correct_answer: correctAnswer,
      incorrect_answers: incorrectAnswer,
      question: questionText,
    } = question; //stringa , array, stringa

    //mischio le risposte
    const shuffledAnsw = [...incorrectAnswer, correctAnswer].sort(
      (a, b) => 0.5 - Math.random()
    ); //!si puo' implementare un random migliore ma per ora bene così

    //setto il render dellele parti comuni
    question_number.innerText = `Question number ${qNum + 1}`;
    question_body.innerText = questionText;
    user_points.innerText = `${pointsMemory || ''}`;

    //setto il render delle parti specifiche in base alla tipologia di domanda
    if (question.type === 'multiple') {
      //rispmultipla
      switchUiCard(booleanSection, multipleChoiceSection);
      const labelsUI = multipleChoiceSection.querySelectorAll('label');
      labelsUI.forEach(
        (label, idx) => (label.innerText = `${shuffledAnsw[idx]}`)
      );
    } else {
      //risp booleana
      switchUiCard(multipleChoiceSection, booleanSection);
    }
  }

  function getAnswer() {
    //prender le risposte
    const answers = document.querySelectorAll('.answer-controller input');
    const userInput = [...answers].find((radioBtn) => radioBtn.checked);
    if (userInput) {
      const userAnswerText = document.querySelector(`#${userInput.id} + label`)
        .innerText;
      console.log('userAnswerText:', userAnswerText);
      //pusho dentro
      userAnswers.push(userAnswerText);

      //controllo se ha risposto correttamente
      checkAnswer(userAnswerText);

      //incremento il contatore delle domande
      updateQuestionNumber();

      //disabilito comandi
      disableRadioAfterSubmit();

      //update punteggio UI dopo risposta
      document.querySelector('.user-points').innerText = `${
        pointsMemory || ''
      }`;
    } else {
      alert('provide an answer!');
    }
  }

  function checkAnswer(userAnswer) {
    const correctAnswer = correctAnswersMemory[questionNumber];
    if (userAnswer === correctAnswer) {
      console.log('user ans:', userAnswer);
      console.log('correct:', correctAnswer);

      //se la risposta è corretta aggiurno i punti
      updatePoints();
      alert('congrats!');
    } else {
      console.log('user ans:', userAnswer);
      console.log('correct:', correctAnswer);

      alert(`wrong! the correct answer was: ${correctAnswer}`);
    }
  }

  function updateQuestionNumber() {
    questionNumber++;
    console.log('questionNumber updated: new qNum:', questionNumber);
  }

  function updatePoints() {
    pointsMemory++;
  }

  function userHasAnswered() {
    return userAnswers.length === questionNumber;
  }

  function disableRadioAfterSubmit() {
    //se user answers > questionNumber vuol dire che ha già risposto, quindi disabilito
    if (userHasAnswered()) {
      const radios = document.querySelectorAll('input[type="radio"]');
      radios.forEach((radio) => radio.setAttribute('disabled', true));
      confirmBtn.setAttribute('disabled', true);
    }
  }
  function gameIsOver() {
    return userAnswers.length === correctAnswersMemory.length;
  }

  function showNextAnswer() {
    if (gameIsOver()) {
      showFinalResult();
      return;
    }
    console.log('userAnswers.length:', userAnswers.length);
    console.log('questionNumber:', questionNumber);

    const answers = document.querySelectorAll('.answer-controller input');
    const userInput = [...answers].find((radioBtn) => radioBtn.checked);
    if (!userInput) {
      alert('devi prima rispondereeeeee 💩');
      return;
    }
    renderQuestion(questionNumber);
  }

  function enableRadio() {
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach((radio) => {
      radio.disabled = false;
      radio.checked = false;
    });
    confirmBtn.disabled = false;
  }
  function showFinalResult() {
    console.log('finito, ora facciamo altro');
    const container = document.querySelector('.container');
    container.innerHTML = `
    <h2>Game OVER!</h2><h3>Your total points: ${pointsMemory}</h3>`;
  }
};

//IF YOU ARE DISPLAYING ALL THE QUESTIONS TOGETHER:
//HINT: for each question, create a container with the "question"
//create a radio button https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio with, as option the both the correct answer and the incorrect answers
//when EVERY question has an answer (google for how to get a value from a radio button with JS)
//IF YOU ARE DISPLAYING ONE QUESTION AT A TIME
//Display first question with a title + radio button
//when the user select the answer, pick the next question and remove this from the page after added in a varible the users' choice.

//HOW TO calculate the result
//You can do it in 2 ways:
//If you are presenting all questions together, just take all the radio buttons and check if the selected answer === correct_answer
//If you are presenting one question at a time, just add one point or not to the user score if the selected answer === correct_answer
