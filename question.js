// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase initialization
const firebaseConfig = {
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const auth = getAuth(app);

// Check user authentication status
onAuthStateChanged(auth, (user) => {
  if (user) {
    

    document.getElementById("page-container").style.display = "block"

const queue = {};
const surveyList = [];

// DOM Elements
const questionList = document.getElementById("questions-list");
const questionTextInput = document.getElementById("question-text");
const surveySelect = document.getElementById("survey-select");
const questionType = document.getElementById("question-type");
const optionA = document.getElementById("optionsa");
const optionB = document.getElementById("optionsb");
const optionC = document.getElementById("optionsc");
const optionD = document.getElementById("optionsd");
const optionE = document.getElementById("optionse");
const questionImageInput = document.getElementById("question-image"); // Image upload input
const addQuestionBtn = document.getElementById("add-question-btn");
const updateQuestionBtn = document.getElementById("update-question-btn");
const queueList = document.getElementById('queue');
const addNewBtn = document.getElementById('add-btn')
const questionView = document.getElementById('question-view')
const formView = document.getElementById('question-form')
// DOM Element for search input
const searchInput = document.getElementById("search-input");

// Load surveys for dropdown
async function loadSurveys() {
    questionView.style.display = 'flex'
  formView.style.display = 'none'
  const surveysSnapshot = await getDocs(collection(db, "surveys"));
  surveySelect.innerHTML = "";
  surveysSnapshot.forEach((doc) => {
    surveyList.push(doc.data().title);
    const option = document.createElement("option");
    option.value = doc.data().title;
    option.textContent = doc.data().title;
    surveySelect.appendChild(option);
  });
}


addNewBtn.addEventListener('click', () => {
  questionView.style.display = 'none'
  formView.style.display = 'flex'
})

// Load questions and clear existing UI before rendering
// Load questions with optional search filtering
async function loadQuestions(searchTerm = "") {
  const questionsSnapshot = await getDocs(collection(db, "questions"));
  
  // Clear the existing question list before re-rendering
  queueList.innerHTML = "";  

  questionsSnapshot.forEach((doc) => {
    const question = doc.data();
    const lowerText = question.text.toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Check if the search term matches the question text
    if (lowerText.includes(lowerSearchTerm)) {
      const parent = document.createElement("div");
      queueList.append(parent); // Append to the queue list

      const questionItem = document.createElement("div");
      questionItem.innerHTML = `
        <h4>${question.text}</h4>
        <p> ${question.surveyId}</p>
        <p>${question.type}</p>
      `;

      const con = document.createElement("div");
      con.classList.add("action");

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.innerText = "Edit";
      editBtn.addEventListener("click", () => {
        editQuestion(
          doc.id,
          question.text,
          question.surveyId,
          question.type,
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
          question.optionE,
          question.imageUrl
        );
      });

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.innerText = "Delete";
      delBtn.addEventListener("click", () => {
        deleteQuestion(doc.id); // Pass the correct question ID to delete
      });

      con.appendChild(editBtn);
      con.appendChild(delBtn);
      questionItem.appendChild(con);
      parent.appendChild(questionItem);
    }
  });
}

// Add event listener to the search input for filtering questions
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value;
  loadQuestions(searchTerm); // Load filtered questions
});




// Add question event listener
addQuestionBtn.addEventListener("click", async () => {
  document.getElementById('question-view').style.display = 'none'
  document.getElementById('question-form').style.display = 'flex'

  const questionText = questionTextInput.value;
  const surveyId = surveySelect.value;
  const qType = questionType.value;
  const optA = optionA.value || ""
  const optB = optionB.value || ""
  const optC = optionC.value  || ""
  const optD = optionD.value  || ""
  const optE = optionE.value  || ""

  // Handle file upload if an image is selected
  let imageUrl = "";
  const file = questionImageInput.files[0];
  if (file) {
    const storageRef = ref(storage, `questions/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  if (!questionText || !surveyId || !qType ) {
    alert("Please fill in all fields");

    return;
  }
 
  if(!optionA){
    alert("Please enter at least one option at Option A")
    return;
  }

  await addDoc(collection(db, "questions"), {
    text: questionText,
    surveyId: surveyId,
    type: qType,
    optionA: optA,
    optionB: optB || "",
    optionC: optC || '',
    optionD: optD || '',
    optionE: optE || '',
    imageUrl: imageUrl
  });

  alert("Your question has been added successfully!")

  // Clear input fields
  questionTextInput.value = "";
  optionA.value = "";
  optionB.value = "";
  optionC.value = "";
  optionD.value = "";
  optionE.value = "";
  questionType.value = "";
  questionImageInput.value = "";

  // Reload the questions and re-render the UI
  loadQuestions();
});

// Edit question
function editQuestion(questionId,text, surveyId, type, optA, optB, optC, optD, optE, imageUrl) {
  questionView.style.display = 'none'
  formView.style.display = 'flex'
  questionTextInput.value = text;
  surveySelect.value = surveyId;
  questionType.value = type;
  optionA.value = optA || "";
  optionB.value = optB || "";
  optionC.value = optC || "";
  optionD.value = optD || "";
  optionE.value = optE || "";
  
  updateQuestionBtn.style.display = "block";
  addQuestionBtn.style.display = "none";

  updateQuestionBtn.onclick = async () => {
    const updatedText = questionTextInput.value;
    const updatedSurvey = surveySelect.value;
    const updatedType = questionType.value;
    const updatedA = optionA.value;
    const updatedB = optionB.value;
    const updatedC = optionC.value;
    const updatedD = optionD.value;
    const updatedE = optionE.value;

    // Handle file upload for the updated image
    let newImageUrl = imageUrl;
    const file = questionImageInput.files[0];
    if (file) {
      const storageRef = ref(storage, `questions/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      newImageUrl = await getDownloadURL(snapshot.ref);
    }

    const questionRef = doc(db, "questions", questionId);
    await updateDoc(questionRef, {
      text: updatedText,
      surveyId: updatedSurvey,
      type: updatedType,
      optionA: updatedA,
      optionB: updatedB,
      optionC: updatedC,
      optionD: updatedD,
      optionE: updatedE,
      imageUrl: newImageUrl
    });


    alert("Question Updated Succesfully!")
    loadQuestions();
    resetForm();
  };
}

// Delete question function
async function deleteQuestion(questionId) {
    
try {
    const confirmation = confirm("Are you sure you want to delete this question?");
    
    if (confirmation) {
        await deleteDoc(doc(db, "questions", questionId));  // Delete the document by its ID
        alert("Question successfully deleted!");

        // Reload the questions and re-render the UI
        loadQuestions();
    } else {
        alert("Deletion canceled.");
    }
} catch (error) {
    console.error("Error deleting question: ", error);
    alert("Failed to delete question. Please try again.");
}

}

// Reset form
function resetForm() {
    questionTextInput.value = "";
    optionA.value = "";
    optionB.value = "";
    optionC.value = "";
    optionD.value = "";
    optionE.value = "";
    questionType.value = "";
    surveySelect.selectedIndex = 0;
    updateQuestionBtn.style.display = "none";
    addQuestionBtn.style.display = "block";
  }


  document.getElementById('cancel').addEventListener('click', ()=>{
    loadSurveys();
loadQuestions();
resetForm()
  })
// Load surveys and questions on page load
loadSurveys();
loadQuestions();


  } else {
    // No user is signed in, redirect to login page
    window.location.href = "./login.html";
  }
});

const logoutButton = document.getElementById("log-out");
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Error logging out:", error);
    });
});
