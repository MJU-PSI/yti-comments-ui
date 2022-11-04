import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FrontpageComponent } from './components/frontpage/frontpage.component';
import { ResolveEnd, Route, Router, RouterModule, Routes, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { of } from 'rxjs';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { CommentRoundComponent } from './components/commentround/comment-round.component';
import { NavigationBarComponent } from './components/navigation/navigation-bar.component';
import { LogoComponent } from './components/navigation/logo.component';
import { DataService } from './services/data.service';
import { LocationService } from './services/location.service';
import { LanguageService } from './services/language.service';
import { AUTHENTICATED_USER_ENDPOINT, LOCALIZER, YtiCommonModule, ModalService } from '@vrk-yti/yti-common-ui';
import { InformationAboutServiceComponent } from './components/information/information-about-service.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserDetailsComponent } from './components/userdetails/user-details.component';
import { RefreshComponent } from './refresh.component';
import { CommentRoundCreateComponent } from './components/commentround/comment-round-create.component';
import { EditableButtonsComponent } from './components/form/editable-buttons.component';
import { ErrorMessagesComponent } from './components/form/error-messages.component';
import { LocalizableLiteralComponent } from './components/form/localizable-literal';
import { LocalizableTextareaInputComponent } from './components/form/localizable-textarea-input';
import { LiteralComponent } from './components/form/literal';
import { LiteralInputComponent } from './components/form/literal-input';
import { LinkComponent } from './components/form/link';
import { CommentRoundStatusInputComponent } from './components/form/comment-round-status-input.component';
import { DateInputComponent } from './components/form/date-input.component';
import { DateRangeInputComponent } from './components/form/date-range-input.component';
import { SourceInputComponent } from './components/form/source-input.component';
import { CommentsErrorModalService } from './components/common/error-modal.service';
import {
  SearchLinkedOrganizationModalComponent,
  SearchLinkedOrganizationModalService
} from './components/form/search-linked-organization-modal.component';
import { ContentLanguageComponent } from './components/common/content-language-component';
import { AuthorizationManager } from './services/authorization-manager';
import { CommentRoundStatusDropdownComponent } from './components/form/comment-round-status-dropdown.component';
import { CommentRoundListitemComponent } from './components/commentround/comment-round-listitem.component';
import { BooleanInputComponent } from './components/form/boolean-input-component';
import { LocalizableInputComponent } from './components/form/localizable-input';
import { CommentRoundStatusComponent } from './components/form/comment-round-status.component';
import { LiteralTextareaComponent } from './components/form/literal-textarea';
import { LocalizableTextareaComponent } from './components/form/localizable-textarea';
import { InlineClipboardComponent } from './components/form/inline-clipboard';
import { ClipboardModule } from 'ngx-clipboard';
import { CurrentStatusComponent } from './components/form/current-status';
import { ProposedStatusTableDropdownComponent } from './components/form/proposed-status-dropdown';
import { IntegrationResourceService } from './services/integrationresource.service';
import { CommentsConfirmationModalService } from './components/common/confirmation-modal.service';
import { HierarchicalCommentListitemComponent } from './components/common/hierarchical-comment-listitem.component';
import { LiteralMultilanguageComponent } from './components/form/literal-multilanguage';
import { ConfigurationService } from './services/configuration.service';
import { CommentRoundDateRangeInputComponent } from './components/form/app-comment-round-date-range.component';
import { AutosizeModule } from 'ngx-autosize';
import { LocalizableUndefinedTextareaComponent } from './components/form/literal-und-textarea';
import { CommentRoundInformationComponent } from './components/commentround/comment-round-information.component';
import { CommentRoundCommentsComponent } from './components/commentround/comment-round-comments.component';
import { CommentRoundCommentThreadsComponent } from './components/commentround/comment-round-comment-threads.component';
import {
  SearchLinkedIntegrationResourceMultiModalComponent,
  SearchLinkedIntegrationResourceMultiModalService
} from './components/form/search-linked-integration-resource-multi-modal.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { IntegrationResourceListItemComponent } from './components/form/integration-resource-list-item-component';
import { IntegrationResourceVirtualScrollerComponent } from './components/form/integration-resource-virtual-scroller-component';
import { CookieCleanupComponent } from './components/cookiecleanup/cookie-cleanup.component';
import { CookieService } from 'ngx-cookie-service';
import {
  SearchLinkedContainerModalComponent,
  SearchLinkedContainerModalService
} from './components/form/search-linked-integration-container-modal.component';
import { UserDetailsSubscriptionsComponent } from './components/userdetails/user-details-subscriptions.component';
import { UserDetailsInformationComponent } from './components/userdetails/user-details-information.component';
import { MessagingService } from './services/messaging-service';
import { TempUserInputComponent } from './components/form/temp-user-input.component';
import { AddTempUsersModalComponent, AddTempUsersModalService } from './components/form/add-temp-users-modal.component';
import { OrganizationsInputComponent } from './components/form/organizations-input.component';
import enPo from 'raw-loader!po-loader?format=mf!../../po/en.po';
import svPo from 'raw-loader!po-loader?format=mf!../../po/sv.po';
import fiPo from 'raw-loader!po-loader?format=mf!../../po/fi.po';
import fiCommonPo from 'raw-loader!po-loader?format=mf!../../node_modules/@vrk-yti/yti-common-ui/po/fi.po';
import svCommonPo from 'raw-loader!po-loader?format=mf!../../node_modules/@vrk-yti/yti-common-ui/po/sv.po';
import enCommonPo from 'raw-loader!po-loader?format=mf!../../node_modules/@vrk-yti/yti-common-ui/po/en.po';
import { environment } from '../environments/environment';

declare var require: any;

function removeEmptyValues(obj: {}) {

  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!!value) {
      result[key] = value;
    }
  }

  return result;
}

