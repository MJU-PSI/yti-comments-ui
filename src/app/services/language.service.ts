import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language, Localizable, Localizer, getFromLocalStorage, setToLocalStorage } from '@goraresult/yti-common-ui';
import { BehaviorSubject, combineLatest } from 'rxjs';

export { Language };

@Injectable()
export class LanguageService implements Localizer {

  private static readonly LANGUAGE_KEY: string = 'yti-comments-ui.language-service.language';
  private static readonly CONTENT_LANGUAGE_KEY: string = 'yti-comments-ui.language-service.content-language';
  private static readonly LANGUAGE_FI = 'fi';
  private static readonly LANGUAGE_EN = 'en';
  private static readonly LANGUAGE_SV = 'sv';

  language$ = new BehaviorSubject<Language>(getFromLocalStorage(LanguageService.LANGUAGE_KEY, LanguageService.LANGUAGE_FI));
  contentLanguage$ = new BehaviorSubject<Language>(getFromLocalStorage(LanguageService.CONTENT_LANGUAGE_KEY, LanguageService.LANGUAGE_FI));
  translateLanguage$ = new BehaviorSubject<Language>(this.language);

  constructor(private translateService: TranslateService) {

    translateService.addLangs([LanguageService.LANGUAGE_FI, LanguageService.LANGUAGE_EN]);
    translateService.use(LanguageService.LANGUAGE_FI);
    translateService.setDefaultLang(LanguageService.LANGUAGE_EN);
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

  translateToGivenLanguage(localizable: Localizable, languageToUse: string | null = LanguageService.LANGUAGE_FI): string {

    if (!localizable || !languageToUse) {
      return '';
    }

    const primaryLocalization = localizable[languageToUse];

    if (primaryLocalization) {
      return primaryLocalization;
    } else {

      const fallbackValue = this.checkForFallbackLanguages(localizable);

      if (fallbackValue != null) {
        return fallbackValue;
      }

      for (const [language, value] of Object.entries(localizable)) {
        if (value) {
          return `${value} (${language})`;
        }
      }

      return '';
    }
  }

  checkForFallbackLanguages(localizable: Localizable): string | null {

    const fallbackLanguages: string[] = [LanguageService.LANGUAGE_EN, LanguageService.LANGUAGE_FI, LanguageService.LANGUAGE_SV];

    for (const language of fallbackLanguages) {
      if (this.hasLocalizationForLanguage(localizable, language)) {
        return this.fallbackLocalization(localizable, language);
      }
    }

    return null;
  }

  hasLocalizationForLanguage(localizable: Localizable, language: string) {

    const value: string = localizable[language];
    return value != null && value !== '';
  }

  fallbackLocalization(localizable: Localizable, language: string) {

    const value: string = localizable[language];
    return `${value} (${language})`;
  }
}
