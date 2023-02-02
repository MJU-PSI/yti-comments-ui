import { Component, Input } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';
import { availableLanguages } from '@mju-psi/yti-common-ui';

@Component({
  selector: 'app-content-language',
  template: `
    <div ngbDropdown class="d-inline-block float-right" [placement]="placement">
      <button class="btn btn-language" id="content_language_dropdown_button" ngbDropdownToggle>
        <span>{{contentLanguage}}</span>
      </button>
      <div ngbDropdownMenu aria-labelledby="content_language_dropdown_button">
        <div *ngFor="let language of availableLanguages">
          <button id="{{language.code + '_content_lang_dropdown_button'}}"
                  class="dropdown-item"
                  type="button"
                  [class.active]="language.code === contentLanguage"
                  (click)='contentLanguage = language.code'>
            <span>{{language.name}}</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ContentLanguageComponent {

  @Input() placement = 'bottom-right';
  availableLanguages: any[];

  constructor(public languageService: LanguageService) {
    this.availableLanguages = availableLanguages;
  }

  get contentLanguage(): Language {
    return this.languageService.contentLanguage;
  }

  set contentLanguage(value: Language) {
    this.languageService.contentLanguage = value;
  }
}
