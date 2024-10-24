import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
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

// DOM Elements
const surveyList = document.getElementById("survey-list");
const surveyTitleInput = document.getElementById("survey-title");
const featuredImageInput = document.getElementById("featured-image");
const gradingCriteria1Input = document.getElementById("grading-criteria-1");
const gradingCriteria2Input = document.getElementById("grading-criteria-2");
const gradingCriteria3Input = document.getElementById("grading-criteria-3");
const gradingCriteria4Input = document.getElementById("grading-criteria-4");
const gradingImage1Input = document.getElementById("grading-image-1");
const gradingImage2Input = document.getElementById("grading-image-2");
const gradingImage3Input = document.getElementById("grading-image-3");
const gradingImage4Input = document.getElementById("grading-image-4");
const desc1 = document.getElementById("desc-1")
const desc2 = document.getElementById("desc-2")
const desc3 = document.getElementById("desc-3")
const desc4 = document.getElementById("desc-4")
const desc5 = document.getElementById("desc-5")
const link1 = document.getElementById("link-1")
const link2 = document.getElementById("link-2")
const link3 = document.getElementById("link-3")
const link4 = document.getElementById("link-4")
const link5 = document.getElementById("link-5")
const addSurveyBtn = document.getElementById("add-survey-btn");
const quesList = document.getElementById("question-list");
const updateSurveyBtn = document.getElementById("update-survey-btn");

const draftsTab = document.getElementById("drafts-tab");
const publishedTab = document.getElementById("published-tab");
const addSurvBtn = document.getElementById("add-new-btn");
const survForm = document.getElementById("survey-form");
const tabView = document.getElementById("tabs");
const closeAddSurv = document.getElementById("close-survey-form");
const quesForm = document.getElementById("question-form");

const catEl = document.getElementById("s-cat")

let currentTab = "published"; // Default to drafts
let allSurveyTitle = [];

let curSurvId;


addSurvBtn.addEventListener("click", () => {
  tabView.style.display = "none";
  surveyList.style.display = "none";
  quesList.style.display = "none";
  survForm.style.display = "block";
});

closeAddSurv.addEventListener("click", () => {
  tabView.style.display = "block";
  surveyList.style.display = "flex";
  quesList.style.display = "none";
  survForm.style.display = "none";
});

// Load Surveys by Status (Draft or Published);
async function loadSurveys(status = "published") {
  const surveysSnapshot = await getDocs(collection(db, "surveys"));
  surveyList.innerHTML = "";

  let surveys = [];

  // Collect all surveys in an array
  surveysSnapshot.forEach((doc) => {
    const survey = doc.data();
    survey.id = doc.id;  // Save the document ID for later use
    surveys.push(survey);
  });

  // Sort surveys by number property
  surveys.sort((a, b) => b.number - a.number);

  // Render sorted surveys based on status
  surveys.forEach((survey) => {
    allSurveyTitle.push(survey.title);

    if (survey.status === status) {
      const surveyItem = document.createElement("div");
      surveyItem.innerHTML = `
        <h4>${survey.title}</h4>
        <img src="${survey.featuredImageUrl}" width="100">
      `;

      // Buttons for View, Edit, Delete, Publish/Unpublish
      const btnCont = document.createElement("div");
      btnCont.classList.add("button-container");

      // View Questions Button
      const viewQuestionsButton = document.createElement("button");
      viewQuestionsButton.innerText = "View Questions";
      viewQuestionsButton.classList.add("view-btn");
      viewQuestionsButton.addEventListener("click", () =>
        viewQuestions(survey.title)
      );
      btnCont.appendChild(viewQuestionsButton);

      // Edit Button
      const editSurveyButton = document.createElement("button");
      editSurveyButton.innerText = "Edit";
      editSurveyButton.classList.add("edit-btn");
      editSurveyButton.addEventListener("click", () => {
        editSurvey(survey.id, survey);
      });
      btnCont.appendChild(editSurveyButton);

      // Delete Button
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "X";
      deleteButton.classList.add("del-btn");
      deleteButton.addEventListener("click", () => deleteSurvey(survey.id));
      btnCont.appendChild(deleteButton);

      // Publish/Unpublish Button
      if (survey.status === "draft") {
        const publishButton = document.createElement("button");
        publishButton.innerText = "Publish";
        publishButton.classList.add("publish-btn");
        publishButton.addEventListener("click", () => publishSurvey(survey.id));
        btnCont.appendChild(publishButton);
      } else if (survey.status === "published") {
        const unpublishButton = document.createElement("button");
        unpublishButton.innerText = "Unpublish";
        unpublishButton.classList.add("unpublish-btn");
        unpublishButton.addEventListener("click", () =>
          unpublishSurvey(survey.id)
        );
        btnCont.appendChild(unpublishButton);
      }

      surveyItem.appendChild(btnCont);
      surveyList.appendChild(surveyItem);
    }
  });
}

