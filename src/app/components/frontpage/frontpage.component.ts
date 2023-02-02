import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommentRound } from '../../entities/commentround';
import { LocationService } from '../../services/location.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, concat, Subscription } from 'rxjs';
import { Organization } from '../../entities/organization';
import { FilterOptions, comparingLocalizable, comparingPrimitive, labelNameToResourceIdIdentifier, Option, ignoreModalClose, UserService } from '@mju-psi/yti-common-ui';
import { TranslateService } from '@ngx-translate/core';
import { allCommentRoundStatuses, CommentRoundStatus } from '../../entities/comment-round-status';
import { LanguageService } from '../../services/language.service';
import { OrganizationSimple } from '../../entities/organization-simple';
import { debounceTime, flatMap, skip, take, tap } from 'rxjs/operators';
import { containerTypes } from '../common/containertypes';
import { IntegrationResource } from '../../entities/integration-resource';
import { IntegrationResourceService } from '../../services/integrationresource.service';
import { SearchLinkedContainerModalService } from '../form/search-linked-integration-container-modal.component';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})
export class FrontpageComponent implements OnInit, OnDestroy {

  commentRounds: CommentRound[];

  searchInProgress = true;

  statusOptions: FilterOptions<CommentRoundStatus>;
  organizationOptions: FilterOptions<OrganizationSimple>;
  containerTypeOptions: FilterOptions<string>;

  searchTerm$ = new BehaviorSubject('');
  status$ = new BehaviorSubject<CommentRoundStatus | null>(null);
  organization$ = new BehaviorSubject<Organization | null>(null);
  containerType$ = new BehaviorSubject<string | null>(null);

  private subscriptionToClean: Subscription[] = [];

  searchError = false;

  constructor(private dataService: DataService,
              private integrationResourceService: IntegrationResourceService,
              private locationService: LocationService,
              private authorizationManager: AuthorizationManager,
              private userService: UserService,
              private router: Router,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private searchLinkedContainerModalService: SearchLinkedContainerModalService) {

    locationService.atFrontPage();
  }

  ngOnInit() {

    this.subscriptionToClean.push(combineLatest(this.dataService.getOrganizationsWithCommentRounds(), this.languageService.language$)
      .subscribe(([organizations]) => {
        this.organizationOptions = [null, ...organizations].map(organization => ({
          value: organization,
          name: () => organization ? this.languageService.translate(organization.prefLabel, true)
            : this.translateService.instant('All organizations'),
          idIdentifier: () => organization ? labelNameToResourceIdIdentifier(this.languageService.translate(organization.prefLabel, true))
            : 'all_selected'
        }));
        this.organizationOptions.sort(comparingLocalizable<Option<Organization>>(this.languageService, organization =>
          organization.value ? organization.value.prefLabel : {}));
      }));

    this.statusOptions = [null, ...allCommentRoundStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    this.containerTypeOptions = [null, ...containerTypes].map(containerType => ({
      value: containerType,
      name: () => this.translateService.instant(containerType ? containerType : 'All tools'),
      idIdentifier: () => containerType ? containerType : 'all_selected'
    }));

    const initialSearchTerm = this.searchTerm$.pipe(take(1));
    const debouncedSearchTerm = this.searchTerm$.pipe(skip(1), debounceTime(500));
    const searchTerm$ = concat(initialSearchTerm, debouncedSearchTerm);

    combineLatest(this.status$, this.organization$, this.containerType$, searchTerm$)
      .pipe(
        tap(() => this.searchInProgress = true),
        flatMap(([status, organization, containerType, searchTerm]) => {
          const organizationId = organization ? organization.id : null;
          return this.dataService.getCommentRounds(organizationId, status, containerType, searchTerm, true, true);
        }),
        tap(() => this.searchInProgress = false)
      )
      .subscribe(results => {
        this.commentRounds = results;
        this.commentRounds.sort(comparingPrimitive<CommentRound>(commentRound =>
          commentRound.label.toLowerCase()));
      });
  }

  get loading(): boolean {

    return this.commentRounds == null;
  }

  isLoggedIn() {

    return this.userService.isLoggedIn();
  }

  canCreateCommentRound() {

    return this.authorizationManager.canCreateCommentRound();
  }

  storeSourceAndNavigateToCreateCommentRound(integrationResource: IntegrationResource) {

    this.integrationResourceService.addIntegrationResource(integrationResource);

    this.router.navigate([
      'createround',
      {
        integrationResourceUri: integrationResource.uri
      }
    ]);

  }

  createNewCommentRound() {

    this.searchLinkedContainerModalService
      .open(null, [], true)
      .then(source => this.storeSourceAndNavigateToCreateCommentRound(source), ignoreModalClose);
  }

  ngOnDestroy(): void {

    this.subscriptionToClean.forEach(s => s.unsubscribe());
  }

  get searchTerm(): string {
    return this.searchTerm$.getValue();
  }

  set searchTerm(value: string) {
    this.searchTerm$.next(value);
  }
}
