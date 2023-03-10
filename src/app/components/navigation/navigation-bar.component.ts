import { Component } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';
import { LoginModalService, UserService } from '@mju-psi/yti-common-ui';
import { DataService } from '../../services/data.service';
import { ConfigurationService } from '../../services/configuration.service';
import { availableLanguages } from '@mju-psi/yti-common-ui';

@Component({
  selector: 'app-navigation-bar',
  styleUrls: ['./navigation-bar.component.scss'],
  templateUrl: './navigation-bar.component.html',
})
export class NavigationBarComponent {

  availableLanguages: any;

  fakeableUsers: { email: string, firstName: string, lastName: string }[] = [];

  constructor(public languageService: LanguageService,
              private userService: UserService,
              private loginModal: LoginModalService,
              private dataService: DataService,
              public configurationService: ConfigurationService) {

    this.availableLanguages = availableLanguages;
    dataService.getFakeableUsers().subscribe(users => {
      this.fakeableUsers = users;
    });
  }

  get noMenuItemsAvailable() {

    return true;
  }

  logIn() {
    this.userService.login();
  }

  logOut() {

    this.userService.logout();
  }

  get user() {

    return this.userService.user;
  }

  isLoggedIn() {

    return this.userService.isLoggedIn();
  }

  set language(language: Language) {

    this.languageService.language = language;
  }

  get language(): Language {

    return this.languageService.language;
  }

  isLanguageSelected(language: Language) {

    return language === this.language;
  }

  fakeUser(userEmail: string) {

    const oldEmail = this.user.email;
    if (oldEmail !== userEmail) {
      this.userService.updateLoggedInUser(userEmail);
      this.refreshPageOnUserUpdate(userEmail);
    }
  }

  refreshPageOnUserUpdate(userEmail: string) {

    setTimeout(() => {
      if (this.user.email === userEmail) {
        window.location.reload();
      } else {
        this.refreshPageOnUserUpdate(userEmail);
      }
    }, 500);
  }

  showGroupManagementUrl() {

    return this.user.superuser || this.user.isAdminInAnyOrganization();
  }

  get environmentIdentifier() {

    return this.configurationService.getEnvironmentIdentifier('postfix');
  }
}