// Edit Survey function
function editSurvey(id, survey) {
  surveyTitleInput.value = survey.title;
  gradingCriteria1Input.value = survey.gradingCriteria1;
  gradingCriteria2Input.value = survey.gradingCriteria2;
  gradingCriteria3Input.value = survey.gradingCriteria3;
  gradingCriteria4Input.value = survey.gradingCriteria4;
  desc1.value = survey.d1;
  desc2.value = survey.d2;
  desc3.value = survey.d3;
  desc4.value = survey.d4;
  desc5.value = survey.d5;
  link1.value = survey.l1;
  link2.value = survey.l2;
  link3.value = survey.l3;
  link4.value = survey.l4;
  link5.value = survey.l5;
  catEl.value = survey.category;

  survForm.style.display = 'block';
  surveyList.style.display = 'none';
  tabView.style.display = 'none';
  updateSurveyBtn.style.display = 'block';
  addSurveyBtn.style.display = 'none';

  // Update Survey Button
  updateSurveyBtn.addEventListener('click', async () => {
    const surveyTitle = surveyTitleInput.value;
    const gradingCriteria1 = gradingCriteria1Input.value;
    const gradingCriteria2 = gradingCriteria2Input.value;
    const gradingCriteria3 = gradingCriteria3Input.value;
    const gradingCriteria4 = gradingCriteria4Input.value;
    const d1 = desc1.value;
    const d2 = desc2.value;
    const d3 = desc3.value;
    const d4 = desc4.value;
    const d5 = desc5.value;
    const l1 = link1.value;
    const l2 = link2.value;
    const l3 = link3.value;
    const l4 = link4.value;
    const l5 = link5.value;
    const cat = catEl.value;

    // Upload images, returning null if no file is selected
    const [
      imageUrl,
      gradingImage1Url,
      gradingImage2Url,
      gradingImage3Url,
      gradingImage4Url,
    ] = await Promise.all([
      uploadImage(featuredImageInput.files[0]),
      uploadImage(gradingImage1Input.files[0]),
      uploadImage(gradingImage2Input.files[0]),
      uploadImage(gradingImage3Input.files[0]),
      uploadImage(gradingImage4Input.files[0]),
    ]);

    // Update survey in Firestore
    await updateDoc(doc(db, "surveys", id), {
      title: surveyTitle,
      featuredImageUrl: imageUrl || survey.featuredImageUrl, // Handle missing image by storing an empty string
      gradingCriteria1,
      gradingImage1: gradingImage1Url || survey.gradingImage1,
      gradingCriteria2,
      gradingImage2: gradingImage2Url || survey.gradingImage2,
      gradingCriteria3,
      gradingImage3: gradingImage3Url || survey.gradingImage3,
      gradingCriteria4,
      gradingImage4: gradingImage4Url || survey.gradingImage4,
      d1,
      d2,
      d3,
      d4,
      d5,
      l1,
      l2,
      l3,
      l4,
      l5,
      cat,
    });

      // Update questions with the old survey title
    const qSnapshot = await getDocs(query(collection(db, "questions"), where("surveyId", "==", survey.title)));
    qSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
            surveyId: surveyTitle,
        });
    });


    alert("Survey and Questions Updated")

    loadSurveys();
    resetForm();
  });
}


