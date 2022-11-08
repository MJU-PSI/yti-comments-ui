import { Component, Input } from '@angular/core';
import { Localizable, comparingPrimitive } from '@goraresult/yti-common-ui';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-literal-multilanguage',
  template: `
    <dl>
      <dt>
        <label *ngIf="label">{{label}}</label>
        <app-information-symbol *ngIf="infoText" [infoText]="infoText"></app-information-symbol>
      </dt>
      <dd *ngIf="valueLanguages.length > 0">
        <div class="localized" *ngFor="let language of valueLanguages">
          <div *ngIf="showLanguageIdentifier(language)" class="language">{{ language.toUpperCase()}}</div>
          <div *ngIf="showLanguageIdentifier(language)" class="localization">{{ value[language] }}</div>
          <div *ngIf="!showLanguageIdentifier(language)" class="localization-without-id">{{ value[language] }}</div>
        </div>
      </dd>
      <dd *ngIf="valueLanguages.length === 0">
        <span>-</span>
      </dd>
    </dl>
  `
})
export class LiteralMultilanguageComponent {

  @Input() label: string;
  @Input() value: Localizable;
  @Input() infoText: string;

  constructor(public translateService: TranslateService,
              public languageService: LanguageService) {
  }

  get valueLanguages(): string[] {

    const languages: string[] = Object.keys(this.value);
    languages.sort(comparingPrimitive<string>(language => language));
    const sortedLanguages: string[] = [];
    if (languages.includes('fi')) {
      sortedLanguages.push('fi');
    }
    if (languages.includes('sv')) {
      sortedLanguages.push('sv');
    }
    if (languages.includes('en')) {
      sortedLanguages.push('en');
    }
    languages.forEach(key => {
      if (key !== 'fi' && key !== 'sv' && key !== 'en') {
        sortedLanguages.push(key);
      }
    });
    return sortedLanguages;
  }

  showLanguageIdentifier(language: string): boolean {

    return language.toUpperCase() !== 'UND';
  }
}
