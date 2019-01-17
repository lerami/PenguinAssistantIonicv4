import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { LoadingController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  connections: any;
  connectionsReady: boolean = false;

  constructor(
    private googlePlus: GooglePlus,
    private nativeStorage: NativeStorage,
    public loadingController: LoadingController,
    private router: Router,
    private http: HTTP
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.nativeStorage.getItem('access_token')
      .then(access_token => {
        this.http.get('https://people.googleapis.com/v1/people/me/connections', { personFields: 'emailAddresses' }, { Accept: 'application/json', Authorization: access_token })
          .then(res => {
            this.connections = res.data.connections;
            this.connectionsReady = true;
          })
          .catch(err => {
            console.log(err.status, err.message, err.headers);
          })
        loading.dismiss();
      }, error => {
        console.log(error);
        loading.dismiss();
      });
  }

  doGoogleLogout() {
    this.googlePlus.logout()
      .then(res => {
        //user logged out so we will remove him from the NativeStorage
        this.nativeStorage.remove('access_token');
        this.nativeStorage.remove('google_user');
        this.router.navigate(["/login"]);
      }, err => {
        console.log(err);
      });
  }
}
