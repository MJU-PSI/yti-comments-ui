import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Location } from '@goraresult/yti-common-ui';
import { CommentRound } from '../entities/commentround';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from './configuration.service';
import { Title } from '@angular/platform-browser';

const frontPage = { localizationKey: 'Front page', route: [''] };
const informationAboutServicePage = { localizationKey: 'Information about the service', route: ['information'] };
const createCommentRoundPage = { localizationKey: 'Create comment round', route: ['createround'] };

@Injectable()
export class LocationService implements OnDestroy {

  location = new Subject<Location[]>();

  private titleTranslationSubscription: Subscription;

  constructor(private translateService: TranslateService,
              private configurationService: ConfigurationService,
              private titleService: Title) {

    this.titleTranslationSubscription = this.translateService.stream('Comments').subscribe(value => {
      this.titleService.setTitle(this.configurationService.getEnvironmentIdentifier('prefix') + value);
    });
  }

  ngOnDestroy() {

    this.titleTranslationSubscription.unsubscribe();
  }

  private changeLocation(location: Location[]): void {

    location.unshift(frontPage);
    this.location.next(location);
  }

  atFrontPage(): void {

    this.changeLocation([]);
  }

  atCommentRoundPage(commentRound: CommentRound): void {

    this.changeLocation(commentRound.location);
  }

  atCommentRoundCreatePage(): void {

    this.changeLocation([createCommentRoundPage]);
  }

  atUserDetails(): void {

    this.changeLocation([{
      localizationKey: 'User details',
      route: ['userdetails']
    }]);
  }

  atInformationAboutService(): void {

    this.changeLocation([informationAboutServicePage]);
  }
}
