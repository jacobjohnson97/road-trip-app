import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

enum Action { LOGIN, REGISTER }

@Component({
  selector: 'app-login-card',
  templateUrl: './login-card.component.html',
  styleUrls: ['./login-card.component.scss'],
})
export class LoginCardComponent implements OnInit {

  constructor(private router: Router, private modalController: ModalController, public toastController: ToastController, public http : HttpClient) { }

  ngOnInit() {}

  Action = Action;
  action : Action = Action.LOGIN;
  awaitRegister : boolean;
  awaitLogin : boolean;
  errorRaised : boolean;

  loginEmail : string;
  loginPassword : string;
  registerEmail : string;
  registerPassword : string;
  confirmPassword : string;

  emailPattern : RegExp = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

  login() {
    if (this.validateLogin()) {
      this.errorRaised = false;
      this.awaitLogin = true;
      let body = {
        "email": this.loginEmail,
        "password": this.loginPassword
      }
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8'
        })
      };

      this.http.post('http://localhost:3000/api/login', body, httpOptions).subscribe((response) => {
        this.awaitLogin = false;
        localStorage.setItem('sectok', response['token']);
        window.location.reload();
      }, (err) => {
        err.status == 403 || err.status == 422 ? this.dangerToast('Invalid username or password') : this.dangerToast('Something went wrong. Please try again later.');
        this.awaitLogin = false;
      });
    } else {
      this.dangerToast('Invalid username or password')
      this.errorRaised = true;
    }
  }

  registerUser() {
    if (this.validateRegister()) {
      this.errorRaised = false;
      this.awaitRegister = true;
      let body = {
        "email": this.registerEmail,
        "password": this.registerPassword
      }
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8'
        })
      };

      this.http.post('http://localhost:3000/api/register', body, httpOptions).subscribe((response) => {
        this.successToast('Registration successful!');
        this.awaitRegister = false;
        this.action = Action.LOGIN;
      }, (err) => {
        err.status == 422 ? this.dangerToast('Invalid fields') : this.dangerToast('Something went wrong. Please try again later.');
        this.awaitRegister = false;
      });
    } else {
      this.dangerToast('Invalid fields');
      this.errorRaised = true;
    }
  }

  async dangerToast(message : string) {
    const toast = await this.toastController.create({
      message: message,
      color: 'danger',
      duration: 2000
    });
    toast.present();
  }

  async successToast(message : string) {
    const toast = await this.toastController.create({
      message: message,
      color: 'success',
      duration: 2000
    });
    toast.present();
  }

  validateRegister() {
    let valid = this.emailPattern.test(this.registerEmail);
    valid = valid && this.registerPassword.length >= 8;
    valid = valid && this.confirmPassword.length >= 8;
    valid = valid && this.registerPassword == this.confirmPassword;
    return valid;
  }

  validateLogin() {
    let valid = this.emailPattern.test(this.loginEmail);
    valid = valid && this.loginPassword.length >= 8;
    return valid;
  }

}