// Add Survey
addSurveyBtn.addEventListener("click", async () => {
  const surveyTitle = surveyTitleInput.value;
  const gradingCriteria1 = gradingCriteria1Input.value;
  const gradingCriteria2 = gradingCriteria2Input.value;
  const gradingCriteria3 = gradingCriteria3Input.value;
  const gradingCriteria4 = gradingCriteria4Input.value;
  const d1 = desc1.value;
  const d2 = desc2.value;
  const d3 = desc3.value;
  const d4 = desc4.value;
  const d5 = desc5.value;
  const l1 = link1.value;
  const l2 = link2.value;
  const l3 = link3.value;
  const l4 = link4.value;
  const l5 = link5.value;

  const cat = catEl.value;

  console.log(cat);
  if (allSurveyTitle.includes(surveyTitle)) {
    alert("This survey already exists! Please change the name");
    return;
  }

  // Retrieve all surveys and find the max number
  const surveysSnapshot = await getDocs(collection(db, "surveys"));
  let lastNumber = 0;

  surveysSnapshot.forEach((doc) => {
    const survey = doc.data();
    if (survey.number > lastNumber) {
      lastNumber = survey.number; // Keep track of the highest number
    }
  });

  const newSurveyNumber = lastNumber + 1; // Increment the last number by 1

  // Upload images, returning null if no file is selected
  const [
    imageUrl,
    gradingImage1Url,
    gradingImage2Url,
    gradingImage3Url,
    gradingImage4Url,
  ] = await Promise.all([
    uploadImage(featuredImageInput.files[0]),
    uploadImage(gradingImage1Input.files[0]),
    uploadImage(gradingImage2Input.files[0]),
    uploadImage(gradingImage3Input.files[0]),
    uploadImage(gradingImage4Input.files[0]),
  ]);

  // Add survey to Firestore
  await addDoc(collection(db, "surveys"), {
    title: surveyTitle,
    featuredImageUrl: imageUrl || "", // Handle missing image by storing an empty string
    gradingCriteria1,
    gradingImage1: gradingImage1Url || "",
    gradingCriteria2,
    gradingImage2: gradingImage2Url || "",
    gradingCriteria3,
    gradingImage3: gradingImage3Url || "",
    gradingCriteria4,
    gradingImage4: gradingImage4Url || "",
    status: "draft", // Default to draft
    d1, d2, d3, d4, d5, l1, l2, l3, l4, l5,
    category: cat,
    number: newSurveyNumber, // Add the new incremented number
  });

  alert("Survey Successfully added, you can now add another survey!");
  resetForm();
  loadSurveys();
});

// Publish Survey
async function publishSurvey(id) {
  await updateDoc(doc(db, "surveys", id), {
    status: "published",
  });
  loadSurveys();
}

// Unpublish Survey
async function unpublishSurvey(id) {
  await updateDoc(doc(db, "surveys", id), {
    status: "draft",
  });
  loadSurveys();
}

// Delete Survey
async function deleteSurvey(id) {
    // Show confirmation prompt
    const isConfirmed = confirm("Are you sure you want to delete this survey? This action cannot be undone.");
  
    // Proceed only if the user confirms
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, "surveys", id)); // Delete the survey from Firestore
        alert("Survey deleted successfully.");
        loadSurveys(); // Reload the surveys after deletion
      } catch (error) {
        console.error("Error deleting survey: ", error);
        alert("An error occurred while deleting the survey. Please try again.");
      }
    } else {
      alert("Survey deletion canceled.");
    }
}

