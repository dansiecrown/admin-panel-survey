  // Import Firebase modules
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
  import {  getAuth, setPersistence, signInWithEmailAndPassword, browserSessionPersistence} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';

  // Your web app's Firebase configuration
  const firebaseConfig = {

  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Handle form submission for login
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log(email, password);
    // Set session persistence to 'session' (or 'local' for persistent login)
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        // Sign in the user
        return signInWithEmailAndPassword(auth, email, password);
      })
      .then((userCredential) => {
        // User is signed in
        const user = userCredential.user;
        console.log("User signed in:", user);
        alert("Login successful!");
        window.location.href = 'https://msrepresented.com/admin-qsm/index.html'; // Redirect to a different page after login
      })
      .catch((error) => {
       handleFirebaseError(error)
      });
  });

  // Function to handle Firebase errors (optional)
  function handleFirebaseError(error) {
    const errorCode = error.code;
    let errorMessage = "Login failed. Please try again.";
    switch (errorCode) {
      case 'auth/wrong-password':
        errorMessage = "Incorrect password. Please try again.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Please enter a valid email address.";
        break;
      case 'auth/user-not-found':
        errorMessage = "Email not found. Please create an account.";
        break;
      // Add more cases for other error codes
      default:
        console.error("Firebase Error:", error); // Log full error for debugging
    }
    return errorMessage;
  }