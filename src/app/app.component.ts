import { Component } from '@angular/core';
import { LocationService } from './services/location.service';
import { Router } from '@angular/router';

const versionInfo = require('!raw-loader!../version.txt');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  version: string;

  constructor(private locationService: LocationService,
              private router: Router) {
    this.version = versionInfo;
  }

  get location() {

    return this.locationService.location;
  }

  navigateToInformation() {

    this.router.navigate(['/information']);
  }

  navigateToAccessibility() {
    this.router.navigate(['/accessibility']);
  }

  navigateToPrivacy() {
    this.router.navigate(['/privacy']);
  }
}
