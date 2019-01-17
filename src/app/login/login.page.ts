import { Component } from '@angular/core';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingController, AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  constructor(
    private googlePlus: GooglePlus,
    private nativeStorage: NativeStorage,
    public loadingController: LoadingController,
    private router: Router,
    private platform: Platform,
    public alertController: AlertController
  ) { }

  async doGoogleLogin(){
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
    this.googlePlus.login({
      'scopes': 'https://www.googleapis.com/auth/contacts.readonly', // optional - space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
      'webClientId': '242087552758-qv032me9i8qojk90ta9pint0gjtq2vs4.apps.googleusercontent.com', // optional - clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
      'offline': true, // Optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
      })
      .then(res => {
        //save user data on the native storage
        this.nativeStorage.setItem('google_user', {
          name: res.displayName,
          email: res.email,
          picture: res.imageUrl
        })
        this.nativeStorage.setItem('access_token',res.accessToken)
        .then(() => {
           this.router.navigate(["/home"]);
        }, (error) => {
          console.log("error when setting item in native storage : "+error);
        })
        loading.dismiss();
      }, err => {
        console.log("error when login with google plus :"+err);
        if(!this.platform.is('cordova')){
          this.presentAlert();
        }
        loading.dismiss();
      })
  }

  async presentAlert() {
    const alert = await this.alertController.create({
       message: 'Cordova is not available on desktop. Please try this in a real device or in an emulator.',
       buttons: ['OK']
     });

    await alert.present();
  }


  async presentLoading(loading) {
    return await loading.present();
  }

}