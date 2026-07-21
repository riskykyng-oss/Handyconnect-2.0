import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "@/firebase/config";

class AuthService {

  login(email, password) {
    return signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  }

  signup(email, password) {
    return createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
  }

  logout() {
    return signOut(auth);
  }

  forgotPassword(email) {
    return sendPasswordResetEmail(
      auth,
      email
    );
  }

}

export default new AuthService();