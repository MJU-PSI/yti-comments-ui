import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language, Localizable, Localizer } from 'yti-common-ui/types/localization';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { getFromLocalStorage, setToLocalStorage } from 'yti-common-ui/utils/storage';

export { Language };

@Injectable()
export class LanguageService implements Localizer {

  private static readonly LANGUAGE_KEY: string = 'yti-comments-ui.language-service.language';
  private static readonly CONTENT_LANGUAGE_KEY: string = 'yti-comments-ui.language-service.content-language';

  language$ = new BehaviorSubject<Language>(getFromLocalStorage(LanguageService.LANGUAGE_KEY, 'fi'));
  contentLanguage$ = new BehaviorSubject<Language>(getFromLocalStorage(LanguageService.CONTENT_LANGUAGE_KEY, 'fi'));
  translateLanguage$ = new BehaviorSubject<Language>(this.language);

  constructor(private translateService: TranslateService) {

    translateService.addLangs(['fi', 'en']);
    translateService.use('fi');
    translateService.setDefaultLang('en');
    this.language$.subscribe(lang => this.translateService.use(lang));

    combineLatest(this.language$, this.contentLanguage$)
      .subscribe(([lang, contentLang]) => this.translateLanguage$.next(contentLang || lang));
  }

  get language(): Language {
    return this.language$.getValue();
  }

  set language(language: Language) {
    if (this.language !== language) {
      this.language$.next(language);
      setToLocalStorage(LanguageService.LANGUAGE_KEY, language);
    }
  }

  get contentLanguage(): Language {
    return this.contentLanguage$.getValue();
  }

  set contentLanguage(language: Language) {
    if (this.contentLanguage !== language) {
      this.contentLanguage$.next(language);
      setToLocalStorage(LanguageService.CONTENT_LANGUAGE_KEY, language);
    }
  }

  translate(localizable: Localizable, useUILanguage = false): string {

    if (!localizable) {
      return '';
    }

    const primaryLocalization = localizable[useUILanguage ? this.language : this.contentLanguage];

    if (primaryLocalization) {
      return primaryLocalization;
    } else {

      // FIXME: dummy fallback
      for (const [language, value] of Object.entries(localizable)) {
        if (value) {
          return `${value} (${language})`;
        }
      }

      return '';
    }
  }

  isLocalizableEmpty(localizable: Localizable): boolean {

    if (!localizable) {
      return true;
    }

    for (const prop in localizable) {
      if (localizable.hasOwnProperty(prop)) {
        return false;
      }
    }

    return JSON.stringify(localizable) === JSON.stringify({});
  }
}
