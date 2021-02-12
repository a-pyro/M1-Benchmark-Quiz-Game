console.log('Hi there! 🔥');
const questions = [
  {
    category: 'Science: Computers',
    type: 'multiple',
    difficulty: 'easy',
    question: 'What does CPU stand for?',
    correct_answer: 'Central Processing Unit',
    incorrect_answers: [
      'Central Process Unit',
      'Computer Personal Unit',
      'Central Processor Unit',
    ],
  },
  {
    category: 'Science: Computers',
    type: 'multiple',
    difficulty: 'easy',
    question:
      'In the programming language Java, which of these keywords would you put on a variable to make sure it doesn&#039;t get modified?',
    correct_answer: 'Final',
    incorrect_answers: ['Static', 'Private', 'Public'],
  },
  {
    category: 'Science: Computers',
    type: 'boolean',
    difficulty: 'easy',
    question: 'The logo for Snapchat is a Bell.',
    correct_answer: 'False',
    incorrect_answers: ['True'],
  },
  {
    category: 'Science: Computers',
    type: 'boolean',
    difficulty: 'easy',
    question:
      'Pointers were not used in the original C programming language; they were added later on in C++.',
    correct_answer: 'False',
    incorrect_answers: ['True'],
  },
  {
    category: 'Science: Computers',
    type: 'multiple',
    difficulty: 'easy',
    question:
      'What is the most preferred image format used for logos in the Wikimedia database?',
    correct_answer: '.svg',
    incorrect_answers: ['.png', '.jpeg', '.gif'],
  },
  {
    category: 'Science: Computers',
    type: 'multiple',
    difficulty: 'easy',
    question: 'In web design, what does CSS stand for?',
    correct_answer: 'Cascading Style Sheet',
    incorrect_answers: [
      'Counter Strike: Source',
      'Corrective Style Sheet',
      'Computer Style Sheet',
    ],
  },
  {
    category: 'Science: Computers',
    type: 'multiple',
    difficulty: 'easy',
    question:
      'What is the code name for the mobile operating system Android 7.0?',
    correct_answer: 'Nougat',
    incorrect_answers: ['Ice Cream Sandwich', 'Jelly Bean', 'Marshmallow'],
  },
  {
    category: 'Science: Computers',
    type: 'multiple',
    difficulty: 'easy',
    question: 'On Twitter, what is the character limit for a Tweet?',
    correct_answer: '140',
    incorrect_answers: ['120', '160', '100'],
  },
  {
    category: 'Science: Computers',
    type: 'boolean',
    difficulty: 'easy',
    question: 'Linux was first created as an alternative to Windows XP.',
    correct_answer: 'False',
    incorrect_answers: ['True'],
  },
  {
    category: 'Science: Computers',
    type: 'multiple',
    difficulty: 'easy',
    question:
      'Which programming language shares its name with an island in Indonesia?',
    correct_answer: 'Java',
    incorrect_answers: ['Python', 'C', 'Jakarta'],
  },
];

window.onload = function () {
  //memory
  const questionsMemory = [];
  const correctAnswersMemory = [];
  const questionNumber = 0;

  //fetching questions

  //referenze

  const startBtn = document.getElementById('startBtn');
  const confirmBtn = document.getElementById('confirmBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');

  //listeners
  startBtn.addEventListener('click', getUserPreferences);
  confirmBtn.addEventListener('click', checkAnswer);
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
    //estraggo dalla memoria la domanda che mi serve, in base all'indice
    const question = questionsMemory.find((_, idx) => idx === qNum);

    //referenze alla domanda nel DOM
    const question_number = document.querySelector('.question-number');
    const question_body = document.querySelector('.question-body');

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
      const true_answ = document.querySelector('.true');
      const false_answ = document.querySelector('.false');
    }
  }

  function checkAnswer() {}

  function showNextAnswer() {}
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