const localizations: { [lang: string]: any } = {
  fi: {
    ...removeEmptyValues(JSON.parse(fiPo)),
    ...removeEmptyValues(JSON.parse(fiCommonPo))
  },
  sv: {
    ...removeEmptyValues(JSON.parse(svPo)),
    ...removeEmptyValues(JSON.parse(svCommonPo))
  },
  en: {
    ...removeEmptyValues(JSON.parse(enPo)),
    ...removeEmptyValues(JSON.parse(enCommonPo))
  }
};

export function refreshRouteMatcher(segments: UrlSegment[], group: UrlSegmentGroup, route: Route) {
  if (segments.length >= 1 && segments[0].path === 're') {
    return {
      consumed: segments
    };
  }
  return {
    consumed: []
  };
}

export function initApp(configurationService: ConfigurationService) {
  return () => configurationService.fetchConfiguration();
}

export function resolveAuthenticatedUserEndpoint() {
  return '/comments-api/api/authenticated-user';
}

export function createTranslateLoader(): TranslateLoader {
  return { getTranslation: (lang: string) => of(localizations[lang]) };
}

export function createMissingTranslationHandler(): MissingTranslationHandler {
  return {
    handle: (params: MissingTranslationHandlerParams) => {
      if (params.translateService.currentLang === 'en') {
        return params.key;
      } else {
        return '[MISSING]: ' + params.key;
      }
    }
  };
}

const appRoutes: Routes = [
  { path: '', component: FrontpageComponent, pathMatch: 'full' },
  { path: 'frontpage', redirectTo: '/', pathMatch: 'full' },
  { path: 'round', component: CommentRoundComponent, pathMatch: 'full' },
  { path: 'createround', component: CommentRoundCreateComponent, pathMatch: 'full' },
  { path: 'information', component: InformationAboutServiceComponent },
  { path: 'userdetails', component: UserDetailsComponent },
  { path: 'cleancookies', component: CookieCleanupComponent },
  // NOTE: If createRefreshRouteMatcher(['re']) starts to work after angular upgrade, then switch to that.
  { matcher: refreshRouteMatcher, component: RefreshComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    FrontpageComponent,
    CommentRoundComponent,
    CommentRoundInformationComponent,
    CommentRoundCommentsComponent,
    CommentRoundCommentThreadsComponent,
    NavigationBarComponent,
    LogoComponent,
    InformationAboutServiceComponent,
    UserDetailsComponent,
    UserDetailsInformationComponent,
    UserDetailsSubscriptionsComponent,
    RefreshComponent,
    CommentRoundCreateComponent,
    EditableButtonsComponent,
    ErrorMessagesComponent,
    OrganizationsInputComponent,
    TempUserInputComponent,
    LocalizableLiteralComponent,
    LocalizableTextareaInputComponent,
    LocalizableTextareaComponent,
    InlineClipboardComponent,
    LiteralInputComponent,
    LiteralComponent,
    LinkComponent,
    CommentRoundStatusInputComponent,
    DateRangeInputComponent,
    DateInputComponent,
    SourceInputComponent,
    SearchLinkedContainerModalComponent,
    SearchLinkedIntegrationResourceMultiModalComponent,
    SearchLinkedOrganizationModalComponent,
    AddTempUsersModalComponent,
    ContentLanguageComponent,
    CommentRoundStatusDropdownComponent,
    CommentRoundListitemComponent,
    BooleanInputComponent,
    LocalizableInputComponent,
    CommentRoundStatusComponent,
    LiteralTextareaComponent,
    CurrentStatusComponent,
    ProposedStatusTableDropdownComponent,
    HierarchicalCommentListitemComponent,
    LiteralMultilanguageComponent,
    CommentRoundDateRangeInputComponent,
    LocalizableUndefinedTextareaComponent,
    IntegrationResourceListItemComponent,
    IntegrationResourceVirtualScrollerComponent,
    CookieCleanupComponent
  ],
  entryComponents: [
    SearchLinkedContainerModalComponent,
    SearchLinkedIntegrationResourceMultiModalComponent,
    SearchLinkedOrganizationModalComponent,
    AddTempUsersModalComponent
  ],
  imports: [
    YtiCommonModule.forRoot({
      url: environment.url,
      realm: environment.realm,
      clientId: environment.clientId
    }),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false, relativeLinkResolution: 'legacy' }),
    NgbModule,
    ClipboardModule,
    AutosizeModule,
    VirtualScrollerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useFactory: createMissingTranslationHandler },
    })
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initApp, deps: [ConfigurationService], multi: true },
    { provide: AUTHENTICATED_USER_ENDPOINT, useFactory: resolveAuthenticatedUserEndpoint },
    { provide: LOCALIZER, useExisting: LanguageService },
    LanguageService,
    LocationService,
    AuthorizationManager,
    DataService,
    MessagingService,
    IntegrationResourceService,
    CommentsConfirmationModalService,
    ModalService,
    SearchLinkedContainerModalService,
    SearchLinkedIntegrationResourceMultiModalService,
    SearchLinkedOrganizationModalService,
    AddTempUsersModalService,
    CommentsErrorModalService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(router: Router,
              modalService: ModalService) {

    router.events.subscribe(event => {
      if (event instanceof ResolveEnd) {
        modalService.closeAllModals();
      }
    });
  }
}