// Upload Images
async function uploadImage(file) {
  if (!file) {
    // Return null or an empty string if no file is uploaded
    return null;
  }

  const storageRef = ref(storage, `images/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Switch Tabs
draftsTab.addEventListener("click", () => {
  currentTab = "drafts";
  draftsTab.classList.add("active");
  publishedTab.classList.remove("active");
  loadSurveys("draft");
});

publishedTab.addEventListener("click", () => {
  currentTab = "published";
  publishedTab.classList.add("active");
  draftsTab.classList.remove("active");
  loadSurveys("published");
});

// Initial Load
loadSurveys();

// Reset Form
function resetForm() {
  surveyTitleInput.value = "";
  gradingCriteria1Input.value = "";
  gradingCriteria2Input.value = "";
  gradingCriteria3Input.value = "";
  gradingCriteria4Input.value = "";
  featuredImageInput.value = "";
  gradingImage1Input.value = "";
  gradingImage2Input.value = "";
  gradingImage3Input.value = "";
  gradingImage4Input.value = "";
}

// DOM ELEMENTS FOR QUESTION
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

// View Questions Functionality
async function viewQuestions(surveyId) {

  tabView.style.display = "none"
  const questionsSnapshot = await getDocs(collection(db, `questions`));
  let questionExist = 0;
  questionsSnapshot.forEach((doc) => {
    const obj = doc.data();

    curSurvId = surveyId

    if (obj.surveyId == surveyId) {
      questionExist++;
      const questionItem = document.createElement("div");
      questionItem.classList.add('questionList')
      questionItem.innerHTML = `
          <h4>${obj.text}</h4>
          <p> ${obj.surveyId}</p>
          <p>${obj.type}</p>

        `;

      

      const con = document.createElement("div");
      con.classList.add("action");

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.innerText = "Edit";
      editBtn.addEventListener("click", () => {
        //   editQuestion(obj.text, obj.surveyId, obj.type, obj.options.join(","), obj.imageUrl);
      });

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.innerText = "Delete";
      delBtn.addEventListener("click", () => {
        //   deleteQuestion();  // Pass the correct question ID to delete
      });

      con.appendChild(editBtn);
      con.appendChild(delBtn);
      // questionItem.appendChild(con);
      quesList.appendChild(questionItem);

      quesList.style.display = "block";
      surveyList.style.display = "none";
    }
  });

  if (!questionExist) {
    const noQuestion = document.createElement("h2");
    noQuestion.innerText = "No questions in this survey! Please add one.";
    const createQues = document.createElement("button");
    createQues.innerText = "Create question";

    curSurvId = surveyId;
    createQues.addEventListener("click", () => {
      showQuesForm();
    });

    console.log(surveyId)
    curSurvId = surveyId

    quesList.appendChild(noQuestion);
    quesList.appendChild(createQues);
    quesList.style.display = "block";
    surveyList.style.display = "none";
  }
}

// Add New Question Button
const newQuestionHandle = document.getElementById('newQuestion')
newQuestionHandle.addEventListener('click', ()=>{
  showQuesForm()
})

// cancel button
document.getElementById('cancel').addEventListener('click', ()=>{
  surveyList.style.display = "block"
  quesForm.style.display = "none"
  loadSurveys()
  resetForm()
  quesList.style.display = 'block'
})

//view question button
function showQuesForm() {
  quesForm.style.display = "block";
  quesList.style.display = "none";
}

addQuestionBtn.addEventListener("click", async () => {
  const questionText = questionTextInput.value;
  const qType = questionType.value;
  const optA = optionA.value || "";
  const optB = optionB.value || "";
  const optC = optionC.value || "";
  const optD = optionD.value || "";
  const optE = optionE.value || "";

  // Handle file upload if an image is selected
  let imageUrl = "";
  const file = questionImageInput.files[0];
  if (file) {
    const storageRef = ref(storage, `questions/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  if (!questionText || !qType) {
    alert("Please fill in all fields");

    return;
  }

  if (!optionA) {
    alert("Please enter at least one option at Option A");
    return;
  }

  await addDoc(collection(db, "questions"), {
    text: questionText,
    surveyId: curSurvId,
    type: qType,
    optionA: optA,
    optionB: optB || "",
    optionC: optC || "",
    optionD: optD || "",
    optionE: optE || "",
    imageUrl: imageUrl,
  });

  alert("Your question has been added successfully!");

  // Clear input fields
  questionTextInput.value = "";
  optionA.value = "";
  optionB.value = "";
  optionC.value = "";
  optionD.value = "";
  optionE.value = "";
  questionType.value = "";
  questionImageInput.value = "";
});


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
