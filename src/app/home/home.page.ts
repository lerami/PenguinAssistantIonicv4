import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { LoadingController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  connections: any;
  connectionsReady: boolean = false;

  constructor(
    private http: HTTP,
    private googlePlus: GooglePlus,
    private nativeStorage: NativeStorage,
    public loadingController: LoadingController,
    private router: Router
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.nativeStorage.getItem('access_token')
      .then(access_token => {
        console.log(access_token);
        this.http.get('https://people.googleapis.com/v1/people/me/connections', { personFields: 'names,emailAddresses', access_token: access_token }, { Accept: 'application/json' })
          .then(res => {
            console.log(res.data);
            this.connections = res.data.connections;
            this.connectionsReady = true;
          })
          .catch(err => {
            console.log('error with request : ' + err.error.code + err.error.message + err.error.status);
          })
        loading.dismiss();
      }, error => {
        console.log('error with native storage : ' + error);
        loading.dismiss();
      });
  }

  doGoogleLogout() {
    this.googlePlus.logout()
      .then(res => {
        //user logged out so we will remove him from the NativeStorage
        this.nativeStorage.remove('access_token');
        this.router.navigate(["/login"]);
      }, err => {
        console.log(err);
      });
  }
}