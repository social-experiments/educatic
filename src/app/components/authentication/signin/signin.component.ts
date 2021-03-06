import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthenticationService } from '../../../_services';
import { LoginRequest, Role } from '../../../_models';
import { ToastController, ModalController } from '@ionic/angular';
import { ErrorStateMatcherHelper } from '../../../_helpers/error-state-matcher';
import { StudentSigninPage } from '../student-signin/student-signin.page';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit, OnDestroy {
  background = `assets/${environment.StaticSourcePath}/background-image.png`;
  logo = `assets/${environment.StaticSourcePath}/logo.png`;
  currentApplicationVersion = environment.appVersion;
  loginForm: FormGroup;
  submitted = false;
  returnUrl: string;
  hide = true;
  loginRequest: LoginRequest;
  error = '';
  loading = false;
  matcher = new ErrorStateMatcherHelper();
  studentLoginModal: HTMLIonModalElement;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    public toastController: ToastController,
    private modalController: ModalController,
  ) { }
  ngOnDestroy(): void {
  }
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', [
        Validators.required
      ])
    });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
  }
  get f() {
    return this.loginForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    this.loading = true;
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    } else {
      this.loginRequest = {
        email: this.f.username.value,
        password: this.f.password.value
      };
      this.authenticationService.Login(this.loginRequest)
        .subscribe((loginResponse) => {
          this.authenticationService.RefreshNotificationToken();
          const user = loginResponse[0];
          if (user.forceChangePasswordNextLogin) {
            this.router.navigate(['/reset/password']);
          } else {
            if (user.role === Role.Student) {
              this.router.navigate(['/student/assignments']);
            } else {
              this.router.navigate([this.returnUrl]);
            }
          }
        },
          error => {
            this.presentToast();
            this.loading = false;
          });
    }
  }

  async openStudentSignInModal() {
    if(this.studentLoginModal) {
      this.studentLoginModal.dismiss();
    }
    this.studentLoginModal =
      await this.modalController.create({
        component: StudentSigninPage,
        mode: 'ios',
      });
    await this.studentLoginModal.present();
  }

  private async presentToast() {
    const toast = await this.toastController.create({
      message: 'The email address or password are incorrect, or no account exists for this email.',
      position: 'top',
      duration: 10000,
      color: 'danger',
      buttons: [{
        text: 'Close',
        role: 'cancel',
      }
      ]
    });
    toast.present();
  }
}
