console.log('Hi there! 🔥');

window.onload = function () {
  //memory
  const questionCategories = [
    'General Knowledge',
    'Entertainment: Books',
    'Entertainment: Film',
    'Entertainment: Music',
    'Entertainment: Musicals & Theatres',
    'Entertainment: Television',
    'Entertainment: Video Games',
    'Entertainment: Board Games',
    'Science & Nature',
    'Science: Computers',
    'Science: Mathematics',
    'Mythology',
    'Sports',
    'Geography',
    'History',
    'Politics',
    'Art',
    'Celebrities',
    'Animals',
    'Vehicles',
    'Entertainment: Comics',
    'Science: Gadgets',
    'Entertainment: Japanese Anime & Manga',
    'Entertainment: Cartoon & Animations',
  ];
  const questionsMemory = [];
  const correctAnswersMemory = [];
  let questionNumber = 0;
  const userAnswers = [];
  let pointsMemory = 0;
  let hasAnswered = false;
  const MAX_QUESTIONS = 30;
  const POINT_VALUE = 100;
  let totalQuestionNumber = 0;

  //referenze

  const startBtn = document.getElementById('startBtn');
  const confirmBtn = document.getElementById('confirmBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');
  const multipleChoiceSection = document.querySelector('.multiple-choice');
  const booleanSection = document.querySelector('.boolean');
  const radios = document.querySelectorAll('input[type="radio"]');
  const question_number = document.querySelector('.question-number');
  const question_body = document.querySelector('.question-body');
  const user_points = document.querySelector('.user-points');
  const labelsUI = multipleChoiceSection.querySelectorAll('label');
  const answerBoxes = document.querySelectorAll('.answer-box');
  const allLabelsAnswers = document.querySelectorAll('#userCard label');
  const category = document.getElementById('category');

  //listeners
  startBtn.addEventListener('click', getUserPreferences);
  confirmBtn.addEventListener('click', getAnswer);
  nextQuestionBtn.addEventListener('click', showNextAnswer);
  answerBoxes.forEach((box) => box.addEventListener('click', clickRadio));
  document.querySelector('.container').addEventListener('click', playAgain);

  //popolo le categorie
  category.innerHTML = questionCategories
    .map(
      (category, idx) => `
  <option value="${idx + 9}">${category}</option>
  `
    )
    .join('');
  function clickRadio(e) {
    let radio;
    if (e.target.classList.contains('label')) {
      radio = e.target.previousElementSibling;
    } else {
      radio = e.currentTarget.children[0];
    }
    radio.click();

    //cambio sfondo sulla box cliccata
    answerBoxes.forEach((box) => box.classList.remove('clicked'));
    radio.closest('.answer-box').classList.add('clicked');

    // console.log(radio);
    // radio.click();
    // console.log(radioChild);
    // radioChild.click();
  }

  function getUserPreferences() {
    const category = document.querySelector('#category').value;
    console.log(category.value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const difficulty = document.getElementById('difficulty').value;
    console.log(category);
    if (isNaN(quantity)) {
      document.getElementById('quantity').focus();
      document.getElementById('quantity').classList.add('danger-border');
      return; //! mettere qualcosa tipo focus sull'input
    }

    if (quantity > MAX_QUESTIONS || quantity <= 0) {
      alert(`Select a value between 1 and ${MAX_QUESTIONS} you nerd 🤓`);
      return;
    }
    getQuestions(quantity, difficulty, category)
      .then((data) => {
        const { results: questions } = data;
        pushQuestions(questions, questionsMemory);
        pushCorrectAnswers(questions, correctAnswersMemory);
        totalQuestionNumber = questions.length;
        totalQuestionNumber = quantity;
        switchUiCard(
          document.getElementById('startCard'),
          document.getElementById('userCard')
        );
      })
      .then(() => renderQuestion(questionNumber))
      .then(() => {
        console.log(`correctAnswersMemory:\n`, correctAnswersMemory.join('\n'));
        console.table(questionsMemory);
      });

    user_points.parentElement.classList.remove('hide');
  }

  //fetch function
  async function getQuestions(quantity, difficulty, category) {
    const endpoint = `https://opentdb.com/api.php?amount=${quantity}&category=${category}&difficulty=${difficulty}`;
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
    answerBoxes.forEach((box) => box.classList.remove('success', 'danger'));
    //prima devo levare il disabled sui radio
    enableRadio();
    //estraggo dalla memoria la domanda che mi serve, in base all'indice
    const question = questionsMemory.find((_, idx) => idx === qNum);

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
    question_number.innerText = `Question ${qNum + 1} / ${totalQuestionNumber}`;
    question_body.innerText = questionText;
    user_points.innerText = `Points: ${pointsMemory || ''}`;

    //setto il render delle parti specifiche in base alla tipologia di domanda
    if (question.type === 'multiple') {
      //rispmultipla
      switchUiCard(booleanSection, multipleChoiceSection);
      labelsUI.forEach(
        (label, idx) => (label.innerText = `${shuffledAnsw[idx]}`)
      );
    } else {
      //risp booleana
      switchUiCard(multipleChoiceSection, booleanSection);
    }
    hasAnswered = false;
    answerBoxes.forEach((box) =>
      box.classList.remove('clicked', 'success', 'danger')
    );
  }

  function getAnswer() {
    //prender le risposte
    // const radioInputs = document.querySelectorAll('.answer-controller input');
    const radioChecked = [...radios].find((radioBtn) => radioBtn.checked);
    if (radioChecked) {
      const userAnswerText = document.querySelector(
        `input[value="${radioChecked.value}"] + label`
      ).innerText;
      console.log('userAnswerText:', userAnswerText);
      //pusho dentro
      userAnswers.push(userAnswerText);

      //controllo se ha risposto correttamente
      checkAnswer(radioChecked, userAnswerText);

      //dico che ha risposto alla prima domanda
      // userHasAnswered(true);
      hasAnswered = true;

      //disabilito comandi
      disableRadioAfterSubmit();

      //incremento il contatore delle domande
      questionNumber++;

      //update punteggio UI dopo risposta
      document.querySelector('.user-points').innerText = `${
        pointsMemory || ''
      }`;
    } else {
      return;
    }
  }

  function checkAnswer(radioSelected, userAnswer) {
    const correctAnswer = correctAnswersMemory[questionNumber];
    answerBoxes.forEach((box) => box.classList.remove('clicked'));
    if (userAnswer === correctAnswer) {
      console.log('user ans:', userAnswer);
      console.log('correct:', correctAnswer);

      //se la risposta è corretta aggiurno i punti e coloro casella
      radioSelected.closest('.answer-box').classList.add('success');
      pointsMemory += POINT_VALUE;
    } else {
      //la risposta è sbagliata
      radioSelected.closest('.answer-box').classList.add('danger');
      const rightAnswer = [...allLabelsAnswers].find(
        (label) => label.innerText === correctAnswer
      );
      rightAnswer.closest('.answer-box').classList.add('success');
      console.log('user ans:', userAnswer);
      console.log('correct:', correctAnswer);
    }
  }

  function disableRadioAfterSubmit() {
    if (hasAnswered) {
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
    if (!hasAnswered) return;
    renderQuestion(questionNumber);
  }

  function enableRadio() {
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
    <div class="endgame">
      <h2>
        Game OVER!</h2><h3>Your total points: ${pointsMemory}
      </h3>
      <button id="playAgain">Play Again</button>
    </div>`;
  }

  function playAgain(e) {
    if (e.target.id === 'playAgain') window.location.reload();
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
